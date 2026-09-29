package com.niet.analytics.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Concrete Faculty entity extending Person (Inheritance & Polymorphism).
 */
public class Faculty extends Person {
    private static final long serialVersionUID = 1L;

    private String facultyId;
    private String designation;
    private List<String> assignedCourses = new ArrayList<>();

    public Faculty() {
        super();
    }

    public Faculty(String id, String name, String email, String department, String contactNumber,
                   String facultyId, String designation) {
        super(id, name, email, department, contactNumber);
        this.facultyId = facultyId;
        this.designation = designation;
    }

    @Override
    public String getRole() {
        return "FACULTY";
    }

    @Override
    public String getDisplaySummary() {
        return String.format("%s (%s - %s)", getName(), designation, getDepartment());
    }

    public void assignCourse(String courseCode) {
        if (courseCode != null && !assignedCourses.contains(courseCode)) {
            assignedCourses.add(courseCode);
        }
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public List<String> getAssignedCourses() {
        return assignedCourses;
    }

    public void setAssignedCourses(List<String> assignedCourses) {
        this.assignedCourses = assignedCourses;
    }
}
