package com.niet.analytics;

import com.niet.analytics.model.*;
import com.niet.analytics.service.PerformanceAnalyticsEngine;
import com.niet.analytics.service.RiskScoringAlgorithm;

import java.util.List;

/**
 * Self-contained verification and test suite for the Academic Performance Analytics System.
 * Tests boundary conditions, risk scoring rules, and statistical computations.
 */
public class RiskScoringAlgorithmTest {

    public static void main(String[] args) {
        System.out.println("Running Automated Test Suite for NIET Academic Analytics...\n");

        testLowRiskStudent();
        testAttendanceShortageRisk();
        testCriticalDebarmentRisk();
        testAcademicFailureAndTrajectoryRisk();
        testCohortAggregation();

        System.out.println("\n[PASS] All Automated Tests Passed Successfully!");
    }

    private static void testLowRiskStudent() {
        System.out.print("Test 1: Low Risk / Good Standing Student... ");
        Student s = new Student("T1", "Aashi Goel", "aashi@niet.co.in", "CSE-R", "9876543201",
                "2501331690001", "2501331690001", 3, "CSE-R", "2024-2028");

        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 1", 90.0, 100.0));
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 2", 92.0, 100.0));
        s.recordAttendance(new AttendanceRecord("CCSEH0355", 40, 38)); // 95% attendance

        RiskScoringAlgorithm algo = new RiskScoringAlgorithm();
        RiskReport report = algo.evaluateStudent(s);

        assert report.getRiskLevel() == RiskLevel.LOW_RISK : "Expected LOW_RISK but got " + report.getRiskLevel();
        assert report.getCompositeRiskScore() < 25.0 : "Expected risk score < 25 but got " + report.getCompositeRiskScore();
        System.out.println("PASSED (Score: " + report.getCompositeRiskScore() + ")");
    }

    private static void testAttendanceShortageRisk() {
        System.out.print("Test 2: Attendance Shortage (< 75%) Risk... ");
        Student s = new Student("T2", "Rohan Sharma", "rohan@niet.co.in", "CSE-R", "9876543202",
                "2501331690045", "2501331690045", 3, "CSE-R", "2024-2028");

        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 1", 65.0, 100.0));
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 2", 68.0, 100.0));
        s.recordAttendance(new AttendanceRecord("CCSEH0355", 40, 28)); // 70% attendance (< 75%)

        RiskScoringAlgorithm algo = new RiskScoringAlgorithm();
        RiskReport report = algo.evaluateStudent(s);

        assert report.getRiskLevel() == RiskLevel.MODERATE_RISK : "Expected MODERATE_RISK but got " + report.getRiskLevel();
        assert report.getRiskFactors().stream().anyMatch(f -> f.contains("75%")) : "Expected attendance shortage factor";
        System.out.println("PASSED (Level: " + report.getRiskLevel() + ")");
    }

    private static void testCriticalDebarmentRisk() {
        System.out.print("Test 3: Critical Debarment Risk (< 60% Attendance)... ");
        Student s = new Student("T3", "Aditya Dixit", "aditya@niet.co.in", "CSE-R", "9876543203",
                "2501331690052", "2501331690052", 3, "CSE-R", "2024-2028");

        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 1", 35.0, 100.0)); // Failing
        s.recordAttendance(new AttendanceRecord("CCSEH0355", 40, 20)); // 50% attendance (< 60%)

        RiskScoringAlgorithm algo = new RiskScoringAlgorithm();
        RiskReport report = algo.evaluateStudent(s);

        assert report.getRiskLevel() == RiskLevel.HIGH_RISK : "Expected HIGH_RISK but got " + report.getRiskLevel();
        assert report.getCompositeRiskScore() >= 50.0 : "Expected risk score >= 50 but got " + report.getCompositeRiskScore();
        System.out.println("PASSED (Risk Score: " + report.getCompositeRiskScore() + ")");
    }

    private static void testAcademicFailureAndTrajectoryRisk() {
        System.out.print("Test 4: Downward Trajectory Detection (> 15% Drop)... ");
        Student s = new Student("T4", "Vikram Rathore", "vikram@niet.co.in", "CSE-R", "9876543204",
                "2501331690060", "2501331690060", 3, "CSE-R", "2024-2028");

        // 70% down to 45% (Drop of 25% > 15%)
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 1", 70.0, 100.0));
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 2", 45.0, 100.0));
        s.recordAttendance(new AttendanceRecord("CCSEH0355", 40, 32)); // 80%

        RiskScoringAlgorithm algo = new RiskScoringAlgorithm();
        RiskReport report = algo.evaluateStudent(s);

        assert report.getRiskFactors().stream().anyMatch(f -> f.contains("downward")) : "Expected downward trajectory flag";
        System.out.println("PASSED (Downward trajectory captured)");
    }

    private static void testCohortAggregation() {
        System.out.print("Test 5: Cohort Metrics Aggregation... ");
        List<Student> students = com.niet.analytics.repository.DataImporter.createDefaultSeedDataset();
        PerformanceAnalyticsEngine engine = new PerformanceAnalyticsEngine();

        var metrics = engine.calculateCohortMetrics(students);
        assert (int) metrics.get("totalStudents") == 12 : "Expected 12 seed students";
        assert (double) metrics.get("averageScore") > 0.0 : "Average score must be > 0";
        assert (int) metrics.get("atRiskCount") > 0 : "At risk count must be > 0";
        System.out.println("PASSED (Cohort size: " + metrics.get("totalStudents") + ", Avg Score: " + metrics.get("averageScore") + "%)");
    }
}
