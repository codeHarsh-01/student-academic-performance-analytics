package com.niet.analytics.exception;

public class DatabaseException extends AcademicAnalyticsException {
    private static final long serialVersionUID = 1L;

    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
