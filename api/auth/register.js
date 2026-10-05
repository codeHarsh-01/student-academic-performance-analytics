const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../_db');
const { JWT_SECRET } = require('../_middleware');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const {
        name,
        email,
        password,
        erpId,
        rollNumber,
        section = 'CSE-R-A',
        semester = 5,
        totalClassesHeld = 60,
        classesAttended = 50,
        internalMarksPct = 75,
        activeBacklogs = 0
    } = req.body || {};

    if (!name || !email || !password || !erpId || !rollNumber) {
        return res.status(400).json({ error: 'Full name, email, password, ERP ID, and Roll Number are required.' });
    }

    const val1 = parseInt(totalClassesHeld) || 60;
    const val2 = parseInt(classesAttended) || 0;
    // Classes Attended is always <= Total Classes Held
    const total = Math.max(1, Math.max(val1, val2));
    const attended = Math.max(0, Math.min(val1, val2));
    const attendancePct = parseFloat(((attended / total) * 100).toFixed(2));
    const marksPct = parseFloat((parseFloat(internalMarksPct) || 0).toFixed(2));
    const backlogs = Math.max(0, parseInt(activeBacklogs) || 0);

    // Dynamic 40/40/20 Risk Score Calculation
    let riskScore = 0;
    if (attendancePct < 60) riskScore += 40;
    else if (attendancePct < 75) riskScore += 28;

    if (marksPct < 40) riskScore += 40;
    else if (marksPct < 55) riskScore += 24;

    if (backlogs >= 2) riskScore += 20;
    else if (backlogs === 1) riskScore += 10;

    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskStatus = 'LOW';
    if (riskScore >= 50) riskStatus = 'CRITICAL';
    else if (riskScore >= 25) riskStatus = 'WARNING';

    // Hash password BEFORE connecting to database to minimize pool connection hold time
    const passwordHash = await bcrypt.hash(password, 10);

    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if email or erpId already exists
        const check = await client.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(erp_id) = LOWER($2)',
            [email.trim(), erpId.trim()]
        );
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'A student account with this Email or ERP ID already exists. Please sign in.' });
        }

        // Check if rollNumber already exists
        const rollCheck = await client.query(
            'SELECT user_id FROM student_profiles WHERE roll_number = $1',
            [rollNumber.trim()]
        );
        if (rollCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'A student profile with this Roll Number is already registered.' });
        }

        // 1. Insert into users
        const userRes = await client.query(`
            INSERT INTO users (email, password_hash, role, erp_id)
            VALUES ($1, $2, 'STUDENT', $3)
            RETURNING id;
        `, [email.trim().toLowerCase(), passwordHash, erpId.trim().toUpperCase()]);
        const userId = userRes.rows[0].id;

        // 2. Insert into student_profiles
        await client.query(`
            INSERT INTO student_profiles (user_id, name, erp_id, roll_number, section, semester, mentor_email)
            VALUES ($1, $2, $3, $4, $5, $6, 'faculty@niet.co.in')
            ON CONFLICT (user_id) DO UPDATE SET
                name = EXCLUDED.name,
                roll_number = EXCLUDED.roll_number;
        `, [userId, name.trim(), erpId.trim().toUpperCase(), rollNumber.trim(), section.trim(), parseInt(semester)]);

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
                risk_status = EXCLUDED.risk_status;
        `, [userId, total, attended, attendancePct, marksPct, backlogs, riskScore, riskStatus]);

        // 4. Backward compatibility with students_profile
        await client.query(`
            INSERT INTO students_profile (user_id, roll_number, name, section, semester, attendance_percentage, backlogs_count, average_score, calculated_risk_score, risk_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id) DO UPDATE SET
                name = EXCLUDED.name,
                roll_number = EXCLUDED.roll_number;
        `, [userId, rollNumber.trim(), name.trim(), section.trim(), parseInt(semester), attendancePct, backlogs, marksPct, riskScore, riskStatus]);

        await client.query('COMMIT');

        // Generate immediate JWT
        const token = jwt.sign({
            sub: userId,
            role: 'STUDENT',
            erpId: erpId.trim().toUpperCase(),
            email: email.trim().toLowerCase(),
            displayName: name.trim()
        }, JWT_SECRET, { expiresIn: '24h' });

        return res.status(201).json({
            success: true,
            message: 'Student registration successful!',
            token,
            user: {
                id: userId,
                role: 'STUDENT',
                erpId: erpId.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
                name: name.trim(),
                section: section.trim(),
                semester: parseInt(semester)
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Database transaction failed during registration: ' + (err.message || '') });
    } finally {
        client.release();
    }
};
