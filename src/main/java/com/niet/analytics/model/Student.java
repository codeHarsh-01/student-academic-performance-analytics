package com.niet.analytics.model;

import java.util.*;

/**
 * Concrete Student entity extending Person (Demonstrates Inheritance and Encapsulation).
 * Maintains course enrollments, grade records, and attendance logs.
 */
public class Student extends Person {
    private static final long serialVersionUID = 1L;

    private String erpId;
    private String rollNo;
    private int semester;
    private String section;
    private String batch;

    // Unit 2: Collections Framework (Lists and Maps)
    private List<GradeRecord> gradeRecords = new ArrayList<>();
    private Map<String, AttendanceRecord> attendanceByCourse = new HashMap<>();

    public Student() {
        super();
    }

    public Student(String id, String name, String email, String department, String contactNumber,
                   String erpId, String rollNo, int semester, String section, String batch) {
        super(id, name, email, department, contactNumber);
        this.erpId = erpId;
        this.rollNo = rollNo;
        this.semester = semester;
        this.section = section;
        this.batch = batch;
    }

    @Override
    public String getRole() {
        return "STUDENT";
    }

    @Override
    public String getDisplaySummary() {
        return String.format("%s (ERP: %s, Sec: %s, Sem: %d)", getName(), erpId, section, semester);
    }

    public void addGradeRecord(GradeRecord record) {
        if (record != null) {
            gradeRecords.add(record);
        }
    }

    public void recordAttendance(AttendanceRecord attendanceRecord) {
        if (attendanceRecord != null) {
            attendanceByCourse.put(attendanceRecord.getCourseCode(), attendanceRecord);
        }
    }

    /**
     * Calculates overall attendance percentage across all enrolled courses.
     */
    public double calculateOverallAttendancePercentage() {
        if (attendanceByCourse.isEmpty()) {
            return 0.0;
        }
        int totalHeld = 0;
        int totalAttended = 0;
        for (AttendanceRecord record : attendanceByCourse.values()) {
            totalHeld += record.getClassesHeld();
            totalAttended += record.getClassesAttended();
        }
        return totalHeld == 0 ? 0.0 : Math.round(((double) totalAttended / totalHeld) * 1000.0) / 10.0;
    }

    /**
     * Calculates overall average percentage across all graded assessments.
     */
    public double calculateAverageScorePercentage() {
        if (gradeRecords.isEmpty()) {
            return 0.0;
        }
        double totalPercent = 0.0;
        for (GradeRecord g : gradeRecords) {
            totalPercent += g.getPercentage();
        }
        return Math.round((totalPercent / gradeRecords.size()) * 10.0) / 10.0;
    }

    /**
     * Counts how many subjects have failing grades (< 40%).
     */
    public int countFailingAssessments() {
        int fails = 0;
        for (GradeRecord g : gradeRecords) {
            if (g.getPercentage() < 40.0) {
                fails++;
            }
        }
        return fails;
    }

    // Getters and Setters
    public String getErpId() {
        return erpId;
    }

    public void setErpId(String erpId) {
        this.erpId = erpId;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public List<GradeRecord> getGradeRecords() {
        return gradeRecords;
    }

    public void setGradeRecords(List<GradeRecord> gradeRecords) {
        this.gradeRecords = gradeRecords;
    }

    public Map<String, AttendanceRecord> getAttendanceByCourse() {
        return attendanceByCourse;
    }

    public void setAttendanceByCourse(Map<String, AttendanceRecord> attendanceByCourse) {
        this.attendanceByCourse = attendanceByCourse;
    }
}
