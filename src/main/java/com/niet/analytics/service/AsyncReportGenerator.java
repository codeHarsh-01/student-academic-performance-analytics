package com.niet.analytics.service;

import com.niet.analytics.model.RiskReport;
import com.niet.analytics.model.Student;

import java.util.List;
import java.util.concurrent.*;

/**
 * Asynchronous Batch Processing & Report Generation Service.
 * Demonstrates Unit 2: Multithreading, ExecutorService, and Concurrency.
 */
public class AsyncReportGenerator {

    private final ExecutorService threadPool;
    private final RiskScoringAlgorithm riskAlgorithm;

    public AsyncReportGenerator() {
        // Multi-threaded thread pool with worker threads
        this.threadPool = Executors.newFixedThreadPool(4, new ThreadFactory() {
            private int counter = 1;
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, "AnalyticsWorker-" + counter++);
                t.setDaemon(true);
                return t;
            }
        });
        this.riskAlgorithm = new RiskScoringAlgorithm();
    }

    /**
     * Asynchronously generates an individual student's HTML report card.
     */
    public CompletableFuture<String> generateStudentReportCardAsync(Student student) {
        return CompletableFuture.supplyAsync(() -> {
            RiskReport risk = riskAlgorithm.evaluateStudent(student);

            StringBuilder sb = new StringBuilder();
            sb.append("<!DOCTYPE html>\n<html><head><meta charset='UTF-8'>");
            sb.append("<title>Student Academic Performance Report - ").append(student.getName()).append("</title>");
            sb.append("<style>");
            sb.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; margin: 0; }");
            sb.append(".card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 800px; margin: 0 auto; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }");
            sb.append(".header { border-bottom: 2px solid #38bdf8; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }");
            sb.append(".badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 14px; }");
            sb.append(".badge-high { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid #ef4444; }");
            sb.append(".badge-mod { background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid #f59e0b; }");
            sb.append(".badge-low { background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid #10b981; }");
            sb.append(".metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }");
            sb.append(".metric-box { background: #0f172a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #334155; }");
            sb.append(".metric-val { font-size: 24px; font-weight: bold; color: #38bdf8; }");
            sb.append("table { width: 100%; border-collapse: collapse; margin-top: 15px; }");
            sb.append("th, td { padding: 10px; border-bottom: 1px solid #334155; text-align: left; }");
            sb.append("th { background: #0f172a; color: #94a3b8; }");
            sb.append(".section-title { font-size: 16px; font-weight: bold; color: #cbd5e1; margin-top: 20px; border-left: 4px solid #38bdf8; padding-left: 8px; }");
            sb.append("ul { padding-left: 20px; color: #cbd5e1; }");
            sb.append("</style></head><body>");

            sb.append("<div class='card'>");
            sb.append("<div class='header'>");
            sb.append("<div><h2>").append(student.getName()).append("</h2><p style='color:#94a3b8; margin:0;'>ERP ID: ").append(student.getErpId()).append(" | Branch: CSE-R | Sem: ").append(student.getSemester()).append("</p></div>");

            String badgeClass = risk.getRiskLevel() == com.niet.analytics.model.RiskLevel.HIGH_RISK ? "badge-high" :
                               (risk.getRiskLevel() == com.niet.analytics.model.RiskLevel.MODERATE_RISK ? "badge-mod" : "badge-low");
            sb.append("<span class='badge ").append(badgeClass).append("'>").append(risk.getRiskLevel().getLabel()).append("</span>");
            sb.append("</div>");

            sb.append("<div class='metric-grid'>");
            sb.append("<div class='metric-box'><div>Avg Score</div><div class='metric-val'>").append(student.calculateAverageScorePercentage()).append("%</div></div>");
            sb.append("<div class='metric-box'><div>Attendance</div><div class='metric-val'>").append(student.calculateOverallAttendancePercentage()).append("%</div></div>");
            sb.append("<div class='metric-box'><div>Risk Score</div><div class='metric-val'>").append(risk.getCompositeRiskScore()).append(" / 100</div></div>");
            sb.append("</div>");

            sb.append("<div class='section-title'>Identified Risk Factors</div><ul>");
            for (String factor : risk.getRiskFactors()) {
                sb.append("<li>").append(factor).append("</li>");
            }
            sb.append("</ul>");

            sb.append("<div class='section-title'>Recommended Interventions</div><ul>");
            for (String intervention : risk.getRecommendedInterventions()) {
                sb.append("<li>").append(intervention).append("</li>");
            }
            sb.append("</ul>");

            sb.append("<div class='section-title'>Assessment Breakdown</div>");
            sb.append("<table><thead><tr><th>Course</th><th>Assessment</th><th>Score</th><th>Max</th><th>Grade</th></tr></thead><tbody>");
            for (var g : student.getGradeRecords()) {
                sb.append("<tr><td>").append(g.getCourseCode()).append("</td><td>")
                  .append(g.getAssessmentName()).append("</td><td>")
                  .append(g.getMarksObtained()).append("</td><td>")
                  .append(g.getMaxMarks()).append("</td><td><b>")
                  .append(g.getLetterGrade()).append("</b></td></tr>");
            }
            sb.append("</tbody></table>");

            sb.append("<p style='text-align:right; font-size:12px; color:#64748b; margin-top:25px;'>Generated on ").append(risk.getEvaluationDate()).append(" by NIET Academic Analytics System</p>");
            sb.append("</div></body></html>");

            return sb.toString();
        }, threadPool);
    }

    /**
     * Shuts down thread pool gracefully when application exits.
     */
    public void shutdown() {
        threadPool.shutdown();
        try {
            if (!threadPool.awaitTermination(3, TimeUnit.SECONDS)) {
                threadPool.shutdownNow();
            }
        } catch (InterruptedException e) {
            threadPool.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
