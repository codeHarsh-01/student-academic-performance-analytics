package com.niet.analytics.model;

import java.io.Serializable;

/**
 * Tracks student attendance for a specific course.
 */
public class AttendanceRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private String courseCode;
    private int classesHeld;
    private int classesAttended;

    public AttendanceRecord() {
    }

    public AttendanceRecord(String courseCode, int classesHeld, int classesAttended) {
        this.courseCode = courseCode;
        this.classesHeld = classesHeld;
        this.classesAttended = classesAttended;
    }

    public double getPercentage() {
        if (classesHeld <= 0) return 0.0;
        return Math.round(((double) classesAttended / classesHeld) * 1000.0) / 10.0;
    }

    public boolean isShortage() {
        // University threshold is 75.0%
        return getPercentage() < 75.0;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public int getClassesHeld() {
        return classesHeld;
    }

    public void setClassesHeld(int classesHeld) {
        this.classesHeld = classesHeld;
    }

    public int getClassesAttended() {
        return classesAttended;
    }

    public void setClassesAttended(int classesAttended) {
        this.classesAttended = classesAttended;
    }
}
