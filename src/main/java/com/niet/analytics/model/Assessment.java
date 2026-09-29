package com.niet.analytics.model;

import java.io.Serializable;

/**
 * Assessment definition (e.g., Midterm 1, Midterm 2, Quiz, Project, Lab).
 */
public class Assessment implements Serializable {
    private static final long serialVersionUID = 1L;

    private String assessmentId;
    private String courseCode;
    private String title;
    private double maxMarks;
    private double weightage; // e.g. 0.20 for 20%

    public Assessment() {
    }

    public Assessment(String assessmentId, String courseCode, String title, double maxMarks, double weightage) {
        this.assessmentId = assessmentId;
        this.courseCode = courseCode;
        this.title = title;
        this.maxMarks = maxMarks;
        this.weightage = weightage;
    }

    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public double getWeightage() {
        return weightage;
    }

    public void setWeightage(double weightage) {
        this.weightage = weightage;
    }
}
