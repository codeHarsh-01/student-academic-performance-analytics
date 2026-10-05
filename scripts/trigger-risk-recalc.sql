-- ====================================================================
-- NIET Student Academic Performance & Risk Intelligence System
-- Automated ERP Sync & Multi-Factor Risk Calculation Trigger
-- Formula: 40% Attendance + 40% Assessment Marks + 20% Backlogs
-- Target: Zero-maintenance In-Database Recalculation & Supabase Realtime
-- ====================================================================

-- 1. Create or Replace Risk Recalculation Trigger Function
CREATE OR REPLACE FUNCTION fn_recalculate_student_risk()
RETURNS TRIGGER AS $$
DECLARE
    v_att_pct NUMERIC(5, 2);
    v_marks_pct NUMERIC(5, 2);
    v_backlogs INT;
    v_att_score INT := 0;
    v_marks_score INT := 0;
    v_backlog_score INT := 0;
    v_total_score INT := 0;
    v_status VARCHAR(20) := 'LOW';
    v_total INT;
    v_attended INT;
BEGIN
    -- Normalization: total classes and classes attended
    v_total := GREATEST(0, COALESCE(NEW.total_classes_held, 0));
    v_attended := GREATEST(0, COALESCE(NEW.classes_attended, 0));
    
    -- Ensure consistency if attended exceeds total
    IF v_attended > v_total THEN
        v_total := v_attended;
        NEW.total_classes_held := v_total;
    END IF;

    -- Calculate attendance percentage
    IF v_total > 0 THEN
        v_att_pct := ROUND(((v_attended::NUMERIC / v_total::NUMERIC) * 100.0), 2);
    ELSE
        v_att_pct := COALESCE(NEW.attendance_pct, 100.00);
    END IF;
    NEW.attendance_pct := v_att_pct;

    v_marks_pct := COALESCE(NEW.internal_marks_pct, 75.00);
    v_backlogs := GREATEST(0, COALESCE(NEW.active_backlogs, 0));

    -- Multi-Factor Component 1: Attendance Risk (Weight 40 points)
    -- Under 60%  -> Full 40 pts risk (High severity)
    -- 60% - 74.9% -> 28 pts risk (70% of 40)
    -- 75% and up  -> 0 pts risk (Safe attendance zone)
    IF v_att_pct < 60.0 THEN
        v_att_score := 40;
    ELSIF v_att_pct < 75.0 THEN
        v_att_score := 28;
    ELSE
        v_att_score := 0;
    END IF;

    -- Multi-Factor Component 2: Academic Marks Risk (Weight 40 points)
    -- Under 40%  -> Full 40 pts risk (Critical academic deficit)
    -- 40% - 54.9% -> 24 pts risk (60% of 40)
    -- 55% and up  -> 0 pts risk (Acceptable academic standing)
    IF v_marks_pct < 40.0 THEN
        v_marks_score := 40;
    ELSIF v_marks_pct < 55.0 THEN
        v_marks_score := 24;
    ELSE
        v_marks_score := 0;
    END IF;

    -- Multi-Factor Component 3: Active Backlogs Risk (Weight 20 points)
    -- 2 or more backlogs -> Full 20 pts risk
    -- 1 backlog          -> 10 pts risk (50% of 20)
    -- 0 backlogs         -> 0 pts risk
    IF v_backlogs >= 2 THEN
        v_backlog_score := 20;
    ELSIF v_backlogs = 1 THEN
        v_backlog_score := 10;
    ELSE
        v_backlog_score := 0;
    END IF;

    -- Aggregate Multi-Factor Risk Score (Clamped between 0 and 100)
    v_total_score := LEAST(100, GREATEST(0, v_att_score + v_marks_score + v_backlog_score));
    NEW.risk_score := v_total_score;

    -- Assign Risk Status Level
    IF v_total_score >= 50 THEN
        v_status := 'CRITICAL';
    ELSIF v_total_score >= 25 THEN
        v_status := 'WARNING';
    ELSE
        v_status := 'LOW';
    END IF;
    NEW.risk_status := v_status;

    NEW.updated_at := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach Trigger to academic_metrics
DROP TRIGGER IF EXISTS trg_recalculate_student_risk ON academic_metrics;
CREATE TRIGGER trg_recalculate_student_risk
BEFORE INSERT OR UPDATE ON academic_metrics
FOR EACH ROW
EXECUTE FUNCTION fn_recalculate_student_risk();

-- 3. Synchronize with legacy students_profile table to ensure unified state
CREATE OR REPLACE FUNCTION fn_sync_legacy_student_profile()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students_profile
    SET attendance_percentage = NEW.attendance_pct,
        average_score = NEW.internal_marks_pct,
        backlogs_count = NEW.active_backlogs,
        calculated_risk_score = NEW.risk_score,
        risk_status = NEW.risk_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.student_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_legacy_profile ON academic_metrics;
CREATE TRIGGER trg_sync_legacy_profile
AFTER INSERT OR UPDATE ON academic_metrics
FOR EACH ROW
EXECUTE FUNCTION fn_sync_legacy_student_profile();

-- 4. Enable Supabase Realtime publication for academic_metrics, student_profiles, students_profile
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE academic_metrics;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE student_profiles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE students_profile;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
