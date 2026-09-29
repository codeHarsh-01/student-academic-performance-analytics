package com.niet.analytics.repository;

import com.niet.analytics.exception.DatabaseException;
import com.niet.analytics.model.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Persistence manager handling data storage, serialization, and database simulation.
 * Demonstrates Unit 1: File I/O (Serialization / Deserialization) and Unit 2: Data Persistence.
 */
public class DatabaseManager {

    private final File dataFile;
    private final StudentRepository repository;

    public DatabaseManager(File dataFile, StudentRepository repository) {
        this.dataFile = dataFile;
        this.repository = repository;
    }

    /**
     * Initializes database storage. Loads existing records from file or seeds default data.
     */
    public void initialize() throws DatabaseException {
        try {
            if (dataFile.exists() && dataFile.length() > 0) {
                loadFromFile();
            } else {
                // Seed with official NIET CSE-R dataset
                List<Student> seedStudents = DataImporter.createDefaultSeedDataset();
                repository.saveAll(seedStudents);
                saveToFile();
            }
        } catch (Exception e) {
            throw new DatabaseException("Failed to initialize database persistence: " + e.getMessage(), e);
        }
    }

    /**
     * Saves all current repository records to persistent storage.
     */
    public synchronized void saveToFile() throws IOException {
        if (!dataFile.getParentFile().exists()) {
            dataFile.getParentFile().mkdirs();
        }
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(dataFile))) {
            oos.writeObject(new ArrayList<>(repository.findAll()));
        }
    }

    /**
     * Loads student records from persistent file storage.
     */
    @SuppressWarnings("unchecked")
    public synchronized void loadFromFile() throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(dataFile))) {
            List<Student> students = (List<Student>) ois.readObject();
            repository.saveAll(students);
        }
    }
}
