// Student Academic Performance Analytics System - Frontend Application Logic
// NIET Greater Noida | B.Tech CSE-R | Course CCSEH0355

let allStudents = [];
let allRiskReports = [];
let currentFilter = 'ALL';
let gradeChart = null;
let riskChart = null;
let subjectChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    await loadMetrics();
    await loadStudents();
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderStudentsTable();
        });
    }

    // Filter tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderStudentsTable();
        });
    });

    // Export CSV button
    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.location.href = '/api/export-csv';
        });
    }

    // Add Student Modal controls
    const addModal = document.getElementById('addStudentModal');
    const openAddModalBtn = document.getElementById('btn-add-student-modal');
    const closeAddModalBtn = document.getElementById('addModalCloseBtn');
    const cancelAddBtn = document.getElementById('addCancelBtn');
    const addForm = document.getElementById('addStudentForm');

    if (openAddModalBtn && addModal) {
        openAddModalBtn.addEventListener('click', () => addModal.classList.add('open'));
    }
    if (closeAddModalBtn && addModal) {
        closeAddModalBtn.addEventListener('click', () => addModal.classList.remove('open'));
    }
    if (cancelAddBtn && addModal) {
        cancelAddBtn.addEventListener('click', () => addModal.classList.remove('open'));
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('formName').value,
                erpId: document.getElementById('formErp').value,
                section: document.getElementById('formSection').value,
                semester: document.getElementById('formSem').value,
                averageScore: document.getElementById('formScore').value,
                attendance: document.getElementById('formAtt').value
            };

            try {
                const res = await fetch('/api/add-student', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    addModal.classList.remove('open');
                    addForm.reset();
                    await initApp();
                } else {
                    alert('Error adding student record');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error');
            }
        });
    }

    // Detail Modal controls
    const detailModal = document.getElementById('detailModal');
    const detailCloseBtn = document.getElementById('modalCloseBtn');
    const detailDoneBtn = document.getElementById('modalDoneBtn');
    if (detailCloseBtn && detailModal) {
        detailCloseBtn.addEventListener('click', () => detailModal.classList.remove('open'));
    }
    if (detailDoneBtn && detailModal) {
        detailDoneBtn.addEventListener('click', () => detailModal.classList.remove('open'));
    }
}

async function loadMetrics() {
    try {
        const res = await fetch('/api/metrics');
        const data = await res.json();

        // Update KPI counters
        document.getElementById('kpi-total-students').textContent = data.cohort.totalStudents;
        document.getElementById('kpi-avg-attendance').textContent = data.cohort.averageAttendance + '%';
        document.getElementById('kpi-avg-score').textContent = data.cohort.averageScore + '%';
        document.getElementById('kpi-at-risk-count').textContent = data.cohort.atRiskCount;
        document.getElementById('kpi-pass-rate').textContent = 'Pass Rate: ' + data.cohort.passRate + '%';

        document.getElementById('kpi-high-risk-count').textContent = data.cohort.highRiskCount + ' Critical';
        document.getElementById('kpi-mod-risk-count').textContent = data.cohort.moderateRiskCount + ' Warning';

        // Render charts
        renderGradeDistributionChart(data.gradeDistribution);
        renderRiskDoughnutChart(data.cohort);
        renderSubjectBenchmarkChart(data.subjectAverages);

    } catch (e) {
        console.error('Failed to load metrics:', e);
    }
}

async function loadStudents() {
    try {
        const [resStudents, resRisk] = await Promise.all([
            fetch('/api/students'),
            fetch('/api/risk-reports')
        ]);
        allStudents = await resStudents.json();
        allRiskReports = await resRisk.json();

        // Update tab pill counts
        const highCount = allStudents.filter(s => s.riskLevel === 'HIGH_RISK').length;
        const modCount = allStudents.filter(s => s.riskLevel === 'MODERATE_RISK').length;
        const lowCount = allStudents.filter(s => s.riskLevel === 'LOW_RISK').length;

        document.getElementById('count-all').textContent = allStudents.length;
        document.getElementById('count-high').textContent = highCount;
        document.getElementById('count-mod').textContent = modCount;
        document.getElementById('count-low').textContent = lowCount;

        const sidebarBadge = document.getElementById('sidebar-risk-badge');
        if (sidebarBadge) {
            sidebarBadge.textContent = (highCount + modCount);
        }

        renderStudentsTable();
    } catch (e) {
        console.error('Failed to load students:', e);
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

    const filtered = allStudents.filter(s => {
        const matchFilter = (currentFilter === 'ALL') || (s.riskLevel === currentFilter);
        const matchSearch = s.name.toLowerCase().includes(searchTerm) || s.erpId.toLowerCase().includes(searchTerm);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4" style="text-align:center; color:#94a3b8; padding:30px;">No students matching criteria found.</td></tr>`;
        return;
    }

    let rowsHtml = '';
    filtered.forEach(s => {
        const report = allRiskReports.find(r => r.erpId === s.erpId) || {};
        const primaryFactor = (report.riskFactors && report.riskFactors.length > 0) ? report.riskFactors[0] : 'Normal performance';

        const attFillClass = s.attendance >= 80 ? 'fill-emerald' : (s.attendance >= 75 ? 'fill-amber' : 'fill-rose');
        const isAttShortage = s.attendance < 75;

        rowsHtml += `
            <tr>
                <td class="student-meta-cell">
                    <strong>${escapeHtml(s.name)}</strong>
                    <small>ERP: ${escapeHtml(s.erpId)}</small>
                </td>
                <td><span style="color:#cbd5e1; font-weight:500;">${escapeHtml(s.section)} (Sem ${s.semester})</span></td>
                <td>
                    <div class="bar-wrap">
                        <div class="mini-progress">
                            <div class="mini-progress-fill ${attFillClass}" style="width: ${Math.min(100, s.attendance)}%;"></div>
                        </div>
                        <span style="font-weight:600; color: ${isAttShortage ? '#ef4444' : '#f8fafc'};">
                            ${s.attendance}% ${isAttShortage ? '⚠️' : ''}
                        </span>
                    </div>
                </td>
                <td><b>${s.averageScore}%</b></td>
                <td>
                    <div class="bar-wrap">
                        <div class="mini-progress" style="min-width: 50px;">
                            <div class="mini-progress-fill ${s.riskScore >= 50 ? 'fill-rose' : (s.riskScore >= 25 ? 'fill-amber' : 'fill-emerald')}" 
                                 style="width: ${s.riskScore}%;"></div>
                        </div>
                        <span style="font-weight:700;">${s.riskScore}</span>
                    </div>
                </td>
                <td><span class="badge ${s.badgeClass}">${escapeHtml(s.riskLabel)}</span></td>
                <td style="max-width: 220px; font-size: 12px; color: #cbd5e1;" title="${escapeHtml(primaryFactor)}">
                    ${escapeHtml(truncate(primaryFactor, 36))}
                </td>
                <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="openStudentDetail('${s.id}')">Inspect</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

async function openStudentDetail(studentId) {
    try {
        const res = await fetch(`/api/student-detail?id=${studentId}`);
        if (!res.ok) return;
        const data = await res.json();

        const s = data.student;
        const r = data.riskReport;
        const grades = data.grades || [];

        document.getElementById('modalStudentName').textContent = s.name;
        document.getElementById('modalStudentMeta').textContent = `ERP: ${s.erpId} | Section: ${s.section} | Semester: ${s.semester}`;

        const modalBody = document.getElementById('modalBody');
        let factorsHtml = r.riskFactors.map(f => `<li style="margin-bottom:6px; color:#fca5a5;">${escapeHtml(f)}</li>`).join('');
        let interventionsHtml = r.interventions.map(i => `<li style="margin-bottom:6px; color:#93c5fd;">${escapeHtml(i)}</li>`).join('');

        let gradesHtml = '';
        grades.forEach(g => {
            gradesHtml += `
                <tr>
                    <td><b>${escapeHtml(g.courseCode)}</b></td>
                    <td>${escapeHtml(g.assessment)}</td>
                    <td>${g.marks} / ${g.max}</td>
                    <td>${g.percentage}%</td>
                    <td><span class="badge ${g.percentage >= 40 ? 'badge-success' : 'badge-danger'}">${g.grade}</span></td>
                </tr>
            `;
        });

        modalBody.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.08);">
                    <small style="color:#94a3b8;">Average Score</small>
                    <div style="font-size:22px; font-weight:700; color:#38bdf8;">${s.averageScore}%</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.08);">
                    <small style="color:#94a3b8;">Attendance</small>
                    <div style="font-size:22px; font-weight:700; color:${s.attendance < 75 ? '#ef4444' : '#10b981'};">${s.attendance}%</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.08);">
                    <small style="color:#94a3b8;">Risk Classification</small>
                    <div><span class="badge ${s.badgeClass}">${s.riskLabel}</span></div>
                </div>
            </div>

            <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:14px;">
                <h4 style="color:#f87171; font-size:14px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                    ⚠️ Identified Academic Risk Factors
                </h4>
                <ul style="padding-left:18px; font-size:13px;">${factorsHtml}</ul>
            </div>

            <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:14px;">
                <h4 style="color:#38bdf8; font-size:14px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                    🎯 Recommended Strategic Interventions
                </h4>
                <ul style="padding-left:18px; font-size:13px;">${interventionsHtml}</ul>
            </div>

            <div>
                <h4 style="color:#fff; font-size:14px; margin-bottom:10px;">Subject & Assessment Evaluation</h4>
                <table class="data-table" style="font-size:12px;">
                    <thead>
                        <tr><th>Course</th><th>Assessment</th><th>Score</th><th>Percent</th><th>Grade</th></tr>
                    </thead>
                    <tbody>${gradesHtml}</tbody>
                </table>
            </div>
        `;

        const printBtn = document.getElementById('modalPrintBtn');
        if (printBtn) {
            printBtn.onclick = () => {
                window.open(`/api/report-card?id=${s.id}`, '_blank');
            };
        }

        document.getElementById('detailModal').classList.add('open');

    } catch (e) {
        console.error('Failed to load student detail:', e);
    }
}

// Chart Renderers using Chart.js

function renderGradeDistributionChart(gradeDist) {
    const ctx = document.getElementById('gradeDistributionChart');
    if (!ctx) return;
    if (gradeChart) gradeChart.destroy();

    const labels = Object.keys(gradeDist);
    const data = Object.values(gradeDist);

    gradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Grades Count',
                data: data,
                backgroundColor: [
                    '#10b981', '#34d399', '#38bdf8', '#60a5fa', '#f59e0b', '#fb923c', '#ef4444'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    ticks: { color: '#94a3b8', stepSize: 2 }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function renderRiskDoughnutChart(cohort) {
    const ctx = document.getElementById('riskDoughnutChart');
    if (!ctx) return;
    if (riskChart) riskChart.destroy();

    riskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk (Safe)', 'Moderate Risk (Watch)', 'High Risk (Critical)'],
            datasets: [{
                data: [cohort.lowRiskCount, cohort.moderateRiskCount, cohort.highRiskCount],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderColor: '#111827',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 }, padding: 14 }
                }
            },
            cutout: '70%'
        }
    });
}

function renderSubjectBenchmarkChart(subjectAvgs) {
    const ctx = document.getElementById('subjectBenchmarkChart');
    if (!ctx) return;
    if (subjectChart) subjectChart.destroy();

    const labels = Object.keys(subjectAvgs).map(k => {
        if (k === 'CCSEH0355') return 'CCSEH0355 (Object Oriented Java)';
        if (k === 'CCSEH0351') return 'CCSEH0351 (Data Structures)';
        return k;
    });
    const data = Object.values(subjectAvgs);

    subjectChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Course Average %',
                data: data,
                backgroundColor: ['rgba(56, 189, 248, 0.8)', 'rgba(99, 102, 241, 0.8)'],
                borderColor: ['#38bdf8', '#6366f1'],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#cbd5e1', font: { weight: '600' } }
                }
            }
        }
    });
}

function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
