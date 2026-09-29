package com.niet.analytics.model;

/**
 * Enum defining Student Academic Risk Levels with associated UI colors and badges.
 */
public enum RiskLevel {
    LOW_RISK("Low Risk", "Good Standing", "#10b981", "badge-success"),
    MODERATE_RISK("Moderate Risk", "Academic Warning", "#f59e0b", "badge-warning"),
    HIGH_RISK("High Risk", "Critical Intervention Required", "#ef4444", "badge-danger");

    private final String label;
    private final String description;
    private final String hexColor;
    private final String badgeClass;

    RiskLevel(String label, String description, String hexColor, String badgeClass) {
        this.label = label;
        this.description = description;
        this.hexColor = hexColor;
        this.badgeClass = badgeClass;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public String getHexColor() {
        return hexColor;
    }

    public String getBadgeClass() {
        return badgeClass;
    }
}
