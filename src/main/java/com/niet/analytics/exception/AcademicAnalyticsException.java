package com.niet.analytics.exception;

/**
 * Base custom exception for the Academic Analytics System.
 * Demonstrates Unit 1: Exception Handling hierarchy.
 */
public class AcademicAnalyticsException extends Exception {
    private static final long serialVersionUID = 1L;

    public AcademicAnalyticsException(String message) {
        super(message);
    }

    public AcademicAnalyticsException(String message, Throwable cause) {
        super(message, cause);
    }
}
