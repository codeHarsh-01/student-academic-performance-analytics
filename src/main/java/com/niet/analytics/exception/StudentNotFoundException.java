package com.niet.analytics.exception;

public class StudentNotFoundException extends AcademicAnalyticsException {
    private static final long serialVersionUID = 1L;

    public StudentNotFoundException(String studentIdentifier) {
        super("Student not found in repository with identifier: " + studentIdentifier);
    }
}
