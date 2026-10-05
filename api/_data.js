// NIET Student Academic Performance Analytics System
// Shared Data Layer - mirrors Java InMemoryStudentRepository
// NIET Greater Noida | B.Tech CSE-R | Course CCSEH0355

const students = [
  { id: 's001', name: 'Aarav Sharma',    erpId: 'NIET2021001', section: 'CSE-R-A', semester: 5, averageScore: 82, attendance: 88 },
  { id: 's002', name: 'Priya Gupta',     erpId: 'NIET2021002', section: 'CSE-R-A', semester: 5, averageScore: 45, attendance: 62 },
  { id: 's003', name: 'Rohit Verma',     erpId: 'NIET2021003', section: 'CSE-R-B', semester: 5, averageScore: 71, attendance: 79 },
  { id: 's004', name: 'Sneha Patel',     erpId: 'NIET2021004', section: 'CSE-R-A', semester: 5, averageScore: 91, attendance: 95 },
  { id: 's005', name: 'Karan Singh',     erpId: 'NIET2021005', section: 'CSE-R-B', semester: 5, averageScore: 38, attendance: 58 },
  { id: 's006', name: 'Anjali Mishra',   erpId: 'NIET2021006', section: 'CSE-R-A', semester: 5, averageScore: 67, attendance: 74 },
  { id: 's007', name: 'Vikram Yadav',    erpId: 'NIET2021007', section: 'CSE-R-B', semester: 5, averageScore: 55, attendance: 81 },
  { id: 's008', name: 'Pooja Kumari',    erpId: 'NIET2021008', section: 'CSE-R-A', semester: 5, averageScore: 78, attendance: 85 },
  { id: 's009', name: 'Rahul Joshi',     erpId: 'NIET2021009', section: 'CSE-R-B', semester: 5, averageScore: 33, attendance: 51 },
  { id: 's010', name: 'Divya Agarwal',   erpId: 'NIET2021010', section: 'CSE-R-A', semester: 5, averageScore: 88, attendance: 92 },
  { id: 's011', name: 'Amit Pandey',     erpId: 'NIET2021011', section: 'CSE-R-B', semester: 5, averageScore: 61, attendance: 77 },
  { id: 's012', name: 'Nisha Tiwari',    erpId: 'NIET2021012', section: 'CSE-R-A', semester: 5, averageScore: 49, attendance: 69 },
];

const gradeRecords = {
  's001': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 38, max: 50, percentage: 76, grade: 'B+' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 71, max: 100, percentage: 71, grade: 'B' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 44, max: 50, percentage: 88, grade: 'A' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 85, max: 100, percentage: 85, grade: 'A' },
  ],
  's002': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 18, max: 50, percentage: 36, grade: 'F' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 42, max: 100, percentage: 42, grade: 'D' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 22, max: 50, percentage: 44, grade: 'D' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 50, max: 100, percentage: 50, grade: 'C' },
  ],
  's003': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 32, max: 50, percentage: 64, grade: 'C+' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 68, max: 100, percentage: 68, grade: 'B' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 38, max: 50, percentage: 76, grade: 'B+' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 74, max: 100, percentage: 74, grade: 'B+' },
  ],
  's004': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 47, max: 50, percentage: 94, grade: 'A+' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 90, max: 100, percentage: 90, grade: 'A+' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 46, max: 50, percentage: 92, grade: 'A+' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 88, max: 100, percentage: 88, grade: 'A' },
  ],
  's005': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 14, max: 50, percentage: 28, grade: 'F' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 35, max: 100, percentage: 35, grade: 'F' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 19, max: 50, percentage: 38, grade: 'F' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 41, max: 100, percentage: 41, grade: 'D' },
  ],
  's006': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 28, max: 50, percentage: 56, grade: 'C' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 65, max: 100, percentage: 65, grade: 'C+' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 33, max: 50, percentage: 66, grade: 'B' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 70, max: 100, percentage: 70, grade: 'B' },
  ],
  's007': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 24, max: 50, percentage: 48, grade: 'D' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 54, max: 100, percentage: 54, grade: 'C' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 27, max: 50, percentage: 54, grade: 'C' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 57, max: 100, percentage: 57, grade: 'C' },
  ],
  's008': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 36, max: 50, percentage: 72, grade: 'B' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 75, max: 100, percentage: 75, grade: 'B+' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 40, max: 50, percentage: 80, grade: 'A' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 80, max: 100, percentage: 80, grade: 'A' },
  ],
  's009': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 12, max: 50, percentage: 24, grade: 'F' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 30, max: 100, percentage: 30, grade: 'F' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 15, max: 50, percentage: 30, grade: 'F' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 38, max: 100, percentage: 38, grade: 'F' },
  ],
  's010': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 44, max: 50, percentage: 88, grade: 'A' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 87, max: 100, percentage: 87, grade: 'A' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 45, max: 50, percentage: 90, grade: 'A+' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 89, max: 100, percentage: 89, grade: 'A' },
  ],
  's011': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 29, max: 50, percentage: 58, grade: 'C' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 60, max: 100, percentage: 60, grade: 'C' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 31, max: 50, percentage: 62, grade: 'C+' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 63, max: 100, percentage: 63, grade: 'C+' },
  ],
  's012': [
    { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: 20, max: 50, percentage: 40, grade: 'D' },
    { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: 47, max: 100, percentage: 47, grade: 'D' },
    { courseCode: 'CCSEH0351', assessment: 'Mid-Term', marks: 23, max: 50, percentage: 46, grade: 'D' },
    { courseCode: 'CCSEH0351', assessment: 'End-Term', marks: 51, max: 100, percentage: 51, grade: 'C' },
  ],
};

// Risk Scoring Algorithm (mirrors Java RiskScoringAlgorithm)
function computeRisk(student) {
  let score = 0;
  const factors = [];
  const interventions = [];

  // Attendance component (40% weight)
  if (student.attendance < 60) {
    score += 40;
    factors.push(`Critical attendance shortage: ${student.attendance}% (minimum 75% required)`);
    interventions.push('Immediate parent-teacher meeting and attendance recovery plan required');
  } else if (student.attendance < 75) {
    score += 28;
    factors.push(`Attendance below mandatory threshold: ${student.attendance}% (shortage: ${75 - student.attendance}%)`);
    interventions.push('Enroll in attendance improvement program; coordinate with hostel warden if applicable');
  } else if (student.attendance < 85) {
    score += 10;
    factors.push(`Attendance approaching warning zone: ${student.attendance}%`);
    interventions.push('Monitor attendance weekly; encourage consistent class participation');
  }

  // Academic score component (40% weight)
  if (student.averageScore < 40) {
    score += 40;
    factors.push(`Academic performance critically low: ${student.averageScore}% (failing threshold)`);
    interventions.push('Assign dedicated academic mentor; enroll in remedial classes immediately');
    interventions.push('Conduct diagnostic assessment to identify specific subject weaknesses');
  } else if (student.averageScore < 55) {
    score += 25;
    factors.push(`Academic performance below satisfactory level: ${student.averageScore}%`);
    interventions.push('Recommend peer tutoring and additional lab sessions');
    interventions.push('Schedule bi-weekly faculty check-ins to monitor progress');
  } else if (student.averageScore < 70) {
    score += 10;
    factors.push(`Academic performance requires improvement: ${student.averageScore}%`);
    interventions.push('Encourage participation in study groups and office hours');
  }

  // Grade failure component (20% weight)
  const grades = gradeRecords[student.id] || [];
  const failCount = grades.filter(g => g.percentage < 40).length;
  if (failCount >= 3) {
    score += 20;
    factors.push(`Multiple subject failures detected: ${failCount} assessments below passing threshold`);
    interventions.push('Immediate academic counseling session; consider semester repeat advisory');
  } else if (failCount >= 1) {
    score += 10;
    factors.push(`Subject failure risk: ${failCount} assessment(s) below 40%`);
    interventions.push('Targeted subject-specific coaching recommended');
  }

  score = Math.min(100, score);

  let riskLevel, riskLabel, badgeClass;
  if (score >= 50) {
    riskLevel = 'HIGH_RISK';
    riskLabel = 'High Risk';
    badgeClass = 'badge-danger';
  } else if (score >= 25) {
    riskLevel = 'MODERATE_RISK';
    riskLabel = 'Moderate Risk';
    badgeClass = 'badge-warning';
  } else {
    riskLevel = 'LOW_RISK';
    riskLabel = 'Low Risk';
    badgeClass = 'badge-success';
  }

  if (factors.length === 0) factors.push('No significant academic risk factors identified');
  if (interventions.length === 0) interventions.push('Maintain current academic performance and engagement');

  return { score, riskLevel, riskLabel, badgeClass, factors, interventions };
}

function getGrade(score) {
  if (score >= 90) return 'O';
  if (score >= 80) return 'A+';
  if (score >= 70) return 'A';
  if (score >= 60) return 'B+';
  if (score >= 50) return 'B';
  if (score >= 40) return 'C';
  return 'F';
}

// Pre-compute enriched students
const enrichedStudents = students.map(s => {
  const risk = computeRisk(s);
  return {
    ...s,
    riskScore: risk.score,
    riskLevel: risk.level || risk.riskLevel,
    riskLabel: risk.riskLabel,
    badgeClass: risk.badgeClass,
    grade: getGrade(s.averageScore),
  };
});

const riskReports = students.map(s => {
  const risk = computeRisk(s);
  return {
    erpId: s.erpId,
    studentId: s.id,
    riskScore: risk.score,
    riskLevel: risk.riskLevel,
    riskFactors: risk.factors,
    interventions: risk.interventions,
  };
});

module.exports = { students, enrichedStudents, riskReports, gradeRecords, computeRisk, getGrade };
