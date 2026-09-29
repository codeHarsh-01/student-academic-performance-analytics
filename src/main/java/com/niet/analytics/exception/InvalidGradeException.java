package com.niet.analytics.exception;

public class InvalidGradeException extends AcademicAnalyticsException {
    private static final long serialVersionUID = 1L;

    public InvalidGradeException(String message) {
        super(message);
    }
}
