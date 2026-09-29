# NIET Greater Noida (An Autonomous Institute)
## Program and Branch Name: B.Tech CSE-R
# PBL Progress Report – II

---

### Project & Team Details

| Field | Details |
| :--- | :--- |
| **Course Name** | Object Oriented Techniques using Java |
| **Course Code** | CCSEH0355 |
| **Faculty Name** | Disha Saini |
| **Assignment Type** | Group Assignment |
| **Student(s) Name** | Harsh Goyal<br>Aashi Goel<br>Nishant Kumar shankhdhar<br>Ananya Garg<br>Saurabh |
| **ERP ID (I Year) / Roll No. (II Year onwards)** | 2501331690018<br>2501331690001<br>2501331690030<br>2501331690005<br>2501331690040 |
| **Team/Group No.** | G-2 |
| **Problem Statement / Project Title** | Student Academic Performance Analytics System |
| **SDG(s)** | SDG 4: Quality Education |
| **Reporting Month** | Month 2 |
| **Date of Submission** | 11/10/2026 |

---

## Review 2: System Architecture, Algorithm Implementation & Working Prototype

| Field | Details |
| :--- | :--- |
| **1. Modules Developed During Month 2** | • **Core OOP Domain Models (Unit 1)**: Built abstract base class `Person` and subclasses `Student` and `Faculty`. Implemented `Course`, `Assessment`, `GradeRecord`, and `AttendanceRecord`.<br>• **Multi-Factor At-Risk Identification Algorithm**: Formulated and implemented `RiskScoringAlgorithm` combining attendance thresholds (< 75% warning, < 60% critical), academic scores, failed assessments, and downward grade trajectory tracking.<br>• **Performance Analytics Engine (Unit 2)**: Developed statistical analytics calculating class averages, pass rates, grade distribution histograms, and subject benchmarks using Collections and Java Streams.<br>• **Multithreaded Background Report Worker (Unit 2)**: Designed `AsyncReportGenerator` using `ExecutorService` and `CompletableFuture` for asynchronous report card generation.<br>• **Interactive Web Dashboard & REST Service**: Embedded lightweight Java HTTP server serving a modern glassmorphic dashboard with live Chart.js visualizations, student deep dive modals, and CSV export. |
| **2. Syllabus Concepts Applied** | • **Unit 1**: Encapsulation, Inheritance (`Person` -> `Student`), Polymorphism, Abstraction (`StudentRepository` interface), Custom Exception Hierarchy (`AcademicAnalyticsException`, `StudentNotFoundException`), File I/O (CSV export, object serialization).<br>• **Unit 2**: Collections Framework (`Map`, `List`, `ConcurrentHashMap`), Generics, Multithreading (`ExecutorService`, `ThreadFactory`), REST API architecture, and dynamic web GUI. |
| **3. Testing & Validation Completed** | Unit tested risk scoring algorithm against boundary conditions (75% cutoff, grade drops > 15%). Verified file persistence and live dashboard on `http://localhost:8080`. Exported CSV reports and validated data integrity. |
| **4. Overall Progress (%)** | **75%** completed. Working prototype is functional and integrated with real-time risk classification and interactive visualizations. |
| **5. Plan for Final Review** | Conduct stress testing with larger datasets, integrate advanced predictive analytics, package standalone executable distribution, and finalize project report and viva presentation. |
