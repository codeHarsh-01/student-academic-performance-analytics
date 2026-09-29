package com.niet.analytics.model;

import java.io.Serializable;

/**
 * Abstract base class representing an academic person (Encapsulation and Abstraction).
 * Demonstrates Unit 1: Classes, Objects, and Abstraction.
 */
public abstract class Person implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private String email;
    private String department;
    private String contactNumber;

    public Person() {
    }

    public Person(String id, String name, String email, String department, String contactNumber) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.contactNumber = contactNumber;
    }

    // Abstract methods to be implemented by subclasses (Polymorphism)
    public abstract String getRole();
    public abstract String getDisplaySummary();

    // Getters and Setters (Encapsulation)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    @Override
    public String toString() {
        return String.format("%s [ID: %s, Name: %s, Dept: %s]", getRole(), id, name, department);
    }
}
