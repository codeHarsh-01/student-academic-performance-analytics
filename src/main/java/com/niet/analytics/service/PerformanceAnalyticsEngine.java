package com.niet.analytics.service;

import com.niet.analytics.model.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * High-performance statistical analytics engine.
 * Computes cohort KPIs, distributions, subject rankings, and class-level insights.
 * Demonstrates Unit 2: Collections Framework, Generics, and Streams.
 */
public class PerformanceAnalyticsEngine {

    private final RiskScoringAlgorithm riskAlgorithm;

    public PerformanceAnalyticsEngine() {
        this.riskAlgorithm = new RiskScoringAlgorithm();
    }

    public PerformanceAnalyticsEngine(RiskScoringAlgorithm riskAlgorithm) {
        this.riskAlgorithm = riskAlgorithm;
    }

    /**
     * Aggregates whole-batch metrics into a summary map for the dashboard.
     */
    public Map<String, Object> calculateCohortMetrics(List<Student> students) {
        Map<String, Object> metrics = new HashMap<>();

        if (students == null || students.isEmpty()) {
            metrics.put("totalStudents", 0);
            metrics.put("averageScore", 0.0);
            metrics.put("averageAttendance", 0.0);
            metrics.put("atRiskCount", 0);
            metrics.put("highRiskCount", 0);
            metrics.put("moderateRiskCount", 0);
            metrics.put("lowRiskCount", 0);
            metrics.put("passRate", 0.0);
            return metrics;
        }

        int total = students.size();
        double totalScore = 0.0;
        double totalAttendance = 0.0;
        int passingStudents = 0;

        int highRisk = 0;
        int modRisk = 0;
        int lowRisk = 0;

        for (Student s : students) {
            double score = s.calculateAverageScorePercentage();
            double att = s.calculateOverallAttendancePercentage();
            totalScore += score;
            totalAttendance += att;

            if (score >= 40.0 && att >= 75.0) {
                passingStudents++;
            }

            RiskReport report = riskAlgorithm.evaluateStudent(s);
            if (report.getRiskLevel() == RiskLevel.HIGH_RISK) {
                highRisk++;
            } else if (report.getRiskLevel() == RiskLevel.MODERATE_RISK) {
                modRisk++;
            } else {
                lowRisk++;
            }
        }

        metrics.put("totalStudents", total);
        metrics.put("averageScore", Math.round((totalScore / total) * 10.0) / 10.0);
        metrics.put("averageAttendance", Math.round((totalAttendance / total) * 10.0) / 10.0);
        metrics.put("atRiskCount", highRisk + modRisk);
        metrics.put("highRiskCount", highRisk);
        metrics.put("moderateRiskCount", modRisk);
        metrics.put("lowRiskCount", lowRisk);
        metrics.put("passRate", Math.round(((double) passingStudents / total) * 1000.0) / 10.0);

        return metrics;
    }

    /**
     * Calculates letter grade distribution across all student records.
     */
    public Map<String, Integer> calculateGradeDistribution(List<Student> students) {
        Map<String, Integer> distribution = new LinkedHashMap<>();
        distribution.put("A+", 0);
        distribution.put("A", 0);
        distribution.put("B", 0);
        distribution.put("C", 0);
        distribution.put("D", 0);
        distribution.put("E", 0);
        distribution.put("F", 0);

        for (Student s : students) {
            for (GradeRecord g : s.getGradeRecords()) {
                String grade = g.getLetterGrade();
                distribution.put(grade, distribution.getOrDefault(grade, 0) + 1);
            }
        }
        return distribution;
    }

    /**
     * Computes course-level averages to identify tough subjects needing academic intervention.
     */
    public Map<String, Double> calculateSubjectWiseAverages(List<Student> students) {
        Map<String, List<Double>> scoresByCourse = new HashMap<>();

        for (Student s : students) {
            for (GradeRecord g : s.getGradeRecords()) {
                scoresByCourse.computeIfAbsent(g.getCourseCode(), k -> new ArrayList<>()).add(g.getPercentage());
            }
        }

        Map<String, Double> courseAverages = new LinkedHashMap<>();
        for (Map.Entry<String, List<Double>> entry : scoresByCourse.entrySet()) {
            List<Double> scores = entry.getValue();
            double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            courseAverages.put(entry.getKey(), Math.round(avg * 10.0) / 10.0);
        }

        return courseAverages;
    }

    /**
     * Retrieves the top N students ranked by average assessment percentage.
     */
    public List<Student> getTopPerformers(List<Student> students, int limit) {
        return students.stream()
                .sorted((s1, s2) -> Double.compare(s2.calculateAverageScorePercentage(), s1.calculateAverageScorePercentage()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all at-risk students ordered by risk severity descending.
     */
    public List<RiskReport> getAtRiskReports(List<Student> students) {
        return students.stream()
                .map(riskAlgorithm::evaluateStudent)
                .sorted((r1, r2) -> Double.compare(r2.getCompositeRiskScore(), r1.getCompositeRiskScore()))
                .collect(Collectors.toList());
    }
}
