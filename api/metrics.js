const { enrichedStudents, riskReports } = require('./_data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const total = enrichedStudents.length;
  const avgAtt = (enrichedStudents.reduce((s, x) => s + x.attendance, 0) / total).toFixed(1);
  const avgScore = (enrichedStudents.reduce((s, x) => s + x.averageScore, 0) / total).toFixed(1);
  const highRisk = enrichedStudents.filter(s => s.riskLevel === 'HIGH_RISK').length;
  const modRisk = enrichedStudents.filter(s => s.riskLevel === 'MODERATE_RISK').length;
  const lowRisk = enrichedStudents.filter(s => s.riskLevel === 'LOW_RISK').length;
  const passRate = ((enrichedStudents.filter(s => s.averageScore >= 40).length / total) * 100).toFixed(1);

  const gradeDistribution = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
  enrichedStudents.forEach(s => { gradeDistribution[s.grade] = (gradeDistribution[s.grade] || 0) + 1; });

  const subjectTotals = { 'CCSEH0355': [], 'CCSEH0351': [] };
  const { gradeRecords } = require('./_data');
  Object.values(gradeRecords).forEach(records => {
    records.forEach(r => {
      if (subjectTotals[r.courseCode]) subjectTotals[r.courseCode].push(r.percentage);
    });
  });
  const subjectAverages = {};
  for (const [k, v] of Object.entries(subjectTotals)) {
    subjectAverages[k] = v.length ? parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)) : 0;
  }

  res.json({
    cohort: {
      totalStudents: total,
      averageAttendance: parseFloat(avgAtt),
      averageScore: parseFloat(avgScore),
      atRiskCount: highRisk + modRisk,
      highRiskCount: highRisk,
      moderateRiskCount: modRisk,
      lowRiskCount: lowRisk,
      passRate: parseFloat(passRate),
    },
    gradeDistribution,
    subjectAverages,
  });
};
