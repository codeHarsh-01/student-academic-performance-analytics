package com.niet.analytics.model;

import java.io.Serializable;

/**
 * Represents an academic Course (e.g., CCSEH0355 Object Oriented Techniques using Java).
 */
public class Course implements Serializable {
    private static final long serialVersionUID = 1L;

    private String courseCode;
    private String courseName;
    private int credits;
    private int semester;
    private String facultyName;

    public Course() {
    }

    public Course(String courseCode, String courseName, int credits, int semester, String facultyName) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.credits = credits;
        this.semester = semester;
        this.facultyName = facultyName;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (%d Credits, Sem %d, Faculty: %s)", courseCode, courseName, credits, semester, facultyName);
    }
}
