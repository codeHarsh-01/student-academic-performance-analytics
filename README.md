# Student Academic Performance Analytics System

[![Live Demo](https://img.shields.io/badge/Live_Dashboard-Vercel-black?style=for-the-badge&logo=vercel)](https://student-vercel-wine.vercel.app)
[![Java 17](https://img.shields.io/badge/Java-17_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![SDG 4](https://img.shields.io/badge/UN_SDG_4-Quality_Education-C5192D?style=for-the-badge)](https://sdgs.un.org/goals/goal4)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **A Comprehensive Academic Performance Analytics, Early Risk Detection, and Strategic Intervention Platform.**  
> 🌐 **Live Production Link:** [https://student-vercel-wine.vercel.app](https://student-vercel-wine.vercel.app)

---

- **Institution:** NIET Greater Noida (An Autonomous Institute)
- **Program & Branch:** B.Tech Computer Science & Engineering (CSE-R)
- **Course:** Object Oriented Techniques using Java (`CCSEH0355`)
- **Faculty Mentor:** Disha Saini
- **Group Number:** G-2
- **Target SDG:** SDG 4 (Quality Education)

---

## 👥 Team Members & Contribution

| Student Name | ERP ID / Roll No. | Assigned Role & Module |
| :--- | :--- | :--- |
| **Harsh Goyal** | `2501331690018` | Performance Analytics Engine & Unit 2 Collections Architecture |
| **Aashi Goel** | `2501331690001` | At-Risk Identification Algorithm & Multi-factor Risk Scoring |
| **Nishant Kumar shankhdhar** | `2501331690030` | Unit 1 Domain Object-Oriented Modeling & Custom Exceptions |
| **Ananya Garg** | `2501331690005` | Data Persistence, File I/O & CSV Export Engine |
| **Saurabh** | `2501331690040` | Interactive Web Analytics Dashboard & Multithreaded Reporting |

---

## 🌟 Key Features

1. **Centralized Student Performance Tracking**:
   - Comprehensive student profile management (marks, internal tests, practical labs, attendance logs).
   - Cohort-level KPI cards: total students, overall attendance rate, academic class average, pass rate.

2. **Multi-Factor At-Risk Student Identification**:
   - Multi-parameter risk scoring algorithm evaluated out of 100:
     - **Attendance Deficit**: Mandatory 75% cutoff detection and debarment warning (< 60%).
     - **Academic Performance**: Internal test scoring < 40% and borderline averages.
     - **Failed Assessment Count**: Weighting for individual failed tests.
     - **Downward Trajectory Detection**: Identifies steep performance declines (> 15% drop) between consecutive exams.
   - Categorization:
     - 🔴 **High Risk** (Critical Intervention Required)
     - 🟡 **Moderate Risk** (Academic Warning / Watch List)
     - 🟢 **Low Risk** (Good Standing)

3. **Strategic Actionable Interventions**:
   - Automated mapping of specific interventions to each student:
     - Parental notification & HOD proctor meetings for attendance shortages.
     - Remedial tutorial classes & peer-mentorship for struggling subjects.
     - 1-on-1 counseling for sudden downward performance trajectories.

4. **Modern Glassmorphic Visual Dashboard**:
   - Letter grade distribution histogram (A+, A, B, C, D, E, F).
   - Cohort risk distribution doughnut chart.
   - Course benchmarking chart (e.g. `CCSEH0355 Object Oriented Java` vs other subjects).
   - Real-time search by name or ERP ID, and tab filters by risk tier.
   - Student deep dive inspection modal with subject marks and risk factors.

5. **Asynchronous Report Card & CSV Export**:
   - Multithreaded background generation of student progress report cards in clean HTML.
   - Single-click CSV export of full cohort risk assessments (`/api/export-csv`).

---

## 📚 Syllabus Concepts Demonstrated

### Unit 1: Object Oriented Programming with Java
- **Classes and Objects**: Clear separation of entities (`Student`, `Faculty`, `Course`, `Assessment`, `GradeRecord`).
- **Encapsulation**: Private fields with validated accessors and business logic methods.
- **Inheritance**: Abstract base class `Person` extended by `Student` and `Faculty`.
- **Polymorphism**: Dynamic method dispatch for `getRole()` and `getDisplaySummary()`.
- **Abstraction & Interfaces**: `StudentRepository` interface decoupling data access logic.
- **Exception Handling**: Domain-specific exception hierarchy (`AcademicAnalyticsException`, `StudentNotFoundException`, `InvalidGradeException`, `DatabaseException`).
- **File I/O**: `DataImporter` and `DatabaseManager` using `BufferedWriter`, `ObjectOutputStream`, and CSV stream parsing.

### Unit 2: Advanced Java
- **Collections Framework & Generics**: Type-safe `List<Student>`, `Map<String, AttendanceRecord>`, `ConcurrentHashMap`, and Java 8+ Stream API pipelines.
- **Multithreading & Concurrency**: `ExecutorService`, `ThreadPoolExecutor`, `Callable`, and `CompletableFuture` in `AsyncReportGenerator` and `AnalyticsHttpServer`.
- **Data Persistence**: Structured file and database serialization for cohort records.
- **Modern GUI / Interactive Interface**: Rich web interface powered by embedded lightweight Java HTTP server.

---

## 🚀 Quickstart Guide

### Option 1: One-Click Windows Run (Recommended)
Simply double-click or run from command prompt:
```cmd
run.bat
```
This compiles all Java source code and launches the web dashboard at `http://localhost:8080`.

### Option 2: Using Maven
```bash
mvn clean compile exec:java
```

---

## 📂 Project Structure

```
student-academic-analytics/
├── pom.xml                                 # Maven project descriptor
├── run.bat                                 # Windows one-click build and run script
├── README.md                               # Project documentation
├── docs/
│   ├── PBL_Progress_Report_I.md            # Digital submission for Review 1
│   ├── PBL_Progress_Report_II.md           # Review 2 submission draft
│   ├── ARCHITECTURE.md                     # Detailed OOP architecture and algorithm design
│   └── USER_MANUAL.md                      # Complete user and presentation manual
├── src/main/java/com/niet/analytics/
│   ├── app/
│   │   └── Main.java                       # Application entrypoint
│   ├── model/
│   │   ├── Person.java                     # Unit 1: Abstract class
│   │   ├── Student.java                    # Unit 1: Inheritance & Encapsulation
│   │   ├── Faculty.java                    # Unit 1: Inheritance
│   │   ├── Course.java                     # Course entity
│   │   ├── Assessment.java                 # Assessment entity
│   │   ├── GradeRecord.java                # Grade computation & letter grades
│   │   ├── AttendanceRecord.java           # Attendance percentage & shortage detection
│   │   ├── RiskLevel.java                  # Enum for Risk categories
│   │   └── RiskReport.java                 # Comprehensive risk evaluation model
│   ├── service/
│   │   ├── RiskScoringAlgorithm.java       # Multi-factor risk engine & trajectory analysis
│   │   ├── PerformanceAnalyticsEngine.java # Cohort analytics, averages, distributions
│   │   └── AsyncReportGenerator.java       # Unit 2: Multithreading & report cards
│   ├── repository/
│   │   ├── StudentRepository.java          # Unit 1: Interface & Abstraction
│   │   ├── InMemoryStudentRepository.java  # Unit 2: Collections & Generics
│   │   ├── DatabaseManager.java            # Unit 1/2: Persistence & Serialization
│   │   └── DataImporter.java               # Unit 1: File I/O & CSV export
│   ├── exception/
│   │   ├── AcademicAnalyticsException.java # Unit 1: Base custom exception
│   │   ├── StudentNotFoundException.java   # Custom exception
│   │   ├── InvalidGradeException.java      # Custom exception
│   │   └── DatabaseException.java          # Custom exception
│   └── server/
│       └── AnalyticsHttpServer.java        # Unit 2: Multithreaded HTTP Server & REST API
└── src/main/resources/web/
    ├── index.html                          # Modern Glassmorphic dashboard UI
    ├── style.css                           # Aesthetic responsive CSS stylesheet
    └── app.js                              # Interactive JavaScript & Chart.js logic
```
