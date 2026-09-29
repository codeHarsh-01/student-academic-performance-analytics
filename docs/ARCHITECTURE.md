# System Architecture & Technical Design Document

**Student Academic Performance Analytics System**  
**Course Code:** CCSEH0355 (Object Oriented Techniques using Java)  
**Institution:** NIET Greater Noida (Autonomous)  
**Group:** G-2  

---

## 1. Architectural Overview

The application is structured into a modular **Layered Architecture** adhering strictly to Object-Oriented Design (OOD) principles and separating concerns between Presentation, Business Logic, and Data Persistence:

```
+-------------------------------------------------------------+
|                      Presentation Layer                     |
|  - Modern Web Dashboard (HTML5, Glassmorphism CSS3, JS)      |
|  - Interactive Chart.js Visualizations                      |
|  - Real-time Filter & Search Engine                         |
|  - Student Deep Dive Modals & Report Card Exporter          |
+-------------------------------------------------------------+
                               |
                               v (HTTP / REST APIs)
+-------------------------------------------------------------+
|                     Service & Server Layer                  |
|  - AnalyticsHttpServer (Multithreaded lightweight server)   |
|  - PerformanceAnalyticsEngine (Cohort metrics, histograms)  |
|  - RiskScoringAlgorithm (Multi-factor risk evaluation)      |
|  - AsyncReportGenerator (CompletableFuture report worker)   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Domain & Model Layer                    |
|  - Person (Abstract Base Class)                             |
|  - Student & Faculty (Concrete Subclasses)                  |
|  - Course, Assessment, GradeRecord, AttendanceRecord        |
|  - RiskLevel (Enum) & RiskReport (Composite assessment)     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Persistence Layer                       |
|  - StudentRepository (Interface)                            |
|  - InMemoryStudentRepository (ConcurrentHashMap)            |
|  - DatabaseManager (File Serialization / Deserialization)   |
|  - DataImporter (CSV Stream I/O & Pre-seeding)              |
+-------------------------------------------------------------+
```

---

## 2. Object-Oriented Principles Applied (Unit 1 & 2 Syllabus)

### A. Encapsulation & Abstraction
- All domain models (`Person`, `Student`, `Course`, `GradeRecord`, `AttendanceRecord`) declare their state as `private`.
- Public getters and setters enforce data validation and boundary constraints.
- `Person` declares abstract methods `getRole()` and `getDisplaySummary()`, forcing derived types to provide role-specific representations without exposing internal implementation details.

### B. Inheritance & Polymorphism
- `Student extends Person`: Inherits demographic properties (`id`, `name`, `email`, `department`, `contactNumber`) and adds academic fields (`erpId`, `section`, `semester`, `gradeRecords`, `attendanceByCourse`).
- `Faculty extends Person`: Inherits demographic properties and adds faculty-specific attributes (`facultyId`, `designation`, `assignedCourses`).
- Polymorphic method invocation is used across logging and reporting modules.

### C. Interfaces & Inversion of Control
- `StudentRepository` interface defines the persistence contract (`save`, `findById`, `findByErpId`, `findAll`, `delete`, `count`).
- `InMemoryStudentRepository` provides a high-speed, thread-safe implementation.
- This allows seamless swapping with JDBC / SQL databases without modifying any service or controller code.

### D. Custom Exception Handling Hierarchy
- `AcademicAnalyticsException` extends `java.lang.Exception`.
- Subclasses:
  - `StudentNotFoundException`: Raised when a query targets an unknown ID/ERP.
  - `InvalidGradeException`: Raised when marks exceed maximum permissible bounds or negative values are provided.
  - `DatabaseException`: Wraps I/O or database connection errors.

### E. Multithreading & Concurrency (Unit 2)
- `AnalyticsHttpServer` utilizes a thread pool executor (`Executors.newFixedThreadPool(8)`) for handling concurrent HTTP requests from advisors and faculty.
- `AsyncReportGenerator` utilizes `CompletableFuture.supplyAsync()` to compile rich student report cards asynchronously without blocking the user interface thread.

---

## 3. Multi-Factor At-Risk Scoring Algorithm

The risk assessment engine uses a weighted heuristic formula that calculates a composite score $R \in [0, 100]$:

$$R = \min\left(100, \; S_{\text{attendance}} + S_{\text{academic}} + S_{\text{fails}} + S_{\text{trajectory}}\right)$$

### 1. Attendance Component ($S_{\text{attendance}}$)
- If $\text{Attendance} < 60\%$: $S_{\text{att}} = 50$ (Severe shortage - Debarment Risk)
- Else if $\text{Attendance} < 75\%$: $S_{\text{att}} = 35$ (Mandatory university requirement violation)
- Else if $\text{Attendance} < 80\%$: $S_{\text{att}} = 10$ (Borderline watch list)
- Else: $S_{\text{att}} = 0$

### 2. Academic Score Component ($S_{\text{academic}}$)
- If $\text{Average Score} < 40\%$: $S_{\text{acad}} = 40$ (Failing average)
- Else if $\text{Average Score} < 55\%$: $S_{\text{acad}} = 22$ (Borderline passing)
- Else if $\text{Average Score} < 65\%$: $S_{\text{acad}} = 10$
- Else: $S_{\text{acad}} = 0$

### 3. Subject Failures Penalty ($S_{\text{fails}}$)
- For each assessment with percentage $< 40\%$:
  $$S_{\text{fails}} = \min(30, \; \text{Count}_{\text{fails}} \times 12)$$

### 4. Downward Grade Trajectory Detection ($S_{\text{trajectory}}$)
- Evaluates sequential internal tests ($T_{i-1} \to T_i$) within any subject:
  $$\Delta = \text{Score}(T_{i-1}) - \text{Score}(T_i)$$
- If $\Delta \ge 15\%$, $S_{\text{trajectory}} = 15$ points penalty and triggers an advisor counseling flag.

### Risk Classification Tiers:
- **High Risk**: $R \ge 50$ (Red Badge)
- **Moderate Risk**: $25 \le R < 50$ (Amber Badge)
- **Low Risk / Good Standing**: $R < 25$ (Green Badge)
