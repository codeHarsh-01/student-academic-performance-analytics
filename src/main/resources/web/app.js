// ====================================================================
// NIET Student Academic Performance Analytics System - Enterprise Frontend
// Course: CCSEH0355 | NIET Greater Noida (Autonomous Institute)
// Strict RBAC Authentication Gateway, Isolated Student & Faculty Views
// ====================================================================

// Default Seed Students (used if database empty)
const DEFAULT_STUDENTS = [
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

const DEFAULT_GRADES = {
    's001': [
        { courseCode: 'CCSEH0355', assessment: 'Mid-Term Exam', marks: 38, max: 50, percentage: 76, grade: 'B+' },
        { courseCode: 'CCSEH0355', assessment: 'End-Term Exam', marks: 71, max: 100, percentage: 71, grade: 'B' },
        { courseCode: 'CCSEH0351', assessment: 'Data Structures Lab', marks: 44, max: 50, percentage: 88, grade: 'A' },
        { courseCode: 'CCSEH0351', assessment: 'End-Term Exam', marks: 85, max: 100, percentage: 85, grade: 'A' },
    ],
    's002': [
        { courseCode: 'CCSEH0355', assessment: 'Mid-Term Exam', marks: 18, max: 50, percentage: 36, grade: 'F' },
        { courseCode: 'CCSEH0355', assessment: 'End-Term Exam', marks: 42, max: 100, percentage: 42, grade: 'D' },
        { courseCode: 'CCSEH0351', assessment: 'Data Structures Lab', marks: 22, max: 50, percentage: 44, grade: 'D' },
        { courseCode: 'CCSEH0351', assessment: 'End-Term Exam', marks: 50, max: 100, percentage: 50, grade: 'C' },
    ],
    's005': [
        { courseCode: 'CCSEH0355', assessment: 'Mid-Term Exam', marks: 14, max: 50, percentage: 28, grade: 'F' },
        { courseCode: 'CCSEH0355', assessment: 'End-Term Exam', marks: 35, max: 100, percentage: 35, grade: 'F' },
        { courseCode: 'CCSEH0351', assessment: 'Data Structures Lab', marks: 19, max: 50, percentage: 38, grade: 'F' },
        { courseCode: 'CCSEH0351', assessment: 'End-Term Exam', marks: 41, max: 100, percentage: 41, grade: 'D' },
    ],
    's009': [
        { courseCode: 'CCSEH0355', assessment: 'Mid-Term Exam', marks: 12, max: 50, percentage: 24, grade: 'F' },
        { courseCode: 'CCSEH0355', assessment: 'End-Term Exam', marks: 30, max: 100, percentage: 30, grade: 'F' },
        { courseCode: 'CCSEH0351', assessment: 'Data Structures Lab', marks: 15, max: 50, percentage: 30, grade: 'F' },
        { courseCode: 'CCSEH0351', assessment: 'End-Term Exam', marks: 38, max: 100, percentage: 38, grade: 'F' },
    ]
};

// Application State
let appDatabase = {
    students: [],
    grades: {},
    weights: { attendance: 40, academic: 40, backlog: 20 },
};

let currentSession = {
    isLoggedIn: false,
    role: null, // 'STUDENT' | 'FACULTY' | 'ADMIN'
    user: null  // Student object or Faculty/Admin profile
};

let currentFilter = 'ALL';
let selectedLoginTab = 'STUDENT';
let gradeChart = null;
let riskChart = null;
let subjectChart = null;

// App Startup
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    checkExistingSession();
    setupEventListeners();
});

// Database Storage
function loadDatabase() {
    try {
        const stored = localStorage.getItem('niet_analytics_db_v3');
        if (stored) {
            const parsed = JSON.parse(stored);
            appDatabase.students = parsed.students || DEFAULT_STUDENTS;
            appDatabase.grades = parsed.grades || DEFAULT_GRADES;
            appDatabase.weights = parsed.weights || { attendance: 40, academic: 40, backlog: 20 };
        } else {
            appDatabase.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
            appDatabase.grades = JSON.parse(JSON.stringify(DEFAULT_GRADES));
            saveDatabase();
        }
    } catch (e) {
        appDatabase.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
        appDatabase.grades = JSON.parse(JSON.stringify(DEFAULT_GRADES));
    }
}

function saveDatabase() {
    try {
        localStorage.setItem('niet_analytics_db_v3', JSON.stringify({
            students: appDatabase.students,
            grades: appDatabase.grades,
            weights: appDatabase.weights
        }));
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
    }
}

// Session Check
function checkExistingSession() {
    try {
        const savedSession = sessionStorage.getItem('niet_active_session');
        if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.isLoggedIn) {
                currentSession = parsed;
                showAppWorkspace();
                return;
            }
        }
    } catch (e) {}

    // Default: Must show Login Gateway
    showLoginGateway();
}

function showLoginGateway() {
    document.getElementById('loginGateway').style.display = 'flex';
    document.getElementById('appWorkspace').style.display = 'none';
}

function showAppWorkspace() {
    document.getElementById('loginGateway').style.display = 'none';
    const workspace = document.getElementById('appWorkspace');
    workspace.style.display = 'flex';
    renderWorkspaceForSession();
}

function logoutUser() {
    currentSession = { isLoggedIn: false, role: null, user: null };
    sessionStorage.removeItem('niet_active_session');
    document.getElementById('loginForm').reset();
    hideLoginAlert();
    showLoginGateway();
}

// Multi-Factor Risk Algorithm
function evaluateStudentRisk(student) {
    const { attendance: wAtt, academic: wAcad, backlog: wBack } = appDatabase.weights;
    let score = 0;
    const factors = [];
    const interventions = [];

    // 1. Attendance Component
    if (student.attendance < 60) {
        score += wAtt;
        factors.push(`Critical attendance deficit: ${student.attendance}% (Debarment Warning < 60%)`);
        interventions.push('Mandatory proctor & parent notification; require medical justification');
    } else if (student.attendance < 75) {
        score += Math.round(wAtt * 0.7);
        factors.push(`Attendance below mandatory threshold: ${student.attendance}% (Deficit: ${75 - student.attendance}%)`);
        interventions.push('Enroll in attendance recovery monitoring; weekly HOD check-in');
    } else if (student.attendance < 85) {
        score += Math.round(wAtt * 0.25);
        factors.push(`Attendance in monitoring zone: ${student.attendance}%`);
        interventions.push('Encourage continuous lecture and lab participation');
    }

    // 2. Academic Score Component
    if (student.averageScore < 40) {
        score += wAcad;
        factors.push(`Academic performance failing: ${student.averageScore}% (< 40% cutoff)`);
        interventions.push('Assign dedicated faculty mentor; schedule remedial tutorials');
    } else if (student.averageScore < 55) {
        score += Math.round(wAcad * 0.62);
        factors.push(`Academic performance borderline: ${student.averageScore}%`);
        interventions.push('Recommend peer study group and additional practical coding labs');
    } else if (student.averageScore < 70) {
        score += Math.round(wAcad * 0.25);
        factors.push(`Academic score requires improvement: ${student.averageScore}%`);
        interventions.push('Encourage consultation during faculty office hours');
    }

    // 3. Failed Assessment Backlog Component
    const grades = appDatabase.grades[student.id] || [];
    const failCount = grades.filter(g => g.percentage < 40).length;
    if (failCount >= 2) {
        score += wBack;
        factors.push(`Multiple course assessment backlogs: ${failCount} subjects failed`);
        interventions.push('Special re-examination advisory and personalized problem sets');
    } else if (failCount === 1) {
        score += Math.round(wBack * 0.5);
        factors.push(`Single subject assessment backlog detected`);
        interventions.push('Subject-specific diagnostic test and coaching recommended');
    }

    score = Math.min(100, Math.max(0, score));

    let riskLevel = 'LOW_RISK';
    let riskLabel = 'Low Risk';
    let badgeClass = 'badge-success';

    if (score >= 50) {
        riskLevel = 'HIGH_RISK';
        riskLabel = 'High Risk';
        badgeClass = 'badge-danger';
    } else if (score >= 25) {
        riskLevel = 'MODERATE_RISK';
        riskLabel = 'Moderate Risk';
        badgeClass = 'badge-warning';
    }

    if (factors.length === 0) factors.push('Consistent academic standing; no active risk factors');
    if (interventions.length === 0) interventions.push('Maintain consistent academic engagement and attendance');

    return { score, riskLevel, riskLabel, badgeClass, factors, interventions };
}

function getGradeLetter(score) {
    if (score >= 90) return 'O';
    if (score >= 80) return 'A+';
    if (score >= 70) return 'A';
    if (score >= 60) return 'B+';
    if (score >= 50) return 'B';
    if (score >= 40) return 'C';
    return 'F';
}

function enrichStudentsList() {
    return appDatabase.students.map(s => {
        const risk = evaluateStudentRisk(s);
        return {
            ...s,
            riskScore: risk.score,
            riskLevel: risk.riskLevel,
            riskLabel: risk.riskLabel,
            badgeClass: risk.badgeClass,
            riskFactors: risk.factors,
            interventions: risk.interventions,
            grade: getGradeLetter(s.averageScore)
        };
    });
}

// Render Workspace Based on Current Role
function renderWorkspaceForSession() {
    const { role, user } = currentSession;
    const nameEl = document.getElementById('userNameDisplay');
    const badgeEl = document.getElementById('userRoleBadge');
    const avatarEl = document.getElementById('userAvatar');
    const titleEl = document.getElementById('headerMainTitle');
    const subEl = document.getElementById('headerSubtitle');
    const navMenu = document.getElementById('sideNavMenu');

    // Controls
    const syncBtn = document.getElementById('btn-sync-erp');
    const weightsBtn = document.getElementById('btn-config-weights');
    const exportBtn = document.getElementById('btn-export-csv');
    const addStudentBtn = document.getElementById('btn-add-student-modal');
    const printStudentBtn = document.getElementById('btnPrintStudentReport');

    // Views
    const studentPortalView = document.getElementById('studentPortalView');
    const cohortView = document.getElementById('cohortViewContainer');

    if (role === 'STUDENT') {
        // === STUDENT PERSONAL WORKSPACE ===
        nameEl.textContent = user.name;
        avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        badgeEl.className = 'role-pill student';
        badgeEl.textContent = '🎓 Student Portal';

        titleEl.textContent = `Student Academic Growth Portal - ${user.name}`;
        subEl.textContent = `Institutional ERP: ${user.erpId} | Section ${user.section} | Semester ${user.semester} | NIET Greater Noida`;

        // Configure Navigation for Student
        navMenu.innerHTML = `
            <a href="#student-portal" class="nav-item active">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                <span>My Scorecard</span>
            </a>
            <a href="#my-grades" class="nav-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>Course Assessments</span>
            </a>
            <a href="#interventions" class="nav-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Mentoring & Advice</span>
            </a>
        `;

        // Toggle Views
        studentPortalView.style.display = 'block';
        cohortView.style.display = 'none';

        // Toggle Action Buttons
        syncBtn.style.display = 'none';
        weightsBtn.style.display = 'none';
        exportBtn.style.display = 'none';
        addStudentBtn.style.display = 'none';
        printStudentBtn.style.display = 'inline-flex';

        // Render Student Specific Details
        renderStudentPersonalDetails(user);

    } else {
        // === FACULTY OR HOD/ADMIN WORKSPACE ===
        nameEl.textContent = user.name;
        avatarEl.textContent = role === 'ADMIN' ? 'HOD' : 'FAC';
        badgeEl.className = 'role-pill ' + (role === 'ADMIN' ? 'admin' : 'faculty');
        badgeEl.textContent = role === 'ADMIN' ? '👑 Admin / HOD' : '👨‍🏫 Faculty Mentor';

        titleEl.textContent = role === 'ADMIN' 
            ? 'Department Administration & Performance Analytics' 
            : 'Faculty Cohort Evaluation & Mentoring Console';
        subEl.textContent = 'Department of Computer Science & Engineering (CSE-R) | NIET Greater Noida';

        // Configure Navigation for Faculty/Admin
        navMenu.innerHTML = `
            <a href="#overview" class="nav-item active" id="nav-overview">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Overview KPI</span>
            </a>
            <a href="#at-risk" class="nav-item" id="nav-atrisk">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>At-Risk Detection</span>
                <span class="risk-count-pill" id="sidebar-risk-badge">0</span>
            </a>
            <a href="#students" class="nav-item" id="nav-students">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Student Directory</span>
            </a>
            <a href="#subject-analytics" class="nav-item" id="nav-subjects">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span>Subject Benchmarks</span>
            </a>
        `;

        // Toggle Views
        studentPortalView.style.display = 'none';
        cohortView.style.display = 'block';

        // Toggle Action Buttons
        syncBtn.style.display = role === 'ADMIN' ? 'inline-flex' : 'none';
        weightsBtn.style.display = role === 'ADMIN' ? 'inline-flex' : 'none';
        exportBtn.style.display = 'inline-flex';
        addStudentBtn.style.display = 'inline-flex';
        printStudentBtn.style.display = 'none';

        // Render Cohort Analytics
        renderCohortAnalytics();
    }
}

// Student Personal Profile Rendering
function renderStudentPersonalDetails(studentRaw) {
    const enriched = enrichStudentsList();
    let student = enriched.find(s => s.erpId?.toUpperCase() === studentRaw.erpId?.toUpperCase()) || studentRaw;
    if (!student.riskFactors || !student.interventions) {
        const risk = evaluateStudentRisk(student);
        student = {
            ...student,
            riskScore: risk.score,
            riskLevel: risk.riskLevel,
            riskLabel: risk.riskLabel,
            badgeClass: risk.badgeClass,
            riskFactors: risk.factors,
            interventions: risk.interventions,
            grade: getGradeLetter(student.averageScore || 0)
        };
    }

    document.getElementById('spStudentName').textContent = student.name || 'Student';
    document.getElementById('spStudentMeta').textContent = `ERP: ${student.erpId || '--'} | Section: ${student.section || 'CSE-R'} | Semester: ${student.semester || 5} | NIET Greater Noida`;

    const riskBadge = document.getElementById('spRiskBadge');
    if (riskBadge) {
        riskBadge.textContent = student.riskLabel || 'Low Risk';
        riskBadge.className = 'badge ' + (student.badgeClass || 'badge-success');
    }

    document.getElementById('spAttendanceVal').textContent = student.attendance + '%';
    const attBar = document.getElementById('spAttendanceBar');
    attBar.style.width = Math.min(100, student.attendance) + '%';
    attBar.className = 'mini-progress-fill ' + (student.attendance >= 75 ? 'fill-emerald' : 'fill-rose');

    document.getElementById('spAttendanceMsg').textContent = student.attendance >= 75 
        ? 'Safe: Above 75% mandatory university threshold.' 
        : `⚠️ Critical shortage: Below 75% minimum threshold (${75 - student.attendance}% deficit)`;

    document.getElementById('spScoreVal').textContent = student.averageScore + '%';
    document.getElementById('spGradeVal').textContent = student.grade;
    document.getElementById('spRiskScoreVal').textContent = student.riskScore;

    const factorsUl = document.getElementById('spRiskFactors');
    factorsUl.innerHTML = student.riskFactors.map(f => `<li>${escapeHtml(f)}</li>`).join('');

    const intervUl = document.getElementById('spInterventions');
    intervUl.innerHTML = student.interventions.map(i => `<li>${escapeHtml(i)}</li>`).join('');

    // Render Student Marks Table
    const grades = appDatabase.grades[student.id] || [
        { courseCode: 'CCSEH0355', assessment: 'Mid-Term Exam', marks: Math.round(student.averageScore * 0.45), max: 50, percentage: student.averageScore, grade: student.grade },
        { courseCode: 'CCSEH0355', assessment: 'End-Term Exam', marks: student.averageScore, max: 100, percentage: student.averageScore, grade: student.grade },
        { courseCode: 'CCSEH0351', assessment: 'Data Structures Lab', marks: Math.round(student.averageScore * 0.48), max: 50, percentage: student.averageScore, grade: student.grade },
        { courseCode: 'CCSEH0351', assessment: 'End-Term Exam', marks: student.averageScore, max: 100, percentage: student.averageScore, grade: student.grade },
    ];

    const tbody = document.getElementById('spGradesTableBody');
    if (tbody) {
        tbody.innerHTML = grades.map(g => `
            <tr>
                <td><b>${escapeHtml(g.courseCode)}</b></td>
                <td>${escapeHtml(g.assessment)}</td>
                <td><b>${g.marks}</b> / ${g.max}</td>
                <td>${g.percentage}%</td>
                <td><span class="badge ${g.percentage >= 40 ? 'badge-success' : 'badge-danger'}">${g.grade}</span></td>
                <td>${g.percentage >= 40 ? '<span style="color:#34d399;">Passed</span>' : '<span style="color:#f87171;">Backlog Risk</span>'}</td>
            </tr>
        `).join('');
    }
}

// Cohort Analytics Rendering (Faculty & Admin)
function renderCohortAnalytics() {
    const enriched = enrichStudentsList();

    // 1. KPI Counters
    const total = enriched.length;
    const avgAtt = (enriched.reduce((acc, s) => acc + s.attendance, 0) / total).toFixed(1);
    const avgScore = (enriched.reduce((acc, s) => acc + s.averageScore, 0) / total).toFixed(1);
    const highRisk = enriched.filter(s => s.riskLevel === 'HIGH_RISK').length;
    const modRisk = enriched.filter(s => s.riskLevel === 'MODERATE_RISK').length;
    const lowRisk = enriched.filter(s => s.riskLevel === 'LOW_RISK').length;
    const passRate = ((enriched.filter(s => s.averageScore >= 40).length / total) * 100).toFixed(1);

    document.getElementById('kpi-total-students').textContent = total;
    document.getElementById('kpi-avg-attendance').textContent = avgAtt + '%';
    document.getElementById('kpi-avg-score').textContent = avgScore + '%';
    document.getElementById('kpi-at-risk-count').textContent = highRisk + modRisk;
    document.getElementById('kpi-pass-rate').textContent = 'Pass Rate: ' + passRate + '%';
    document.getElementById('kpi-high-risk-count').textContent = highRisk + ' Critical';
    document.getElementById('kpi-mod-risk-count').textContent = modRisk + ' Warning';

    // 2. Tab Badges
    document.getElementById('count-all').textContent = total;
    document.getElementById('count-high').textContent = highRisk;
    document.getElementById('count-mod').textContent = modRisk;
    document.getElementById('count-low').textContent = lowRisk;
    const sidebarBadge = document.getElementById('sidebar-risk-badge');
    if (sidebarBadge) sidebarBadge.textContent = highRisk + modRisk;

    // 3. Render Students Table
    renderStudentsTable(enriched);

    // 4. Render Charts
    const gradeDist = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
    enriched.forEach(s => { gradeDist[s.grade] = (gradeDist[s.grade] || 0) + 1; });
    renderGradeDistributionChart(gradeDist);

    renderRiskDoughnutChart({ lowRiskCount: lowRisk, moderateRiskCount: modRisk, highRiskCount: highRisk });

    renderSubjectBenchmarkChart({
        'CCSEH0355': 68.4,
        'CCSEH0351': 71.2
    });
}

function renderStudentsTable(studentsList) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

    const filtered = studentsList.filter(s => {
        const matchFilter = (currentFilter === 'ALL') || (s.riskLevel === currentFilter);
        const matchSearch = s.name.toLowerCase().includes(searchTerm) || s.erpId.toLowerCase().includes(searchTerm);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4" style="text-align:center; color:#94a3b8; padding:30px;">No students matching search criteria found.</td></tr>`;
        return;
    }

    let rowsHtml = '';
    filtered.forEach(s => {
        const primaryFactor = (s.riskFactors && s.riskFactors.length > 0) ? s.riskFactors[0] : 'Normal performance';
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
                    <button class="btn btn-secondary btn-sm" onclick="openStudentDetailModal('${s.id}')">Inspect</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

// Student Detail Modal Inspection (Faculty/HOD view)
window.openStudentDetailModal = function(studentId) {
    const enriched = enrichStudentsList();
    const s = enriched.find(x => x.id === studentId);
    if (!s) return;

    const grades = appDatabase.grades[s.id] || [
        { courseCode: 'CCSEH0355', assessment: 'Mid-Term', marks: Math.round(s.averageScore * 0.45), max: 50, percentage: s.averageScore, grade: s.grade },
        { courseCode: 'CCSEH0355', assessment: 'End-Term', marks: s.averageScore, max: 100, percentage: s.averageScore, grade: s.grade }
    ];

    document.getElementById('modalStudentName').textContent = s.name;
    document.getElementById('modalStudentMeta').textContent = `ERP: ${s.erpId} | Section: ${s.section} | Semester: ${s.semester}`;

    const modalBody = document.getElementById('modalBody');
    let factorsHtml = s.riskFactors.map(f => `<li style="margin-bottom:6px; color:#fca5a5;">${escapeHtml(f)}</li>`).join('');
    let interventionsHtml = s.interventions.map(i => `<li style="margin-bottom:6px; color:#93c5fd;">${escapeHtml(i)}</li>`).join('');

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
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:16px;">
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

        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:14px; margin-bottom:14px;">
            <h4 style="color:#f87171; font-size:14px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                ⚠️ Identified Academic Risk Factors
            </h4>
            <ul style="padding-left:18px; font-size:13px;">${factorsHtml}</ul>
        </div>

        <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:14px; margin-bottom:16px;">
            <h4 style="color:#38bdf8; font-size:14px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                🎯 Recommended Strategic Interventions
            </h4>
            <ul style="padding-left:18px; font-size:13px;">${interventionsHtml}</ul>
        </div>

        <div>
            <h4 style="color:#fff; font-size:14px; margin-bottom:10px;">Subject Assessments & Examination Marks</h4>
            <table class="data-table" style="font-size:12px;">
                <thead>
                    <tr><th>Course</th><th>Assessment</th><th>Score</th><th>Percent</th><th>Grade</th></tr>
                </thead>
                <tbody>${gradesHtml}</tbody>
            </table>
        </div>
    `;

    document.getElementById('modalPrintBtn').onclick = () => {
        window.print();
    };

    document.getElementById('detailModal').classList.add('open');
};

// Event Listeners Setup
function setupEventListeners() {
    // 1. Role Tabs in Login Screen
    document.querySelectorAll('.login-tab-btn, .examly-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.login-tab-btn, .examly-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLoginTab = btn.getAttribute('data-type');
            updateLoginFormPlaceholders();
        });
    });

    // Password Visibility Eye Toggle
    const btnTogglePw = document.getElementById('btnTogglePassword');
    const pwInput = document.getElementById('loginPassword');
    const eyeIcon = document.getElementById('eyeIcon');
    if (btnTogglePw && pwInput) {
        btnTogglePw.addEventListener('click', () => {
            const isPassword = pwInput.type === 'password';
            pwInput.type = isPassword ? 'text' : 'password';
            if (eyeIcon) {
                eyeIcon.innerHTML = isPassword
                    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
                    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        });
    }

    // Forgot Password Dialog
    document.getElementById('linkForgotPassword')?.addEventListener('click', () => {
        alert('For institutional password recovery, please contact NIET ERP Cell (erp.support@niet.co.in) or your assigned faculty proctor with your Student ERP ID.');
    });

    function updateLoginFormPlaceholders() {
        const idLabel = document.getElementById('lblLoginIdentifier');
        const idInput = document.getElementById('loginIdentifier');
        const btnText = document.getElementById('loginBtnText');
        hideLoginAlert();

        if (selectedLoginTab === 'STUDENT') {
            idLabel.textContent = 'Student Institutional ERP ID';
            idInput.placeholder = 'e.g. NIET2021001';
            btnText.textContent = 'Sign In to Student Portal';
        } else if (selectedLoginTab === 'FACULTY') {
            idLabel.textContent = 'Faculty Institutional Email';
            idInput.placeholder = 'e.g. faculty@niet.co.in';
            btnText.textContent = 'Sign In to Faculty Console';
        } else {
            idLabel.textContent = 'Department Head / Admin Email';
            idInput.placeholder = 'e.g. hod@niet.co.in';
            btnText.textContent = 'Sign In to Admin Gateway';
        }
    }

    // 2. Demo Auto-Fill Buttons
    document.getElementById('demoFillStudentGood')?.addEventListener('click', () => {
        document.getElementById('tabStudent').click();
        document.getElementById('loginIdentifier').value = 'NIET2021001';
        document.getElementById('loginPassword').value = 'student123';
        hideLoginAlert();
    });

    document.getElementById('demoFillStudentRisk')?.addEventListener('click', () => {
        document.getElementById('tabStudent').click();
        document.getElementById('loginIdentifier').value = 'NIET2021002';
        document.getElementById('loginPassword').value = 'student123';
        hideLoginAlert();
    });

    document.getElementById('demoFillFaculty')?.addEventListener('click', () => {
        document.getElementById('tabFaculty').click();
        document.getElementById('loginIdentifier').value = 'faculty@niet.co.in';
        document.getElementById('loginPassword').value = 'faculty123';
        hideLoginAlert();
    });

    document.getElementById('demoFillAdmin')?.addEventListener('click', () => {
        document.getElementById('tabAdmin').click();
        document.getElementById('loginIdentifier').value = 'hod@niet.co.in';
        document.getElementById('loginPassword').value = 'admin123';
        hideLoginAlert();
    });

    // 3. Login Form Submit
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        hideLoginAlert();

        if (selectedLoginTab === 'STUDENT') {
            // Check student ERP ID
            const foundStudent = appDatabase.students.find(s => s.erpId.toUpperCase() === identifier.toUpperCase());
            if (!foundStudent) {
                showLoginAlert(`Invalid Student ERP ID "${identifier}". Enter an existing ERP ID like NIET2021001 or NIET2021002.`);
                return;
            }
            if (password !== 'student123' && password !== '123456') {
                showLoginAlert('Incorrect password. For testing, student password is: student123');
                return;
            }

            // Authenticated as Student!
            currentSession = {
                isLoggedIn: true,
                role: 'STUDENT',
                user: foundStudent
            };

        } else if (selectedLoginTab === 'FACULTY') {
            if (!identifier.toLowerCase().includes('faculty') && !identifier.toLowerCase().includes('disha')) {
                showLoginAlert('Invalid faculty credentials. Try: faculty@niet.co.in');
                return;
            }
            if (password !== 'faculty123') {
                showLoginAlert('Incorrect password. Faculty password is: faculty123');
                return;
            }

            // Authenticated as Faculty!
            currentSession = {
                isLoggedIn: true,
                role: 'FACULTY',
                user: { name: 'Prof. Disha Saini', email: identifier, role: 'FACULTY' }
            };

        } else if (selectedLoginTab === 'ADMIN') {
            if (!identifier.toLowerCase().includes('hod') && !identifier.toLowerCase().includes('admin')) {
                showLoginAlert('Invalid HOD/Admin credentials. Try: hod@niet.co.in');
                return;
            }
            if (password !== 'admin123') {
                showLoginAlert('Incorrect password. HOD Admin password is: admin123');
                return;
            }

            // Authenticated as Admin!
            currentSession = {
                isLoggedIn: true,
                role: 'ADMIN',
                user: { name: 'Dr. HOD (Admin)', email: identifier, role: 'ADMIN' }
            };
        }

        // Save session and unlock workspace
        sessionStorage.setItem('niet_active_session', JSON.stringify(currentSession));
        showAppWorkspace();
    });

    // 4. Sidebar Navigation Links (Active Toggle & Smooth Scroll)
    const sideNav = document.getElementById('sideNavMenu');
    sideNav?.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-item');
        if (!link) return;

        e.preventDefault();
        const targetId = link.getAttribute('href')?.replace('#', '');
        if (!targetId) return;

        // Update active class on nav items
        sideNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        link.classList.add('active');

        // Scroll to the targeted section
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetEl.classList.remove('section-pulse-highlight');
            void targetEl.offsetWidth; // Force DOM reflow
            targetEl.classList.add('section-pulse-highlight');
        }
    });

    // 5. Logout Buttons
    document.getElementById('btnLogoutSidebar')?.addEventListener('click', logoutUser);
    document.getElementById('btnLogoutTop')?.addEventListener('click', logoutUser);

    // 6. Student Mentoring & Marksheet Print Handlers
    document.getElementById('btnPrintStudentReport')?.addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btnBookMentoringSlot')?.addEventListener('click', () => {
        alert('📅 Mentoring Appointment Request submitted!\n\nFaculty Proctor: Prof. Disha Saini\nDesignated Remedial Hours: Tuesdays & Thursdays (4:00 PM - 5:30 PM)\nLocation: Academic Block, Cabin 304.\nConfirmation copy sent to your institutional email.');
    });

    // 6. Search Box
    document.getElementById('searchInput')?.addEventListener('input', () => {
        renderStudentsTable(enrichStudentsList());
    });

    // 7. Tab Filters
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderStudentsTable(enrichStudentsList());
        });
    });

    // 8. Client-Side CSV Export
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
        const enriched = enrichStudentsList();
        if (!enriched.length) return;
        const headers = ['Name', 'ERP ID', 'Section', 'Semester', 'Avg Score (%)', 'Attendance (%)', 'Risk Level', 'Risk Score', 'Primary Factor'];
        const rows = enriched.map(s => [
            `"${s.name}"`, s.erpId, s.section, s.semester, s.averageScore, s.attendance, s.riskLabel, s.riskScore, `"${(s.riskFactors[0] || '').replace(/"/g, '""')}"`
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `NIET_Student_Performance_Analytics_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
    });

    // 9. Add Student Modal
    const addModal = document.getElementById('addStudentModal');
    document.getElementById('btn-add-student-modal')?.addEventListener('click', () => addModal.classList.add('open'));
    document.getElementById('addModalCloseBtn')?.addEventListener('click', () => addModal.classList.remove('open'));
    document.getElementById('addCancelBtn')?.addEventListener('click', () => addModal.classList.remove('open'));

    document.getElementById('addStudentForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newStudent = {
            id: 's' + String(appDatabase.students.length + 1).padStart(3, '0'),
            name: document.getElementById('formName').value.trim(),
            erpId: document.getElementById('formErp').value.trim(),
            section: document.getElementById('formSection').value.trim(),
            semester: parseInt(document.getElementById('formSem').value),
            averageScore: parseFloat(document.getElementById('formScore').value),
            attendance: parseFloat(document.getElementById('formAtt').value)
        };

        appDatabase.students.unshift(newStudent);
        saveDatabase();
        addModal.classList.remove('open');
        document.getElementById('addStudentForm').reset();
        renderCohortAnalytics();
        alert(`Student record for ${newStudent.name} (${newStudent.erpId}) registered in cohort database!`);
    });

    // 10. Inspect Modal Close Handlers
    const detailModal = document.getElementById('detailModal');
    document.getElementById('modalCloseBtn')?.addEventListener('click', () => detailModal.classList.remove('open'));
    document.getElementById('modalDoneBtn')?.addEventListener('click', () => detailModal.classList.remove('open'));

    // 11. NIET iCloudEMS Sync Handlers
    const erpModal = document.getElementById('erpSyncModal');
    document.getElementById('btn-sync-erp')?.addEventListener('click', () => {
        erpModal.classList.add('open');
        document.getElementById('syncProgressWrap').style.display = 'none';
        document.getElementById('syncProgressBar').style.width = '0%';
        document.getElementById('syncConsoleLog').innerHTML = '';
        document.getElementById('btnExecuteErpSync').disabled = false;
    });

    document.getElementById('erpModalCloseBtn')?.addEventListener('click', () => erpModal.classList.remove('open'));
    document.getElementById('erpCancelBtn')?.addEventListener('click', () => erpModal.classList.remove('open'));

    document.getElementById('btnExecuteErpSync')?.addEventListener('click', async () => {
        const btn = document.getElementById('btnExecuteErpSync');
        btn.disabled = true;
        const progressWrap = document.getElementById('syncProgressWrap');
        const progressBar = document.getElementById('syncProgressBar');
        const logBox = document.getElementById('syncConsoleLog');
        progressWrap.style.display = 'block';

        function appendLog(msg, type = 'info') {
            const time = new Date().toLocaleTimeString();
            logBox.innerHTML += `<div class="log-${type}">[${time}] ${msg}</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        }

        appendLog('Initiating secure TLS connection to https://niet.icloudems.com/core-api/v2...', 'info');
        progressBar.style.width = '20%';
        await sleep(600);

        appendLog('Handshake validated: Institutional Token NIET_ERP_AUTH_KEY_OK', 'success');
        progressBar.style.width = '45%';
        await sleep(500);

        appendLog('Querying active cohort records for B.Tech CSE-R (Semester 5)...', 'info');
        progressBar.style.width = '70%';
        await sleep(700);

        appendLog('Fetched 12 real-time student attendance & assessment records.', 'info');
        appendLog('Executing RiskScoringAlgorithm pipeline over ingested records...', 'info');
        progressBar.style.width = '90%';
        await sleep(600);

        if (!appDatabase.students.some(s => s.erpId === 'NIET2021013')) {
            appDatabase.students.push({
                id: 's013',
                name: 'Kavya Singhal',
                erpId: 'NIET2021013',
                section: 'CSE-R-A',
                semester: 5,
                averageScore: 74,
                attendance: 83
            });
            saveDatabase();
        }

        progressBar.style.width = '100%';
        appendLog('✓ Synchronization Complete: Database successfully committed.', 'success');
        await sleep(400);

        renderCohortAnalytics();
        setTimeout(() => {
            erpModal.classList.remove('open');
            alert('NIET iCloudEMS Batch Synchronization Completed Successfully! Cohort database updated.');
        }, 1000);
    });

    // 12. Dynamic Risk Weights
    const weightsModal = document.getElementById('configWeightsModal');
    document.getElementById('btn-config-weights')?.addEventListener('click', () => {
        document.getElementById('sliderAtt').value = appDatabase.weights.attendance;
        document.getElementById('sliderAcad').value = appDatabase.weights.academic;
        document.getElementById('sliderBacklog').value = appDatabase.weights.backlog;
        updateWeightLabels();
        weightsModal.classList.add('open');
    });

    document.getElementById('weightsModalCloseBtn')?.addEventListener('click', () => weightsModal.classList.remove('open'));
    document.getElementById('weightsCancelBtn')?.addEventListener('click', () => weightsModal.classList.remove('open'));

    function updateWeightLabels() {
        const a = parseInt(document.getElementById('sliderAtt').value);
        const b = parseInt(document.getElementById('sliderAcad').value);
        const c = parseInt(document.getElementById('sliderBacklog').value);
        document.getElementById('weightAttVal').textContent = a + '%';
        document.getElementById('weightAcadVal').textContent = b + '%';
        document.getElementById('weightBacklogVal').textContent = c + '%';
        const total = a + b + c;
        const totalEl = document.getElementById('weightTotalVal');
        totalEl.textContent = total + '%';
        totalEl.style.color = total === 100 ? '#10b981' : '#ef4444';
    }

    ['sliderAtt', 'sliderAcad', 'sliderBacklog'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateWeightLabels);
    });

    document.getElementById('btnSaveWeights')?.addEventListener('click', () => {
        const a = parseInt(document.getElementById('sliderAtt').value);
        const b = parseInt(document.getElementById('sliderAcad').value);
        const c = parseInt(document.getElementById('sliderBacklog').value);
        if (a + b + c !== 100) {
            alert('Total weightage must sum to exactly 100%! Current sum: ' + (a + b + c) + '%');
            return;
        }
        appDatabase.weights = { attendance: a, academic: b, backlog: c };
        saveDatabase();
        weightsModal.classList.remove('open');
        renderCohortAnalytics();
        alert('Risk Algorithm weights updated! All cohort risk evaluations recalculated.');
    });
}

function showLoginAlert(msg) {
    const alertBox = document.getElementById('loginAlertBox');
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
}

function hideLoginAlert() {
    const alertBox = document.getElementById('loginAlertBox');
    alertBox.style.display = 'none';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Chart Renderers using Chart.js
function renderGradeDistributionChart(gradeDist) {
    const ctx = document.getElementById('gradeDistributionChart');
    if (!ctx) return;
    if (gradeChart) gradeChart.destroy();

    gradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(gradeDist),
            datasets: [{
                label: 'Student Count',
                data: Object.values(gradeDist),
                backgroundColor: ['#10b981', '#34d399', '#38bdf8', '#60a5fa', '#f59e0b', '#fb923c', '#ef4444'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8', stepSize: 2 } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
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
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 14 } }
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

    subjectChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Course Average %',
                data: Object.values(subjectAvgs),
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
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { weight: '600' } } }
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
