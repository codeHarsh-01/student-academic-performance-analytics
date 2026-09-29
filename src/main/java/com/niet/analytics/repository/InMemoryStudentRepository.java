package com.niet.analytics.repository;

import com.niet.analytics.exception.StudentNotFoundException;
import com.niet.analytics.model.Student;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory thread-safe implementation of StudentRepository.
 * Demonstrates Unit 2: Collections Framework (ConcurrentHashMap, Lists) and Generics.
 */
public class InMemoryStudentRepository implements StudentRepository {

    // Thread-safe map for student storage
    private final Map<String, Student> storage = new ConcurrentHashMap<>();

    @Override
    public void save(Student student) {
        if (student != null && student.getId() != null) {
            storage.put(student.getId(), student);
        }
    }

    @Override
    public void saveAll(List<Student> students) {
        if (students != null) {
            for (Student s : students) {
                save(s);
            }
        }
    }

    @Override
    public Optional<Student> findById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public Optional<Student> findByErpId(String erpId) {
        if (erpId == null) return Optional.empty();
        return storage.values().stream()
                .filter(s -> erpId.equalsIgnoreCase(s.getErpId()))
                .findFirst();
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public List<Student> findBySection(String section) {
        if (section == null) return Collections.emptyList();
        return storage.values().stream()
                .filter(s -> section.equalsIgnoreCase(s.getSection()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Student> findBySemester(int semester) {
        return storage.values().stream()
                .filter(s -> s.getSemester() == semester)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) throws StudentNotFoundException {
        if (!storage.containsKey(id)) {
            throw new StudentNotFoundException(id);
        }
        storage.remove(id);
    }

    @Override
    public int count() {
        return storage.size();
    }
}
