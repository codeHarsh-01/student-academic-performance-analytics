const { enrichedStudents, riskReports, gradeRecords } = require('./_data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing student id' });

  const student = enrichedStudents.find(s => s.id === id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const riskReport = riskReports.find(r => r.erpId === student.erpId) || {};
  const grades = gradeRecords[student.id] || [];

  res.json({ student, riskReport, grades });
};
