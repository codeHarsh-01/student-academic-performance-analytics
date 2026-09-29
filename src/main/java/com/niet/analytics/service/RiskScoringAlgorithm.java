package com.niet.analytics.service;

import com.niet.analytics.model.*;

import java.util.*;

/**
 * Multi-Factor Risk Scoring and Early At-Risk Identification Algorithm.
 * Combines attendance metrics, assessment scores, failed subject counts,
 * and negative trajectory tracking into a composite risk index (0 - 100).
 */
public class RiskScoringAlgorithm {

    // Thresholds configured for university academic policies
    public static final double ATTENDANCE_MANDATORY_THRESHOLD = 75.0;
    public static final double ATTENDANCE_CRITICAL_THRESHOLD = 60.0;
    public static final double PASSING_SCORE_THRESHOLD = 40.0;
    public static final double BORDERLINE_SCORE_THRESHOLD = 55.0;

    public static final double HIGH_RISK_CUTOFF = 50.0;
    public static final double MODERATE_RISK_CUTOFF = 25.0;

    /**
     * Evaluates an individual student and generates a comprehensive RiskReport.
     *
     * @param student the Student object to assess
     * @return RiskReport detailing risk score, category, factors, and interventions
     */
    public RiskReport evaluateStudent(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student cannot be null for risk evaluation.");
        }

        double attendance = student.calculateOverallAttendancePercentage();
        double avgScore = student.calculateAverageScorePercentage();
        int failingCount = student.countFailingAssessments();

        double riskScore = 0.0;
        List<String> factors = new ArrayList<>();
        List<String> interventions = new ArrayList<>();

        // 1. Attendance Analysis
        if (attendance < ATTENDANCE_CRITICAL_THRESHOLD) {
            riskScore += 50.0;
            factors.add(String.format("Critical attendance shortage: %.1f%% (Debarment Risk)", attendance));
            interventions.add("Immediate parental notification and mandatory meeting with Head of Department / Proctor.");
            interventions.add("Submit medical or legitimate leave documentation to verify eligibility.");
        } else if (attendance < ATTENDANCE_MANDATORY_THRESHOLD) {
            riskScore += 35.0;
            factors.add(String.format("Attendance below university 75%% mandatory threshold: %.1f%%", attendance));
            interventions.add("Issue formal attendance warning notice; target 100% attendance in remaining lectures.");
        } else if (attendance < 80.0) {
            riskScore += 10.0;
            factors.add(String.format("Borderline attendance: %.1f%% (close to warning zone)", attendance));
        }

        // 2. Academic Score & Grade Analysis
        if (avgScore < PASSING_SCORE_THRESHOLD) {
            riskScore += 40.0;
            factors.add(String.format("Failing average assessment score: %.1f%%", avgScore));
            interventions.add("Enroll in mandatory remedial tutorial classes and weekly doubt clearing.");
        } else if (avgScore < BORDERLINE_SCORE_THRESHOLD) {
            riskScore += 22.0;
            factors.add(String.format("Academic performance in borderline passing zone: %.1f%%", avgScore));
            interventions.add("Provide specialized practice assignments and study material.");
        } else if (avgScore < 65.0) {
            riskScore += 10.0;
        }

        // 3. Failing Assessment Penalty
        if (failingCount > 0) {
            double penalty = Math.min(30.0, failingCount * 12.0);
            riskScore += penalty;
            factors.add(String.format("Failing in %d individual assessment(s)", failingCount));
            interventions.add("Pair with senior student peer-mentor for struggling topics.");
        }

        // 4. Downward Trajectory Analysis (Trend Detection)
        boolean hasDownwardTrend = detectDownwardTrend(student);
        if (hasDownwardTrend) {
            riskScore += 15.0;
            factors.add("Steep downward grade trajectory detected between successive assessments");
            interventions.add("Schedule 1-on-1 academic advisor counseling to diagnose root cause.");
        }

        // Cap score at 100
        riskScore = Math.min(100.0, Math.max(0.0, riskScore));

        // Determine Risk Category
        RiskLevel level;
        if (riskScore >= HIGH_RISK_CUTOFF) {
            level = RiskLevel.HIGH_RISK;
        } else if (riskScore >= MODERATE_RISK_CUTOFF) {
            level = RiskLevel.MODERATE_RISK;
        } else {
            level = RiskLevel.LOW_RISK;
            if (factors.isEmpty()) {
                factors.add("Consistent attendance and good academic performance across subjects");
            }
            interventions.add("Maintain current study pace; participate in competitive coding and hackathons.");
        }

        RiskReport report = new RiskReport(
                student.getId(),
                student.getName(),
                student.getErpId(),
                student.getSection(),
                student.getSemester(),
                attendance,
                avgScore,
                failingCount,
                riskScore,
                level
        );

        for (String factor : factors) {
            report.addRiskFactor(factor);
        }
        for (String intervention : interventions) {
            report.addIntervention(intervention);
        }

        return report;
    }

    /**
     * Detects if the student has a steep negative trend (> 15% drop) in marks
     * across consecutive assessments of the same course.
     */
    private boolean detectDownwardTrend(Student student) {
        Map<String, List<GradeRecord>> byCourse = new HashMap<>();
        for (GradeRecord record : student.getGradeRecords()) {
            byCourse.computeIfAbsent(record.getCourseCode(), k -> new ArrayList<>()).add(record);
        }

        for (List<GradeRecord> courseGrades : byCourse.values()) {
            if (courseGrades.size() >= 2) {
                for (int i = 1; i < courseGrades.size(); i++) {
                    double prev = courseGrades.get(i - 1).getPercentage();
                    double curr = courseGrades.get(i).getPercentage();
                    if (prev - curr >= 15.0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
