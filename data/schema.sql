-- ====================================================================
-- NIET Student Academic Performance Analytics System
-- Enterprise Relational Database Schema (PostgreSQL & SQLite Compatible)
-- Course: CCSEH0355 | NIET Greater Noida (Autonomous Institute)
-- Target: SDG 4 (Quality Education)
-- ====================================================================

-- 1. USERS & ROLE-BASED ACCESS CONTROL (RBAC)
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'FACULTY', 'STUDENT')),
    erp_reference_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 2. ACADEMIC DEPARTMENTS & SECTIONS
CREATE TABLE IF NOT EXISTS departments (
    dept_id VARCHAR(20) PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    hod_name VARCHAR(100)
);

-- 3. STUDENTS CORE REGISTRY
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(36) PRIMARY KEY,
    erp_id VARCHAR(30) UNIQUE NOT NULL,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department_id VARCHAR(20) REFERENCES departments(dept_id),
    section VARCHAR(10) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    current_cgpa NUMERIC(4, 2) DEFAULT 0.00,
    overall_attendance NUMERIC(5, 2) DEFAULT 0.00,
    risk_level VARCHAR(20) DEFAULT 'LOW_RISK' CHECK (risk_level IN ('LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK')),
    risk_score INT DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. COURSES & SYLLABUS REGISTRY
CREATE TABLE IF NOT EXISTS courses (
    course_code VARCHAR(20) PRIMARY KEY,
    course_name VARCHAR(120) NOT NULL,
    credits INT NOT NULL DEFAULT 4,
    semester INT NOT NULL,
    is_core BOOLEAN DEFAULT TRUE,
    faculty_mentor VARCHAR(100)
);

-- 5. ASSESSMENTS & MARKS LOG
CREATE TABLE IF NOT EXISTS assessment_records (
    record_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(student_id) ON DELETE CASCADE,
    course_code VARCHAR(20) REFERENCES courses(course_code),
    assessment_type VARCHAR(30) NOT NULL,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    letter_grade VARCHAR(5) NOT NULL,
    exam_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ATTENDANCE EVENT LOGS
CREATE TABLE IF NOT EXISTS attendance_logs (
    log_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(student_id) ON DELETE CASCADE,
    course_code VARCHAR(20) REFERENCES courses(course_code),
    total_classes INT NOT NULL,
    attended_classes INT NOT NULL,
    attendance_percentage NUMERIC(5, 2) NOT NULL,
    is_shortage BOOLEAN GENERATED ALWAYS AS (attendance_percentage < 75.0) STORED,
    month_year VARCHAR(7)
);

-- 7. AT-RISK EVALUATION AUDIT TRAIL
CREATE TABLE IF NOT EXISTS risk_evaluations (
    evaluation_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(student_id) ON DELETE CASCADE,
    risk_score INT NOT NULL,
    risk_category VARCHAR(20) NOT NULL,
    attendance_weight INT NOT NULL DEFAULT 40,
    academic_weight INT NOT NULL DEFAULT 40,
    backlog_weight INT NOT NULL DEFAULT 20,
    identified_factors TEXT NOT NULL,
    recommended_interventions TEXT NOT NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evaluated_by VARCHAR(50) DEFAULT 'ALGORITHM_V2'
);

-- 8. NIET ICLOUDEMS ERP INTEGRATION AUDIT
CREATE TABLE IF NOT EXISTS erp_sync_audit (
    sync_id VARCHAR(36) PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    records_synced INT NOT NULL,
    sync_status VARCHAR(20) NOT NULL,
    latency_ms INT,
    initiated_by VARCHAR(50) NOT NULL,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_student_erp ON students(erp_id);
CREATE INDEX IF NOT EXISTS idx_student_risk ON students(risk_level, risk_score);
CREATE INDEX IF NOT EXISTS idx_assessment_student ON assessment_records(student_id, course_code);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_logs(student_id);
