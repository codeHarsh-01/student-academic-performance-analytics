# User & Faculty Presentation Manual

**Student Academic Performance Analytics System**  
**Course Code:** CCSEH0355 | **NIET Greater Noida**  
**Group:** G-2  

---

## 1. System Requirements & Launch

### Prerequisites
- Windows 10/11
- Java Development Kit (JDK 17 or higher)

### Launching the Application
1. Open the project folder:
   ```cmd
   cd C:\Users\HP\.gemini\antigravity-ide\scratch\student-academic-analytics
   ```
2. Double-click or run `run.bat`:
   ```cmd
   run.bat
   ```
3. The script compiles all Java files and starts the embedded HTTP server.
4. Your default browser opens automatically to:
   ```
   http://localhost:8080
   ```

---

## 2. Navigating the Analytics Dashboard

### 2.1 Overview KPI Cards
- **Total Cohort Students**: Displays the active student count in Section CSE-R.
- **Cohort Attendance Rate**: Real-time aggregated attendance percentage with comparison against the 75% threshold.
- **Class Academic Average**: Mean score across all evaluated assessments and internal midterms.
- **At-Risk Students**: Highlighted counter breaking down critical and moderate risk students.

### 2.2 Interactive Visualizations
- **Grade Distribution Chart**: Bar chart representing students across grade brackets ($A+$, $A$, $B$, $C$, $D$, $E$, $F$).
- **At-Risk Doughnut Chart**: Proportional split between Low Risk, Moderate Risk, and High Risk students.
- **Subject Benchmarking Chart**: Comparative bar chart of class performance in `CCSEH0355 (Object Oriented Java)` versus other semester courses.

### 2.3 Early Warning Hub & Table
- **Filter Tabs**: Toggle between *All*, *High Risk*, *Moderate Risk*, and *Good Standing*.
- **Live Search**: Type a student's name (e.g., "Harsh", "Aditya") or ERP ID to instantly filter rows.
- **Color-coded Indicators**:
  - Attendance below 75% shows a warning badge ⚠️.
  - Risk score bar shows visual severity.

### 2.4 Student Deep Dive & Report Cards
- Click the **"Inspect"** button on any student row to view:
  - Complete list of course assessments and marks.
  - Algorithmic risk factor breakdown.
  - Tailored intervention recommendations.
- Click **"View Formal Report Card"** in the modal to generate an official printable HTML progress report.

### 2.5 Adding New Student Records
- Click the **"Add Student"** button in the top navigation bar.
- Fill in the student's name, ERP ID, section, average marks, and attendance.
- Click **"Save & Evaluate Risk"**. The system instantly persists the record, recalculates cohort metrics, and assigns an automated risk classification!

### 2.6 Exporting Analytics
- Click the **"Export CSV"** button to download a complete spreadsheet of all student performance metrics, risk scores, and recommended interventions.
