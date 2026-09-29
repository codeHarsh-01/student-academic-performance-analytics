package com.niet.analytics.server;

import com.niet.analytics.model.*;
import com.niet.analytics.repository.DataImporter;
import com.niet.analytics.repository.StudentRepository;
import com.niet.analytics.service.AsyncReportGenerator;
import com.niet.analytics.service.PerformanceAnalyticsEngine;
import com.niet.analytics.service.RiskScoringAlgorithm;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * Built-in Lightweight HTTP Server serving REST APIs and the Modern Web Dashboard.
 * Demonstrates Unit 2: Advanced Java, Networking, and Multithreaded Request Processing.
 */
public class AnalyticsHttpServer {

    private final int port;
    private final StudentRepository repository;
    private final PerformanceAnalyticsEngine analyticsEngine;
    private final RiskScoringAlgorithm riskAlgorithm;
    private final AsyncReportGenerator asyncReportGenerator;
    private final File webAssetsDir;
    private HttpServer server;

    public AnalyticsHttpServer(int port, StudentRepository repository, File webAssetsDir) {
        this.port = port;
        this.repository = repository;
        this.riskAlgorithm = new RiskScoringAlgorithm();
        this.analyticsEngine = new PerformanceAnalyticsEngine(this.riskAlgorithm);
        this.asyncReportGenerator = new AsyncReportGenerator();
        this.webAssetsDir = webAssetsDir;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);

        // API Contexts
        server.createContext("/api/metrics", new MetricsHandler());
        server.createContext("/api/students", new StudentsHandler());
        server.createContext("/api/risk-reports", new RiskReportsHandler());
        server.createContext("/api/student-detail", new StudentDetailHandler());
        server.createContext("/api/report-card", new ReportCardHandler());
        server.createContext("/api/export-csv", new ExportCsvHandler());
        server.createContext("/api/add-student", new AddStudentHandler());

        // Static Web Assets Context
        server.createContext("/", new StaticFileHandler());

        // Multithreaded request executor (Unit 2)
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();

        System.out.println("==================================================================");
        System.out.println("  NIET Student Academic Performance Analytics Server Started!   ");
        System.out.println("  Local URL: http://localhost:" + port + "                          ");
        System.out.println("==================================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
        }
        asyncReportGenerator.shutdown();
    }

    // --- REST Handlers ---

    private class MetricsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            List<Student> students = repository.findAll();
            Map<String, Object> cohort = analyticsEngine.calculateCohortMetrics(students);
            Map<String, Integer> gradeDist = analyticsEngine.calculateGradeDistribution(students);
            Map<String, Double> subjectAvgs = analyticsEngine.calculateSubjectWiseAverages(students);

            StringBuilder json = new StringBuilder("{");
            json.append("\"cohort\":{");
            int i = 0;
            for (Map.Entry<String, Object> entry : cohort.entrySet()) {
                if (i++ > 0) json.append(",");
                json.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            }
            json.append("},\"gradeDistribution\":{");
            i = 0;
            for (Map.Entry<String, Integer> entry : gradeDist.entrySet()) {
                if (i++ > 0) json.append(",");
                json.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            }
            json.append("},\"subjectAverages\":{");
            i = 0;
            for (Map.Entry<String, Double> entry : subjectAvgs.entrySet()) {
                if (i++ > 0) json.append(",");
                json.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            }
            json.append("}}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    private class StudentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Student> students = repository.findAll();
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < students.size(); i++) {
                Student s = students.get(i);
                RiskReport r = riskAlgorithm.evaluateStudent(s);
                if (i > 0) json.append(",");
                json.append(serializeStudent(s, r));
            }
            json.append("]");
            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    private class RiskReportsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Student> students = repository.findAll();
            List<RiskReport> reports = analyticsEngine.getAtRiskReports(students);

            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < reports.size(); i++) {
                RiskReport r = reports.get(i);
                if (i > 0) json.append(",");
                json.append(serializeRiskReport(r));
            }
            json.append("]");
            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    private class StudentDetailHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String query = exchange.getRequestURI().getQuery();
            String id = extractParam(query, "id");
            if (id == null) {
                sendResponse(exchange, 400, "Missing 'id' parameter");
                return;
            }

            Optional<Student> studentOpt = repository.findById(id);
            if (studentOpt.isEmpty()) {
                studentOpt = repository.findByErpId(id);
            }

            if (studentOpt.isEmpty()) {
                sendResponse(exchange, 404, "Student not found");
                return;
            }

            Student s = studentOpt.get();
            RiskReport r = riskAlgorithm.evaluateStudent(s);
            sendJsonResponse(exchange, 200, serializeStudentFull(s, r));
        }
    }

    private class ReportCardHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String query = exchange.getRequestURI().getQuery();
            String id = extractParam(query, "id");
            if (id == null) {
                sendResponse(exchange, 400, "Missing 'id' parameter");
                return;
            }

            Optional<Student> studentOpt = repository.findById(id);
            if (studentOpt.isEmpty()) {
                studentOpt = repository.findByErpId(id);
            }

            if (studentOpt.isEmpty()) {
                sendResponse(exchange, 404, "Student not found");
                return;
            }

            try {
                // Async report generation (Unit 2 Concurrency)
                String html = asyncReportGenerator.generateStudentReportCardAsync(studentOpt.get()).get();
                byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(200, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Error generating report: " + e.getMessage());
            }
        }
    }

    private class ExportCsvHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Student> students = repository.findAll();
            List<RiskReport> reports = analyticsEngine.getAtRiskReports(students);

            File tempCsv = File.createTempFile("at_risk_analytics_", ".csv");
            DataImporter.exportRiskAnalyticsToCsv(reports, tempCsv);

            byte[] fileBytes = Files.readAllBytes(tempCsv.toPath());
            tempCsv.delete();

            exchange.getResponseHeaders().set("Content-Type", "text/csv; charset=UTF-8");
            exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"NIET_At_Risk_Analytics_Report.csv\"");
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }
    }

    private class AddStudentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
            BufferedReader br = new BufferedReader(isr);
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                body.append(line);
            }

            Map<String, String> params = parseFormBody(body.toString());

            String name = params.getOrDefault("name", "Student").trim();
            String erpId = params.getOrDefault("erpId", "250133169" + (1000 + repository.count())).trim();
            String section = params.getOrDefault("section", "CSE-R").trim();
            int semester = Integer.parseInt(params.getOrDefault("semester", "3"));
            double score = Double.parseDouble(params.getOrDefault("averageScore", "75"));
            double attendance = Double.parseDouble(params.getOrDefault("attendance", "80"));

            String id = "STU" + String.format("%03d", repository.count() + 1);
            Student newStudent = new Student(id, name, erpId + "@niet.co.in", "CSE-R", "9876500000",
                    erpId, erpId, semester, section, "2024-2028");

            newStudent.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 1", score, 100.0));
            newStudent.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 2", score, 100.0));
            newStudent.recordAttendance(new AttendanceRecord("CCSEH0355", 40, (int) Math.round((attendance / 100.0) * 40)));

            repository.save(newStudent);

            RiskReport r = riskAlgorithm.evaluateStudent(newStudent);
            sendJsonResponse(exchange, 201, serializeStudent(newStudent, r));
        }
    }

    private class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if ("/".equals(path) || path.isEmpty()) {
                path = "/index.html";
            }

            File file = new File(webAssetsDir, path);
            if (!file.exists() || file.isDirectory()) {
                sendResponse(exchange, 404, "Asset Not Found: " + path);
                return;
            }

            String contentType = "text/plain";
            if (path.endsWith(".html")) contentType = "text/html; charset=UTF-8";
            else if (path.endsWith(".css")) contentType = "text/css; charset=UTF-8";
            else if (path.endsWith(".js")) contentType = "application/javascript; charset=UTF-8";
            else if (path.endsWith(".svg")) contentType = "image/svg+xml";
            else if (path.endsWith(".png")) contentType = "image/png";

            byte[] bytes = Files.readAllBytes(file.toPath());
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    // --- JSON Serialization Helpers ---

    private String serializeStudent(Student s, RiskReport r) {
        return String.format("{\"id\":\"%s\",\"name\":\"%s\",\"erpId\":\"%s\",\"section\":\"%s\",\"semester\":%d,\"averageScore\":%.1f,\"attendance\":%.1f,\"riskScore\":%.1f,\"riskLevel\":\"%s\",\"riskLabel\":\"%s\",\"badgeClass\":\"%s\"}",
                escape(s.getId()), escape(s.getName()), escape(s.getErpId()), escape(s.getSection()), s.getSemester(),
                s.calculateAverageScorePercentage(), s.calculateOverallAttendancePercentage(),
                r.getCompositeRiskScore(), r.getRiskLevel().name(), r.getRiskLevel().getLabel(), r.getRiskLevel().getBadgeClass());
    }

    private String serializeRiskReport(RiskReport r) {
        StringBuilder factorsJson = new StringBuilder("[");
        for (int i = 0; i < r.getRiskFactors().size(); i++) {
            if (i > 0) factorsJson.append(",");
            factorsJson.append("\"").append(escape(r.getRiskFactors().get(i))).append("\"");
        }
        factorsJson.append("]");

        StringBuilder intervJson = new StringBuilder("[");
        for (int i = 0; i < r.getRecommendedInterventions().size(); i++) {
            if (i > 0) intervJson.append(",");
            intervJson.append("\"").append(escape(r.getRecommendedInterventions().get(i))).append("\"");
        }
        intervJson.append("]");

        return String.format("{\"studentId\":\"%s\",\"studentName\":\"%s\",\"erpId\":\"%s\",\"section\":\"%s\",\"semester\":%d,\"attendance\":%.1f,\"averageScore\":%.1f,\"failingCount\":%d,\"compositeRiskScore\":%.1f,\"riskLevel\":\"%s\",\"riskLabel\":\"%s\",\"badgeClass\":\"%s\",\"riskFactors\":%s,\"interventions\":%s,\"evaluationDate\":\"%s\"}",
                escape(r.getStudentId()), escape(r.getStudentName()), escape(r.getErpId()), escape(r.getSection()), r.getSemester(),
                r.getAttendancePercentage(), r.getAverageScorePercentage(), r.getFailingSubjectCount(),
                r.getCompositeRiskScore(), r.getRiskLevel().name(), r.getRiskLevel().getLabel(), r.getRiskLevel().getBadgeClass(),
                factorsJson.toString(), intervJson.toString(), escape(r.getEvaluationDate()));
    }

    private String serializeStudentFull(Student s, RiskReport r) {
        StringBuilder gradesJson = new StringBuilder("[");
        List<GradeRecord> grades = s.getGradeRecords();
        for (int i = 0; i < grades.size(); i++) {
            GradeRecord g = grades.get(i);
            if (i > 0) gradesJson.append(",");
            gradesJson.append(String.format("{\"courseCode\":\"%s\",\"assessment\":\"%s\",\"marks\":%.1f,\"max\":%.1f,\"percentage\":%.1f,\"grade\":\"%s\"}",
                    escape(g.getCourseCode()), escape(g.getAssessmentName()), g.getMarksObtained(), g.getMaxMarks(), g.getPercentage(), g.getLetterGrade()));
        }
        gradesJson.append("]");

        StringBuilder attJson = new StringBuilder("{");
        int j = 0;
        for (Map.Entry<String, AttendanceRecord> entry : s.getAttendanceByCourse().entrySet()) {
            if (j++ > 0) attJson.append(",");
            AttendanceRecord a = entry.getValue();
            attJson.append(String.format("\"%s\":{\"held\":%d,\"attended\":%d,\"percentage\":%.1f,\"shortage\":%b}",
                    escape(entry.getKey()), a.getClassesHeld(), a.getClassesAttended(), a.getPercentage(), a.isShortage()));
        }
        attJson.append("}");

        return String.format("{\"student\":%s,\"riskReport\":%s,\"grades\":%s,\"attendanceRecords\":%s}",
                serializeStudent(s, r), serializeRiskReport(r), gradesJson.toString(), attJson.toString());
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String extractParam(String query, String name) {
        if (query == null) return null;
        for (String pair : query.split("&")) {
            String[] parts = pair.split("=");
            if (parts.length == 2 && parts[0].equalsIgnoreCase(name)) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private Map<String, String> parseFormBody(String body) {
        Map<String, String> map = new HashMap<>();
        if (body == null || body.isEmpty()) return map;

        // Try JSON format or Form urlencoded
        if (body.startsWith("{") && body.endsWith("}")) {
            // Simple key-value JSON parsing
            String content = body.substring(1, body.length() - 1);
            for (String pair : content.split(",")) {
                String[] parts = pair.split(":", 2);
                if (parts.length == 2) {
                    String key = parts[0].trim().replace("\"", "");
                    String val = parts[1].trim().replace("\"", "");
                    map.put(key, val);
                }
            }
        } else {
            for (String pair : body.split("&")) {
                String[] parts = pair.split("=");
                if (parts.length == 2) {
                    map.put(URLDecoder.decode(parts[0], StandardCharsets.UTF_8),
                            URLDecoder.decode(parts[1], StandardCharsets.UTF_8));
                }
            }
        }
        return map;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
