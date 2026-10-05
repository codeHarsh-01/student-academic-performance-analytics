const bcrypt = require('bcryptjs');
const { getPool } = require('../_db');
const { verifyAuth } = require('../_middleware');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const auth = verifyAuth(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (auth.user.role !== 'FACULTY' && auth.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only faculty and administrators can upload batch data.' });
    }

    const { studentsBatch } = req.body || {};
    if (!Array.isArray(studentsBatch) || !studentsBatch.length) {
        return res.status(400).json({ error: 'studentsBatch must be a non-empty array of student objects.' });
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Fetch weights
        const weightRes = await client.query('SELECT attendance_weight, marks_weight, backlog_weight FROM risk_configurations WHERE active_status = TRUE LIMIT 1;');
        const a = weightRes.rows[0] ? parseFloat(weightRes.rows[0].attendance_weight) : 40;
        const b = weightRes.rows[0] ? parseFloat(weightRes.rows[0].marks_weight) : 40;
        const c = weightRes.rows[0] ? parseFloat(weightRes.rows[0].backlog_weight) : 20;

        const defaultHash = await bcrypt.hash('student123', 10);
        let count = 0;

        for (const s of studentsBatch) {
            const erpId = s.erpId?.trim().toUpperCase();
            const rollNo = (s.rollNumber || s.rollNo || ('210133010' + String(Math.floor(Math.random() * 9000) + 1000))).toString().trim();
            const name = s.name?.trim();
            const total = Math.max(1, parseInt(s.totalClasses || s.total_classes || s.total_classes_held || 60));
            const attended = Math.max(0, parseInt(s.attended !== undefined ? s.attended : (s.classes_attended !== undefined ? s.classes_attended : (s.attendance ? Math.round(total * (parseFloat(s.attendance) / 100)) : 50))));
            const att = parseFloat(s.attendance !== undefined ? s.attendance : ((attended / total) * 100).toFixed(2));
            const avg = parseFloat(s.averageScore !== undefined ? s.averageScore : (s.marksPct !== undefined ? s.marksPct : (s.marks !== undefined ? s.marks : 0)));
            const back = parseInt(s.backlogs !== undefined ? s.backlogs : (s.active_backlogs !== undefined ? s.active_backlogs : 0));
            const section = s.section?.trim() || 'CSE-R-A';
            const semester = parseInt(s.semester) || 5;

            if (!erpId || !name) continue;

            // Compute risk with active weights
            let score = 0;
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

            // 1. Insert/Find user
            const uRes = await client.query(`
                INSERT INTO users (email, password_hash, role, erp_id)
                VALUES ($1, $2, 'STUDENT', $3)
                ON CONFLICT (erp_id) DO UPDATE SET email = EXCLUDED.email
                RETURNING id;
            `, [`${erpId.toLowerCase()}@niet.co.in`, defaultHash, erpId]);
            const uId = uRes.rows[0].id;

            // 2. Insert into student_profiles
            await client.query(`
                INSERT INTO student_profiles (user_id, name, erp_id, roll_number, section, semester, mentor_email)
                VALUES ($1, $2, $3, $4, $5, $6, 'faculty@niet.co.in')
                ON CONFLICT (user_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    roll_number = EXCLUDED.roll_number,
                    section = EXCLUDED.section,
                    semester = EXCLUDED.semester;
            `, [uId, name, erpId, rollNo, section, semester]);

            // 3. Insert into academic_metrics
            await client.query(`
                INSERT INTO academic_metrics 
                (student_id, total_classes_held, classes_attended, attendance_pct, internal_marks_pct, active_backlogs, risk_score, risk_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (student_id) DO UPDATE SET
                    total_classes_held = EXCLUDED.total_classes_held,
                    classes_attended = EXCLUDED.classes_attended,
                    attendance_pct = EXCLUDED.attendance_pct,
                    internal_marks_pct = EXCLUDED.internal_marks_pct,
                    active_backlogs = EXCLUDED.active_backlogs,
                    risk_score = EXCLUDED.risk_score,
                    risk_status = EXCLUDED.risk_status,
                    updated_at = CURRENT_TIMESTAMP;
            `, [uId, total, attended, att, avg, back, score, status]);

            // 4. Backward compatibility with students_profile
            await client.query(`
                INSERT INTO students_profile (user_id, roll_number, name, section, semester, attendance_percentage, backlogs_count, average_score, calculated_risk_score, risk_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (roll_number) DO UPDATE SET
                    attendance_percentage = $6,
                    backlogs_count = $7,
                    average_score = $8,
                    calculated_risk_score = $9,
                    risk_status = $10,
                    updated_at = CURRENT_TIMESTAMP;
            `, [uId, rollNo, name, section, semester, att, back, avg, score, status]);

            count++;
        }

        // Audit log
        await client.query(`
            INSERT INTO erp_sync_audit (source, records_processed, records_succeeded, sync_metadata)
            VALUES ('ADMIN_BULK_UPLOAD', $1, $2, $3);
        `, [studentsBatch.length, count, JSON.stringify({ uploadedBy: auth.user.email })]);

        await client.query('COMMIT');
        return res.status(200).json({
            success: true,
            importedCount: count,
            message: `Successfully registered and scored ${count} student records with automated credentials.`
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Bulk upload error:', err);
        return res.status(500).json({ error: 'Database bulk ingestion failed' });
    } finally {
        client.release();
    }
};
