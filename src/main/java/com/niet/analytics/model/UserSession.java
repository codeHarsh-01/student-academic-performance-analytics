package com.niet.analytics.model;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Enterprise User Session Model representing active authenticated context.
 */
public class UserSession implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String userId;
    private final String username;
    private final String fullName;
    private final UserRole role;
    private final String erpReferenceId;
    private final LocalDateTime loginTime;

    public UserSession(String userId, String username, String fullName, UserRole role, String erpReferenceId) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.erpReferenceId = erpReferenceId;
        this.loginTime = LocalDateTime.now();
    }

    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public UserRole getRole() { return role; }
    public String getErpReferenceId() { return erpReferenceId; }
    public LocalDateTime getLoginTime() { return loginTime; }

    public boolean isAdmin() { return role == UserRole.ADMIN; }
    public boolean isFaculty() { return role == UserRole.FACULTY; }
    public boolean isStudent() { return role == UserRole.STUDENT; }
}
