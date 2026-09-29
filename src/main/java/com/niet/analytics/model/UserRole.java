package com.niet.analytics.model;

/**
 * Role-Based Access Control (RBAC) Enumeration
 * Differentiates administrative, faculty, and student permissions.
 */
public enum UserRole {
    ADMIN("Administrator / HOD", "Full cohort analytics, algorithm weighting, ERP sync, student CRUD"),
    FACULTY("Faculty Mentor", "Section analytics, marks entry, attendance logging, intervention notices"),
    STUDENT("Student", "Personal report card, attendance monitor, weak subject diagnostics");

    private final String title;
    private final String description;

    UserRole(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
}
