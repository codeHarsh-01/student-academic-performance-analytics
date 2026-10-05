const { getPool } = require('../_db');
const { verifyAuth } = require('../_middleware');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    const auth = verifyAuth(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (auth.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only HOD / Department Administrators can modify risk algorithm weights.' });
    }

    const { attendanceWeight, marksWeight, backlogWeight } = req.body || {};
    const a = parseFloat(attendanceWeight);
    const b = parseFloat(marksWeight);
    const c = parseFloat(backlogWeight);

    if (isNaN(a) || isNaN(b) || isNaN(c) || (a + b + c !== 100)) {
        return res.status(400).json({ error: 'Weights must be numeric and sum up to exactly 100%.' });
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Update active weights
        await client.query('UPDATE risk_configurations SET active_status = FALSE;');
        await client.query(`
            INSERT INTO risk_configurations (attendance_weight, marks_weight, backlog_weight, active_status)
            VALUES ($1, $2, $3, TRUE);
        `, [a, b, c]);

        // Recalculate all students
        const studentsRes = await client.query('SELECT id, attendance_percentage, average_score, backlogs_count FROM students_profile;');

        for (const s of studentsRes.rows) {
            let score = 0;
            const att = parseFloat(s.attendance_percentage);
            const avg = parseFloat(s.average_score);
            const back = parseInt(s.backlogs_count);

            if (att < 60) score += a;
            else if (att < 75) score += Math.round(a * 0.7);

            if (avg < 40) score += b;
            else if (avg < 55) score += Math.round(b * 0.6);

            if (back >= 2) score += c;
            else if (back === 1) score += Math.round(c * 0.5);

            score = Math.min(100, Math.max(0, Math.round(score)));
            let status = 'LOW';
            if (score >= 50) status = 'CRITICAL';
            else if (score >= 25) status = 'WARNING';

            await client.query(`
                UPDATE students_profile
                SET calculated_risk_score = $1, risk_status = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3;
            `, [score, status, s.id]);
        }

        await client.query('COMMIT');
        return res.status(200).json({
            success: true,
            message: 'Weights successfully updated in Supabase database. Cohort risk scores recalculated.'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Risk weight update error:', err);
        return res.status(500).json({ error: 'Failed to update weights in database' });
    } finally {
        client.release();
    }
};
