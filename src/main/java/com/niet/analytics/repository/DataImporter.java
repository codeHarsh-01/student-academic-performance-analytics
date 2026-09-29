package com.niet.analytics.repository;

import com.niet.analytics.model.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * File I/O handler for importing student CSV datasets, exporting analytics,
 * and pre-seeding initial student records.
 * Demonstrates Unit 1: File I/O, BufferedReader/BufferedWriter, and Exception Handling.
 */
public class DataImporter {

    /**
     * Seeds initial cohort dataset matching NIET CSE-R and the PBL Group G-2 project.
     */
    public static List<Student> createDefaultSeedDataset() {
        List<Student> students = new ArrayList<>();

        // Group Members from PBL Report
        students.add(createStudentWithGrades(
                "STU001", "Harsh Goyal", "harsh.goyal@niet.co.in", "CSE-R", "9876543201",
                "2501331690018", "2501331690018", 3, "CSE-R", "2024-2028",
                88.0, 82.0, 85.0, 78.0, 80.0
        ));

        students.add(createStudentWithGrades(
                "STU002", "Aashi Goel", "aashi.goel@niet.co.in", "CSE-R", "9876543202",
                "2501331690001", "2501331690001", 3, "CSE-R", "2024-2028",
                94.0, 91.0, 95.0, 89.0, 92.0
        ));

        students.add(createStudentWithGrades(
                "STU003", "Nishant Kumar shankhdhar", "nishant.shankhdhar@niet.co.in", "CSE-R", "9876543203",
                "2501331690030", "2501331690030", 3, "CSE-R", "2024-2028",
                79.0, 74.0, 72.0, 70.0, 75.0
        ));

        students.add(createStudentWithGrades(
                "STU004", "Ananya Garg", "ananya.garg@niet.co.in", "CSE-R", "9876543204",
                "2501331690005", "2501331690005", 3, "CSE-R", "2024-2028",
                91.0, 88.0, 86.0, 84.0, 90.0
        ));

        students.add(createStudentWithGrades(
                "STU005", "Saurabh", "saurabh@niet.co.in", "CSE-R", "9876543205",
                "2501331690040", "2501331690040", 3, "CSE-R", "2024-2028",
                84.0, 80.0, 78.0, 82.0, 83.0
        ));

        // Additional Classmates showing diverse profiles (Moderate Risk and High Risk students)
        students.add(createStudentWithGrades(
                "STU006", "Rohan Sharma", "rohan.sharma@niet.co.in", "CSE-R", "9876543206",
                "2501331690045", "2501331690045", 3, "CSE-R", "2024-2028",
                58.0, 48.0, 52.0, 45.0, 68.0 // Moderate Risk (Low attendance + borderline grades)
        ));

        students.add(createStudentWithGrades(
                "STU007", "Priya Verma", "priya.verma@niet.co.in", "CSE-R", "9876543207",
                "2501331690048", "2501331690048", 3, "CSE-R", "2024-2028",
                96.0, 95.0, 98.0, 92.0, 97.0 // Star Performer
        ));

        students.add(createStudentWithGrades(
                "STU008", "Aditya Dixit", "aditya.dixit@niet.co.in", "CSE-R", "9876543208",
                "2501331690052", "2501331690052", 3, "CSE-R", "2024-2028",
                34.0, 32.0, 38.0, 28.0, 52.0 // High Risk (Debarment attendance + failing scores)
        ));

        students.add(createStudentWithGrades(
                "STU009", "Simran Kaur", "simran.kaur@niet.co.in", "CSE-R", "9876543209",
                "2501331690055", "2501331690055", 3, "CSE-R", "2024-2028",
                72.0, 68.0, 65.0, 71.0, 73.5 // Moderate Risk (Borderline attendance < 75%)
        ));

        students.add(createStudentWithGrades(
                "STU010", "Vikram Rathore", "vikram.rathore@niet.co.in", "CSE-R", "9876543210",
                "2501331690060", "2501331690060", 3, "CSE-R", "2024-2028",
                42.0, 35.0, 30.0, 25.0, 48.0 // High Risk (Sharp downward trajectory + failing)
        ));

        students.add(createStudentWithGrades(
                "STU011", "Kavya Tripathi", "kavya.tripathi@niet.co.in", "CSE-R", "9876543211",
                "2501331690063", "2501331690063", 3, "CSE-R", "2024-2028",
                82.0, 86.0, 79.0, 81.0, 84.0
        ));

        students.add(createStudentWithGrades(
                "STU012", "Mohit Chauhan", "mohit.chauhan@niet.co.in", "CSE-R", "9876543212",
                "2501331690067", "2501331690067", 3, "CSE-R", "2024-2028",
                38.0, 29.0, 31.0, 34.0, 54.0 // High Risk
        ));

        return students;
    }

    private static Student createStudentWithGrades(
            String id, String name, String email, String dept, String phone,
            String erpId, String rollNo, int semester, String section, String batch,
            double m1Score, double m2Score, double assignScore, double labScore, double attPercent
    ) {
        Student s = new Student(id, name, email, dept, phone, erpId, rollNo, semester, section, batch);

        // Target Subject: CCSEH0355 (Object Oriented Techniques using Java)
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 1", m1Score, 100.0));
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Midterm 2", m2Score, 100.0));
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Assignment 1", assignScore, 100.0));
        s.addGradeRecord(new GradeRecord("CCSEH0355", "Lab Practical", labScore, 100.0));

        // Attendance for Java course (total 40 lectures)
        int totalClasses = 40;
        int attended = (int) Math.round((attPercent / 100.0) * totalClasses);
        s.recordAttendance(new AttendanceRecord("CCSEH0355", totalClasses, attended));

        // Second course: Data Structures (total 36 lectures)
        s.addGradeRecord(new GradeRecord("CCSEH0351", "Midterm 1", Math.max(20.0, m1Score - 5.0), 100.0));
        s.recordAttendance(new AttendanceRecord("CCSEH0351", 36, (int) Math.round((attPercent / 100.0) * 36)));

        return s;
    }

    /**
     * Exports a list of students and their computed risk indicators to a CSV file.
     * Demonstrates Unit 1: File Output Stream / BufferedWriter.
     */
    public static void exportRiskAnalyticsToCsv(List<RiskReport> reports, File targetFile) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(targetFile), StandardCharsets.UTF_8))) {
            writer.write("ERP_ID,Student_Name,Section,Semester,Attendance_Percent,Average_Score_Percent,Risk_Score,Risk_Level,Risk_Factors,Interventions");
            writer.newLine();

            for (RiskReport r : reports) {
                String factors = String.join(" | ", r.getRiskFactors()).replace("\"", "\"\"");
                String interventions = String.join(" | ", r.getRecommendedInterventions()).replace("\"", "\"\"");

                writer.write(String.format("\"%s\",\"%s\",\"%s\",%d,%.1f,%.1f,%.1f,\"%s\",\"%s\",\"%s\"",
                        r.getErpId(),
                        r.getStudentName(),
                        r.getSection(),
                        r.getSemester(),
                        r.getAttendancePercentage(),
                        r.getAverageScorePercentage(),
                        r.getCompositeRiskScore(),
                        r.getRiskLevel().getLabel(),
                        factors,
                        interventions
                ));
                writer.newLine();
            }
        }
    }
}
