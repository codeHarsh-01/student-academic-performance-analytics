package com.niet.analytics.repository;

import com.niet.analytics.exception.StudentNotFoundException;
import com.niet.analytics.model.Student;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Student entities.
 * Demonstrates Unit 1: Interfaces and Abstraction.
 */
public interface StudentRepository {
    void save(Student student);
    void saveAll(List<Student> students);
    Optional<Student> findById(String id);
    Optional<Student> findByErpId(String erpId);
    List<Student> findAll();
    List<Student> findBySection(String section);
    List<Student> findBySemester(int semester);
    void delete(String id) throws StudentNotFoundException;
    int count();
}
