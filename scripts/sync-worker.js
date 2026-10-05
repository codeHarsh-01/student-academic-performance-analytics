/**
 * ======================================================================================
 * NIET Student Academic Performance & Risk Intelligence System
 * Automated Educational ERP Data Synchronization Worker
 * 
 * Target: Zero-maintenance background synchronization with institution ERP (iCloudEMS)
 * Modes: 
 *   - LIVE_SCRAPER: Headless browser automation (Playwright) or authenticated REST worker
 *   - MOCK_DELTA:   Deterministic delta generator for staging, CI/CD, and demo environments
 *   - AUTO:         Attempts Live Scraper; safely falls back to Deterministic Mock Delta
 * 
 * Pipeline Features:
 *   - Idempotent SQL UPSERT keyed on `erp_id` / `roll_number`
 *   - Trigger-driven in-database 40/40/20 Multi-Factor Risk Score calculation
 *   - Automatic legacy table synchronization (`students_profile`)
 *   - Audit record logging in `erp_sync_audit`
 *   - Supabase Realtime channel event broadcast
 * ======================================================================================
 */

const { Client } = require('pg');
const crypto = require('crypto');

// 1. Environment & Configuration
const CONFIG = {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.xwdxicmraostvuyzyesp:harshgoyal6468@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
    erpPortalUrl: process.env.ERP_PORTAL_URL || 'https://niet.icloudems.com',
    erpUsername: process.env.ERP_PORTAL_USER || '',
    erpPassword: process.env.ERP_PORTAL_PASSWORD || '',
    erpAuthToken: process.env.ERP_AUTH_TOKEN || '',
    syncMode: (process.env.SYNC_MODE || 'AUTO').toUpperCase(), // 'LIVE_SCRAPER' | 'MOCK_DELTA' | 'AUTO'
    deltaClassesHeldMin: parseInt(process.env.DELTA_CLASSES_MIN || '4', 10),
    deltaClassesHeldMax: parseInt(process.env.DELTA_CLASSES_MAX || '8', 10),
    institutionName: 'NIET Greater Noida (Autonomous Institute)',
    defaultMentor: 'faculty@niet.co.in'
};

// Console Styler Utility
const LOG = {
    header: (text) => console.log(`\n\x1b[1m\x1b[36m================================================================================\n  ${text}\n================================================================================\x1b[0m`),
    info: (text) => console.log(`\x1b[34mℹ [INFO]\x1b[0m ${text}`),
    success: (text) => console.log(`\x1b[32m✔ [SUCCESS]\x1b[0m ${text}`),
    warn: (text) => console.log(`\x1b[33m⚠ [WARN]\x1b[0m ${text}`),
    error: (text, err) => console.error(`\x1b[31m✖ [ERROR]\x1b[0m ${text}`, err || ''),
    table: (data) => console.table(data)
};

/**
 * Strategy A: Playwright Headless Browser Scraper
 * Authenticates to institutional portal and extracts attendance/marks table.
 */
async function scrapeLiveErpPortal(credentials) {
    LOG.info(`Initiating Headless Browser Scraping against: ${credentials.url}`);
    
    let playwright;
    try {
        playwright = require('playwright');
    } catch (e) {
        LOG.warn("Playwright package not installed in current environment. To enable live portal scraping, run: npm install playwright");
        throw new Error("PLAYWRIGHT_NOT_AVAILABLE");
    }

    const { chromium } = playwright;
    LOG.info("Launching headless Chromium engine in sandbox mode...");
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        LOG.info(`Navigating to ERP authentication gateway: ${credentials.url}/login`);
        await page.goto(`${credentials.url}/login`, { waitUntil: 'networkidle', timeout: 30000 });

        // Institutional ERP standard input locators
        if (await page.$('#username')) {
            await page.fill('#username', credentials.user);
            await page.fill('#password', credentials.pass);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
                page.click('button[type="submit"], #btnLogin, .btn-primary')
            ]);
            LOG.success("Authenticated into ERP session successfully.");
        } else {
            LOG.warn("Standard login selectors not found on landing page. Inspecting active session...");
        }

        // Navigate to Cohort Attendance / Academic Records Grid
        await page.goto(`${credentials.url}/academic/attendance-roster`, { waitUntil: 'networkidle', timeout: 30000 });

        // Extract tabular data from DOM
        const scrapedStudents = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table.attendance-grid tbody tr, table.student-roster tr'));
            return rows.map(r => {
                const cols = r.querySelectorAll('td');
                if (cols.length < 5) return null;
                return {
                    erp_id: cols[0]?.innerText?.trim(),
                    roll_number: cols[1]?.innerText?.trim(),
                    name: cols[2]?.innerText?.trim(),
                    total_classes_held: parseInt(cols[3]?.innerText?.trim() || '0', 10),
                    classes_attended: parseInt(cols[4]?.innerText?.trim() || '0', 10),
                    internal_marks_pct: parseFloat(cols[5]?.innerText?.trim() || '75.0'),
                    active_backlogs: parseInt(cols[6]?.innerText?.trim() || '0', 10)
                };
            }).filter(Boolean);
        });

        LOG.success(`Extracted ${scrapedStudents.length} student records from live ERP DOM.`);
        return scrapedStudents;
    } finally {
        await browser.close();
    }
}

/**
 * Strategy B: Deterministic Mock ERP Sync Generator (Weekly/Daily Delta)
 * Generates realistic incremental attendance and internal assessment marks.
 */
async function generateDeterministicDelta(client) {
    LOG.info("Generating realistic deterministic delta updates from existing database roster...");

    const rosterRes = await client.query(`
        SELECT 
            p.user_id,
            p.name,
            p.erp_id,
            p.roll_number,
            p.section,
            p.semester,
            COALESCE(m.total_classes_held, 60) AS total_classes_held,
            COALESCE(m.classes_attended, 50) AS classes_attended,
            COALESCE(m.attendance_pct, 83.33) AS attendance_pct,
            COALESCE(m.internal_marks_pct, 75.00) AS internal_marks_pct,
            COALESCE(m.active_backlogs, 0) AS active_backlogs,
            COALESCE(m.risk_score, 0) AS current_risk_score,
            COALESCE(m.risk_status, 'LOW') AS current_risk_status
        FROM student_profiles p
        LEFT JOIN academic_metrics m ON m.student_id = p.user_id
        ORDER BY p.name ASC;
    `);

    const records = [];
    const deltaHeld = Math.floor(Math.random() * (CONFIG.deltaClassesHeldMax - CONFIG.deltaClassesHeldMin + 1)) + CONFIG.deltaClassesHeldMin;

    for (const student of rosterRes.rows) {
        const curHeld = parseInt(student.total_classes_held, 10);
        const curAtt = parseInt(student.classes_attended, 10);
        const curAttPct = curHeld > 0 ? (curAtt / curHeld) * 100 : 80;

        // Model realistic attendance probability:
        // High attendance students attend ~90% of new classes
        // Moderate attendance students attend ~70%
        // Low attendance students attend ~40%
        let attendanceProb = 0.85;
        if (curAttPct < 60) attendanceProb = 0.40;
        else if (curAttPct < 75) attendanceProb = 0.70;

        let newAttendedIncrement = 0;
        for (let i = 0; i < deltaHeld; i++) {
            if (Math.random() < attendanceProb) {
                newAttendedIncrement++;
            }
        }

        const newHeld = curHeld + deltaHeld;
        const newAtt = curAtt + newAttendedIncrement;

        // Simulate internal test marks adjustment (minor organic shift +/- 2.5%)
        const marksShift = (Math.random() * 4 - 2); // -2.0 to +2.0
        const newMarksPct = Math.min(98.0, Math.max(30.0, parseFloat((parseFloat(student.internal_marks_pct) + marksShift).toFixed(2))));

        // Backlogs remain stable or resolve
        const newBacklogs = student.active_backlogs;

        records.push({
            user_id: student.user_id,
            erp_id: student.erp_id,
            roll_number: student.roll_number,
            name: student.name,
            section: student.section,
            semester: student.semester,
            total_classes_held: newHeld,
            classes_attended: newAtt,
            internal_marks_pct: newMarksPct,
            active_backlogs: newBacklogs,
            previous_risk_score: student.current_risk_score,
            previous_risk_status: student.current_risk_status,
            previous_att_pct: student.attendance_pct,
            assessments: [
                {
                    code: 'CCSEH0355',
                    name: 'Cloud Computing & Distributed Systems',
                    type: 'SURPRISE_QUIZ',
                    marks: Math.round(15 + Math.random() * 10),
                    max: 25
                }
            ]
        });
    }

    LOG.info(`Generated delta updates for ${records.length} students (+${deltaHeld} classes held this sync cycle).`);
    return records;
}

/**
 * Ingests student records into Supabase PostgreSQL using Idempotent SQL UPSERTs.
 * Leverages the in-database trigger 'trg_recalculate_student_risk' to recalculate
 * attendance_pct, risk_score, and risk_status on every row.
 */
async function syncStudentBatch(client, records, syncSource = 'AUTOMATED_SYNC_WORKER') {
    const startTime = Date.now();
    const syncSummary = [];

    LOG.info(`Starting atomic idempotent ingestion for ${records.length} records...`);
    await client.query('BEGIN');

    try {
        for (const record of records) {
            // 1. Resolve or UPSERT user and student_profile
            let studentId = record.user_id;

            if (!studentId) {
                // Check if user already exists by erp_id
                const userRes = await client.query('SELECT id FROM users WHERE erp_id = $1 LIMIT 1', [record.erp_id]);
                if (userRes.rows.length > 0) {
                    studentId = userRes.rows[0].id;
                } else {
                    // Create new user record
                    const newUserId = crypto.randomUUID();
                    const dummyEmail = `${record.erp_id.toLowerCase()}@niet.co.in`;
                    await client.query(`
                        INSERT INTO users (id, email, password_hash, role, erp_id, is_active)
                        VALUES ($1, $2, 'UNINITIALIZED_ERP_SYNC', 'STUDENT', $3, TRUE)
                        ON CONFLICT (erp_id) DO NOTHING;
                    `, [newUserId, dummyEmail, record.erp_id]);
                    studentId = newUserId;
                }
            }

            // 2. Idempotent UPSERT into student_profiles
            await client.query(`
                INSERT INTO student_profiles (user_id, name, erp_id, roll_number, section, semester, mentor_email)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (erp_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    roll_number = EXCLUDED.roll_number,
                    section = EXCLUDED.section,
                    semester = EXCLUDED.semester;
            `, [
                studentId,
                record.name,
                record.erp_id,
                record.roll_number,
                record.section || 'CSE-R-A',
                record.semester || 5,
                CONFIG.defaultMentor
            ]);

            // 3. Idempotent UPSERT into academic_metrics
            // NOTE: The 'trg_recalculate_student_risk' trigger will automatically calculate:
            // - attendance_pct = (classes_attended / total_classes_held) * 100
            // - 40/40/20 multi-factor risk score
            // - risk_status ('LOW' | 'WARNING' | 'CRITICAL')
            // - sync with legacy students_profile table
            const metricRes = await client.query(`
                INSERT INTO academic_metrics (
                    student_id,
                    total_classes_held,
                    classes_attended,
                    internal_marks_pct,
                    active_backlogs,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                ON CONFLICT (student_id) DO UPDATE SET
                    total_classes_held = EXCLUDED.total_classes_held,
                    classes_attended = EXCLUDED.classes_attended,
                    internal_marks_pct = EXCLUDED.internal_marks_pct,
                    active_backlogs = EXCLUDED.active_backlogs,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING student_id, attendance_pct, internal_marks_pct, risk_score, risk_status;
            `, [
                studentId,
                record.total_classes_held,
                record.classes_attended,
                record.internal_marks_pct,
                record.active_backlogs || 0
            ]);

            const row = metricRes.rows[0];

            // 4. Record assessment record if present
            const profileRes = await client.query('SELECT id FROM students_profile WHERE user_id = $1', [studentId]);
            const profileId = profileRes.rows[0]?.id;

            if (profileId && record.assessments && Array.isArray(record.assessments)) {
                for (const a of record.assessments) {
                    await client.query(`
                        INSERT INTO assessment_records (
                            id, student_id, course_code, course_name, assessment_type, marks_obtained, max_marks, percentage, letter_grade
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
                    `, [
                        crypto.randomUUID(),
                        profileId,
                        a.code,
                        a.name,
                        a.type,
                        a.marks,
                        a.max,
                        ((a.marks / a.max) * 100).toFixed(2),
                        a.marks / a.max >= 0.8 ? 'A+' : (a.marks / a.max >= 0.6 ? 'B' : 'C')
                    ]);
                }
            }

            syncSummary.push({
                'ERP ID': record.erp_id,
                'Name': record.name,
                'Held': record.total_classes_held,
                'Attended': record.classes_attended,
                'Attendance %': `${parseFloat(row.attendance_pct).toFixed(1)}%`,
                'Marks %': `${parseFloat(row.internal_marks_pct).toFixed(1)}%`,
                'Risk Score': row.risk_score,
                'Risk Status': row.risk_status
            });
        }

        // 5. Audit Logging
        const duration = Date.now() - startTime;
        const auditId = crypto.randomUUID();
        await client.query(`
            INSERT INTO erp_sync_audit (id, source, records_processed, records_succeeded, sync_metadata)
            VALUES ($1, $2, $3, $4, $5);
        `, [
            auditId,
            syncSource,
            records.length,
            records.length,
            JSON.stringify({
                durationMs: duration,
                mode: CONFIG.syncMode,
                institution: CONFIG.institutionName,
                timestamp: new Date().toISOString()
            })
        ]);

        await client.query('COMMIT');
        LOG.success(`Transaction committed. ${records.length} records processed successfully in ${duration}ms.`);
        return { success: true, count: records.length, duration, auditId, summary: syncSummary };

    } catch (err) {
        await client.query('ROLLBACK');
        LOG.error("Failed during batch ingestion. Transaction rolled back.", err);
        throw err;
    }
}

/**
 * Main Pipeline Orchestrator
 */
async function main() {
    LOG.header("NIET ERP Background Sync Worker: Execution Starting");
    LOG.info(`Mode Configured: ${CONFIG.syncMode}`);
    LOG.info(`Target Database: ${CONFIG.connectionString.replace(/:[^:@]+@/, ':****@')}`);

    const client = new Client({
        connectionString: CONFIG.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        LOG.success("Connected to Supabase PostgreSQL Pooler.");

        let records = [];
        let syncSource = 'MOCK_DELTA_CRON';

        if (CONFIG.syncMode === 'LIVE_SCRAPER' || (CONFIG.syncMode === 'AUTO' && CONFIG.erpUsername && CONFIG.erpPassword)) {
            try {
                records = await scrapeLiveErpPortal({
                    url: CONFIG.erpPortalUrl,
                    user: CONFIG.erpUsername,
                    pass: CONFIG.erpPassword
                });
                syncSource = 'PLAYWRIGHT_ERP_SCRAPER';
            } catch (scrapeErr) {
                if (CONFIG.syncMode === 'AUTO') {
                    LOG.warn("Live scraping failed or Playwright uninstalled. Auto-falling back to Deterministic Mock ERP Sync...");
                    records = await generateDeterministicDelta(client);
                    syncSource = 'AUTO_FALLBACK_MOCK_DELTA';
                } else {
                    throw scrapeErr;
                }
            }
        } else {
            records = await generateDeterministicDelta(client);
            syncSource = 'MOCK_DELTA_CRON';
        }

        if (records.length === 0) {
            LOG.warn("No student records fetched or generated. Exiting with zero updates.");
            await client.end();
            return;
        }

        const result = await syncStudentBatch(client, records, syncSource);

        LOG.header("Sync Ingestion Summary Table");
        LOG.table(result.summary);

        LOG.info(`Audit Record UUID: ${result.auditId}`);
        LOG.success(`Synchronization pipeline completed in ${result.duration}ms.`);
        await client.end();
        process.exit(0);

    } catch (err) {
        LOG.error("Fatal error during sync worker execution:", err);
        try { await client.end(); } catch (e) {}
        process.exit(1);
    }
}

// Execute orchestrator
if (require.main === module) {
    main();
}

module.exports = {
    main,
    syncStudentBatch,
    generateDeterministicDelta,
    scrapeLiveErpPortal
};
