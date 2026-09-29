package com.niet.analytics.model;

import java.io.Serializable;

/**
 * Represents an individual evaluation grade record for a student in a course.
 */
public class GradeRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private String courseCode;
    private String assessmentName; // e.g. "Midterm 1", "Midterm 2", "Assignment 1"
    private double marksObtained;
    private double maxMarks;
    private String letterGrade;

    public GradeRecord() {
    }

    public GradeRecord(String courseCode, String assessmentName, double marksObtained, double maxMarks) {
        this.courseCode = courseCode;
        this.assessmentName = assessmentName;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.letterGrade = computeLetterGrade(getPercentage());
    }

    public double getPercentage() {
        if (maxMarks <= 0) return 0.0;
        return Math.round((marksObtained / maxMarks) * 1000.0) / 10.0;
    }

    public static String computeLetterGrade(double percentage) {
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B";
        if (percentage >= 60.0) return "C";
        if (percentage >= 50.0) return "D";
        if (percentage >= 40.0) return "E";
        return "F";
    }

    public double getGradePoint() {
        double p = getPercentage();
        if (p >= 90.0) return 10.0;
        if (p >= 80.0) return 9.0;
        if (p >= 70.0) return 8.0;
        if (p >= 60.0) return 7.0;
        if (p >= 50.0) return 6.0;
        if (p >= 40.0) return 4.0;
        return 0.0;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getAssessmentName() {
        return assessmentName;
    }

    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }

    public double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(double marksObtained) {
        this.marksObtained = marksObtained;
        this.letterGrade = computeLetterGrade(getPercentage());
    }

    public double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(double maxMarks) {
        this.maxMarks = maxMarks;
        this.letterGrade = computeLetterGrade(getPercentage());
    }

    public String getLetterGrade() {
        return letterGrade != null ? letterGrade : computeLetterGrade(getPercentage());
    }

    public void setLetterGrade(String letterGrade) {
        this.letterGrade = letterGrade;
    }
}
