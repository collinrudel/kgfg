// Student Data
const STUDENTS = [
    { id: 1, name: 'Emma Johnson', email: 'emma.johnson@school.edu', lexileScore: '725L', totalMinutesRead: 0, username: 'emma.johnson', password: 'student123' },
    { id: 2, name: 'Liam Martinez', email: 'liam.martinez@school.edu', lexileScore: '680L', totalMinutesRead: 0, username: 'liam.martinez', password: 'student123' },
    { id: 3, name: 'Olivia Williams', email: 'olivia.williams@school.edu', lexileScore: '795L', totalMinutesRead: 0, username: 'olivia.williams', password: 'student123' },
    { id: 4, name: 'Noah Brown', email: 'noah.brown@school.edu', lexileScore: '650L', totalMinutesRead: 0, username: 'noah.brown', password: 'student123' },
    { id: 5, name: 'Ava Davis', email: 'ava.davis@school.edu', lexileScore: '770L', totalMinutesRead: 0, username: 'ava.davis', password: 'student123' },
    { id: 6, name: 'Ethan Garcia', email: 'ethan.garcia@school.edu', lexileScore: '615L', totalMinutesRead: 0, username: 'ethan.garcia', password: 'student123' },
    { id: 7, name: 'Sophia Rodriguez', email: 'sophia.rodriguez@school.edu', lexileScore: '740L', totalMinutesRead: 0, username: 'sophia.rodriguez', password: 'student123' },
    { id: 8, name: 'Mason Wilson', email: 'mason.wilson@school.edu', lexileScore: '690L', totalMinutesRead: 0, username: 'mason.wilson', password: 'student123' },
    { id: 9, name: 'Isabella Anderson', email: 'isabella.anderson@school.edu', lexileScore: '785L', totalMinutesRead: 0, username: 'isabella.anderson', password: 'student123' },
    { id: 10, name: 'Lucas Thomas', email: 'lucas.thomas@school.edu', lexileScore: '630L', totalMinutesRead: 0, username: 'lucas.thomas', password: 'student123' },
    { id: 11, name: 'Mia Taylor', email: 'mia.taylor@school.edu', lexileScore: '755L', totalMinutesRead: 0, username: 'mia.taylor', password: 'student123' },
    { id: 12, name: 'Jackson Moore', email: 'jackson.moore@school.edu', lexileScore: '670L', totalMinutesRead: 0, username: 'jackson.moore', password: 'student123' },
    { id: 13, name: 'Charlotte Jackson', email: 'charlotte.jackson@school.edu', lexileScore: '800L', totalMinutesRead: 0, username: 'charlotte.jackson', password: 'student123' },
    { id: 14, name: 'Aiden Martin', email: 'aiden.martin@school.edu', lexileScore: '605L', totalMinutesRead: 0, username: 'aiden.martin', password: 'student123' },
    { id: 15, name: 'Amelia Lee', email: 'amelia.lee@school.edu', lexileScore: '760L', totalMinutesRead: 0, username: 'amelia.lee', password: 'student123' },
];

// Milestone Configuration
const MILESTONES = {
    booksRead: {
        name: 'Books Read',
        icon: '📚',
        unit: 'books',
        tiers: [
            { name: 'Bronze', goal: 3, color: '#CD7F32' },
            { name: 'Silver', goal: 5, color: '#C0C0C0' },
            { name: 'Gold', goal: 10, color: '#FFD700' },
            { name: 'Legendary', goal: 25, color: '#00BFFF' },
            { name: 'Mythic', goal: 50, color: 'rainbow' }
        ]
    },
    minutesRead: {
        name: 'Minutes Read',
        icon: '🕐',
        unit: 'minutes',
        tiers: [
            { name: 'Bronze', goal: 300, color: '#CD7F32' },
            { name: 'Silver', goal: 600, color: '#C0C0C0' },
            { name: 'Gold', goal: 1200, color: '#FFD700' },
            { name: 'Legendary', goal: 3000, color: '#00BFFF' },
            { name: 'Mythic', goal: 12000, color: 'rainbow' }
        ]
    }
};

// State
let state = {
    user: null,
    students: [],
    readingLogs: [],
    studentBooks: {}, // { studentId: [{ id, title, author, cover, status, dateAdded }] }
    studentWishlist: {}, // { studentId: [{ id, title, author, cover, dateAdded }] }
    challenges: [], // { id, name, description, thumbnail, type, tiers: [{ name, goal, points, icon }], startDate, endDate, createdBy }
    earnedBadges: {}, // { studentId: [{ id, challengeId, tierIndex, dateEarned, badgeName, badgeIcon, startDate, endDate }] }
    studentPoints: {}, // { studentId: { total: N, completed: [{ challengeId, tierIndex, tierName, points, dateEarned }] } }
    currentPage: 'dashboard',
    selectedBook: null // Temporary storage for selected book from API
};

// Initialize from localStorage
function initializeState() {
    const storedUser = localStorage.getItem('user');
    const storedStudents = localStorage.getItem('students');
    const storedLogs = localStorage.getItem('readingLogs');

    if (storedUser) {
        state.user = JSON.parse(storedUser);
    }

    if (storedStudents) {
        state.students = JSON.parse(storedStudents);
        // Check if students have username/password fields, if not, reset
        if (state.students.length > 0 && !state.students[0].username) {
            console.log('Resetting students with new login credentials');
            state.students = [...STUDENTS];
            localStorage.setItem('students', JSON.stringify(state.students));
        }
    } else {
        state.students = [...STUDENTS];
        localStorage.setItem('students', JSON.stringify(state.students));
    }

    if (storedLogs) {
        state.readingLogs = JSON.parse(storedLogs);
    }

    const storedBooks = localStorage.getItem('studentBooks');
    if (storedBooks) {
        state.studentBooks = JSON.parse(storedBooks);
    }

    // Retroactively set dateFinished for Olivia Williams (id: 3)
    if (state.studentBooks[3]) {
        const dateFinishedMap = {
            'The Hunger Games': '2026-02-06',
            'The Seven Husbands of Evelyn Hugo': '2026-02-09',
            'Atomic Habits': '2026-02-09'
        };
        state.studentBooks[3].forEach(book => {
            if (!book.dateFinished && dateFinishedMap[book.title]) {
                book.dateFinished = dateFinishedMap[book.title];
            }
        });
        localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));
    }

    const storedWishlist = localStorage.getItem('studentWishlist');
    if (storedWishlist) {
        state.studentWishlist = JSON.parse(storedWishlist);
    }

    const storedChallenges = localStorage.getItem('challenges');
    if (storedChallenges) {
        state.challenges = JSON.parse(storedChallenges);
    }

    const storedBadges = localStorage.getItem('earnedBadges');
    if (storedBadges) {
        state.earnedBadges = JSON.parse(storedBadges);
    }

    const storedPoints = localStorage.getItem('studentPoints');
    if (storedPoints) {
        state.studentPoints = JSON.parse(storedPoints);
    }

    // Migrate month/year-based challenges to date range format
    let challengesMigrated = false;
    state.challenges.forEach(challenge => {
        if (challenge.month !== undefined && !challenge.startDate) {
            const lastDay = new Date(challenge.year, challenge.month + 1, 0).getDate();
            challenge.startDate = `${challenge.year}-${String(challenge.month + 1).padStart(2, '0')}-01`;
            challenge.endDate = `${challenge.year}-${String(challenge.month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
            delete challenge.month;
            delete challenge.year;
            challengesMigrated = true;
        }
    });
    if (challengesMigrated) {
        localStorage.setItem('challenges', JSON.stringify(state.challenges));
    }

    // Migrate month/year-based earned badges to date range format
    let badgesMigrated = false;
    Object.values(state.earnedBadges).forEach(badges => {
        badges.forEach(badge => {
            if (badge.month !== undefined && !badge.startDate) {
                const lastDay = new Date(badge.year, badge.month + 1, 0).getDate();
                badge.startDate = `${badge.year}-${String(badge.month + 1).padStart(2, '0')}-01`;
                badge.endDate = `${badge.year}-${String(badge.month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                delete badge.month;
                delete badge.year;
                badgesMigrated = true;
            }
        });
    });
    if (badgesMigrated) {
        localStorage.setItem('earnedBadges', JSON.stringify(state.earnedBadges));
    }

    // Migrate single-goal challenges to tier-based format
    let tiersMigrated = false;
    state.challenges.forEach(challenge => {
        if (challenge.goal !== undefined && !challenge.tiers) {
            challenge.tiers = [{ name: 'Complete', goal: challenge.goal, points: 10 }];
            delete challenge.goal;
            tiersMigrated = true;
        }
    });
    if (tiersMigrated) {
        localStorage.setItem('challenges', JSON.stringify(state.challenges));
    }

    // Migrate challenge icon to thumbnail + tier icons
    let thumbnailMigrated = false;
    state.challenges.forEach(challenge => {
        if (challenge.icon && !challenge.thumbnail) {
            challenge.thumbnail = challenge.icon;
            (challenge.tiers || []).forEach(tier => {
                if (!tier.icon) tier.icon = challenge.icon;
            });
            delete challenge.icon;
            thumbnailMigrated = true;
        }
    });
    if (thumbnailMigrated) {
        localStorage.setItem('challenges', JSON.stringify(state.challenges));
    }

    // Deduplicate earned badges, fix legacy tierIndex, and fix One-and-Done badge names
    let badgesDeduped = false;
    Object.keys(state.earnedBadges).forEach(studentId => {
        const badges = state.earnedBadges[studentId];
        // First pass: normalize badges missing tierIndex + fix badge names
        badges.forEach(badge => {
            if (badge.tierIndex === undefined) {
                badge.tierIndex = 0;
                badgesDeduped = true;
            }
            // Fix One-and-Done badge names (e.g. "Spirit Week - Complete" → "Spirit Week")
            const challenge = state.challenges.find(c => c.id === badge.challengeId);
            if (challenge && challenge.tiers && challenge.tiers.length === 1) {
                if (badge.badgeName !== challenge.name) {
                    badge.badgeName = challenge.name;
                    badgesDeduped = true;
                }
            }
        });
        // Second pass: deduplicate by challengeId + tierIndex
        const seen = new Set();
        const dedupedBadges = badges.filter(badge => {
            const key = `${badge.challengeId}-${badge.tierIndex || 0}`;
            if (seen.has(key)) {
                badgesDeduped = true;
                return false;
            }
            seen.add(key);
            return true;
        });
        state.earnedBadges[studentId] = dedupedBadges;
    });
    if (badgesDeduped) {
        localStorage.setItem('earnedBadges', JSON.stringify(state.earnedBadges));
    }
}

// Date Range Helper
function formatDateRange(startDate, endDate) {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const startStr = `${String(sm).padStart(2, '0')}/${String(sd).padStart(2, '0')}/${sy}`;
    const endStr = `${String(em).padStart(2, '0')}/${String(ed).padStart(2, '0')}/${ey}`;
    return `${startStr} - ${endStr}`;
}

// Login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    // Check teacher login
    if (username === 'teacher_user' && password === 'teacher2023#') {
        state.user = { username, role: 'teacher' };
        localStorage.setItem('user', JSON.stringify(state.user));
        errorEl.classList.add('hidden');
        showTeacherApp();
        return;
    }
    
    // Check student login
    const student = state.students.find(s => s.username === username && s.password === password);
    if (student) {
        state.user = { 
            username, 
            role: 'student', 
            studentId: student.id,
            name: student.name 
        };
        localStorage.setItem('user', JSON.stringify(state.user));
        errorEl.classList.add('hidden');
        showStudentApp();
        return;
    }
    
    errorEl.textContent = 'Invalid username or password';
    errorEl.classList.remove('hidden');
}

// Monthly Reading Goal Functions
function getMonthlyGoal() {
    const storedGoal = localStorage.getItem('monthlyReadingGoal');
    return storedGoal ? parseInt(storedGoal) : 1000; // Default 1000 minutes
}

function setMonthlyGoal(goal) {
    localStorage.setItem('monthlyReadingGoal', goal.toString());
    updateAllProgressBars();
}

function calculateClassMonthlyMinutes() {
    const now = new Date();
    const allLogs = state.readingLogs;
    return calculateMinutesForPeriod(allLogs, 'month', now);
}

function updateProgressBar(current, goal, markerElementId, textElementId) {
    const percentage = Math.min((current / goal) * 100, 100);
    const marker = document.getElementById(markerElementId);
    const text = document.getElementById(textElementId);

    if (marker) {
        // Temporarily hide filter during transition to prevent white trail artifacts
        marker.style.filter = 'none';
        marker.style.left = `${percentage}%`;
        // Restore filter after transition completes
        setTimeout(() => {
            marker.style.filter = '';
        }, 550);
    }
    if (text) {
        text.textContent = `${current} / ${goal} minutes`;
    }
}

function updateTeacherProgressBar() {
    const classMinutes = calculateClassMonthlyMinutes();
    const goal = getMonthlyGoal();
    updateProgressBar(classMinutes, goal, 'teacher-vehicle-marker', 'teacher-progress-text');
}

function updateStudentProgressBar() {
    if (!state.user || state.user.role !== 'student') return;

    const studentLogs = state.readingLogs.filter(log => log.studentId === state.user.studentId);
    const now = new Date();
    const studentMinutes = calculateMinutesForPeriod(studentLogs, 'month', now);
    const goal = getMonthlyGoal();
    updateProgressBar(studentMinutes, goal, 'student-vehicle-marker', 'student-progress-text');
}

function updateAllProgressBars() {
    if (state.user) {
        if (state.user.role === 'teacher') {
            updateTeacherProgressBar();
        } else if (state.user.role === 'student') {
            updateStudentProgressBar();
        }
    }
}

// School Year Months (shared)
const schoolYearMonths = [
    { year: 2025, month: 7, label: 'Aug', fullLabel: 'August 2025' },
    { year: 2025, month: 8, label: 'Sep', fullLabel: 'September 2025' },
    { year: 2025, month: 9, label: 'Oct', fullLabel: 'October 2025' },
    { year: 2025, month: 10, label: 'Nov', fullLabel: 'November 2025' },
    { year: 2025, month: 11, label: 'Dec', fullLabel: 'December 2025' },
    { year: 2026, month: 0, label: 'Jan', fullLabel: 'January 2026' },
    { year: 2026, month: 1, label: 'Feb', fullLabel: 'February 2026' },
    { year: 2026, month: 2, label: 'Mar', fullLabel: 'March 2026' },
    { year: 2026, month: 3, label: 'Apr', fullLabel: 'April 2026' },
    { year: 2026, month: 4, label: 'May', fullLabel: 'May 2026' }
];

// Books Finished Bar Chart
function renderBooksFinishedChart() {
    const chartEl = document.getElementById('books-finished-chart');
    if (!chartEl) return;

    const monthlyCounts = schoolYearMonths.map(() => 0);

    Object.values(state.studentBooks).forEach(books => {
        books.forEach(book => {
            if (book.status === 'Finished' && book.dateFinished) {
                const [year, month] = book.dateFinished.split('-').map(Number);
                const monthIndex = schoolYearMonths.findIndex(
                    m => m.year === year && m.month === month - 1
                );
                if (monthIndex !== -1) {
                    monthlyCounts[monthIndex]++;
                }
            }
        });
    });

    const maxCount = Math.max(...monthlyCounts, 1);

    chartEl.innerHTML = schoolYearMonths.map((m, i) => {
        const count = monthlyCounts[i];
        const heightPercent = (count / maxCount) * 100;
        return `
            <div class="bar-column" onclick="showBooksFinishedDetail(${m.year}, ${m.month})">
                <div class="bar-data-label">${count}</div>
                <div class="bar-fill" style="height: ${heightPercent}%;"></div>
                <div class="bar-label">${m.label}</div>
            </div>
        `;
    }).join('');
}

// Badges Earned Bar Chart
function renderBadgesEarnedChart() {
    const chartEl = document.getElementById('badges-earned-chart');
    if (!chartEl) return;

    const monthlyCounts = schoolYearMonths.map(() => 0);

    Object.values(state.earnedBadges).forEach(badges => {
        badges.forEach(badge => {
            if (badge.dateEarned) {
                const earnedDate = new Date(badge.dateEarned);
                const year = earnedDate.getFullYear();
                const month = earnedDate.getMonth();
                const monthIndex = schoolYearMonths.findIndex(
                    m => m.year === year && m.month === month
                );
                if (monthIndex !== -1) {
                    monthlyCounts[monthIndex]++;
                }
            }
        });
    });

    const maxCount = Math.max(...monthlyCounts, 1);

    chartEl.innerHTML = schoolYearMonths.map((m, i) => {
        const count = monthlyCounts[i];
        const heightPercent = (count / maxCount) * 100;
        return `
            <div class="bar-column" onclick="showBadgesEarnedDetail(${m.year}, ${m.month})">
                <div class="bar-data-label">${count}</div>
                <div class="bar-fill" style="height: ${heightPercent}%;"></div>
                <div class="bar-label">${m.label}</div>
            </div>
        `;
    }).join('');
}

// Chart Detail Modal Functions
function openChartDetailModal(title, bodyHTML) {
    document.getElementById('chart-detail-title').textContent = title;
    document.getElementById('chart-detail-body').innerHTML = bodyHTML;
    document.getElementById('chart-detail-modal').classList.remove('hidden');
}

function closeChartDetailModal() {
    document.getElementById('chart-detail-modal').classList.add('hidden');
}

function showBooksFinishedDetail(year, month) {
    const monthInfo = schoolYearMonths.find(m => m.year === year && m.month === month);
    if (!monthInfo) return;

    // Gather all finished books for this month across all students
    const rows = [];
    Object.entries(state.studentBooks).forEach(([studentId, books]) => {
        const student = state.students.find(s => s.id == studentId);
        if (!student) return;

        books.forEach(book => {
            if (book.status === 'Finished' && book.dateFinished) {
                const [y, m] = book.dateFinished.split('-').map(Number);
                if (y === year && m - 1 === month) {
                    // Calculate total reading time for this book by this student
                    const bookLogs = state.readingLogs.filter(
                        log => log.studentId == studentId && log.bookTitle === book.title
                    );
                    const totalMinutes = bookLogs.reduce((sum, log) => sum + log.minutesRead, 0);

                    const [fy, fm, fd] = book.dateFinished.split('-');
                    const dateFormatted = `${fm}/${fd}/${fy}`;

                    rows.push({
                        student: student.name,
                        title: book.title,
                        dateFinished: dateFormatted,
                        totalMinutes: totalMinutes
                    });
                }
            }
        });
    });

    let bodyHTML;
    if (rows.length === 0) {
        bodyHTML = '<p class="no-data-message">No books finished this month.</p>';
    } else {
        bodyHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Book Title</th>
                        <th>Date Finished</th>
                        <th>Total Reading Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td>${r.student}</td>
                            <td>${r.title}</td>
                            <td>${r.dateFinished}</td>
                            <td>${r.totalMinutes} min</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    openChartDetailModal(`Books Finished - ${monthInfo.fullLabel}`, bodyHTML);
}

function showBadgesEarnedDetail(year, month) {
    const monthInfo = schoolYearMonths.find(m => m.year === year && m.month === month);
    if (!monthInfo) return;

    const rows = [];
    Object.entries(state.earnedBadges).forEach(([studentId, badges]) => {
        const student = state.students.find(s => s.id == studentId);
        if (!student) return;

        badges.forEach(badge => {
            if (badge.dateEarned) {
                const earnedDate = new Date(badge.dateEarned);
                if (earnedDate.getFullYear() === year && earnedDate.getMonth() === month) {
                    // Find the challenge to get requirements
                    const challenge = state.challenges.find(c => c.id === badge.challengeId);
                    const badgeName = badge.badgeName || badge.challengeName || '';
                    let requirements = badgeName;
                    if (challenge && badge.tierIndex !== undefined) {
                        const tier = (challenge.tiers || [])[badge.tierIndex];
                        if (tier) {
                            const typeLabel = challenge.type === 'minutes' ? 'minutes' :
                                (challenge.type === 'books' ? 'books' : 'day streak');
                            requirements = `${tier.goal} ${typeLabel} (${tier.points} pts)`;
                        }
                    }

                    const dateFormatted = `${earnedDate.getMonth() + 1}/${earnedDate.getDate()}/${earnedDate.getFullYear()}`;

                    rows.push({
                        student: student.name,
                        badgeName: badgeName,
                        requirements: requirements,
                        dateEarned: dateFormatted
                    });
                }
            }
        });
    });

    let bodyHTML;
    if (rows.length === 0) {
        bodyHTML = '<p class="no-data-message">No badges earned this month.</p>';
    } else {
        bodyHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Badge Name</th>
                        <th>Requirements</th>
                        <th>Date Earned</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td>${r.student}</td>
                            <td>${r.badgeName}</td>
                            <td>${r.requirements}</td>
                            <td>${r.dateEarned}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    openChartDetailModal(`Badges Earned - ${monthInfo.fullLabel}`, bodyHTML);
}

function showTeacherApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    navigateToPage('dashboard');
    renderStudentsCheckboxList();
    renderStudentsTable();
    renderLeaderboard();
}

function showStudentApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('student-app-screen').classList.add('active');
    navigateToStudentPage('reading-minutes');
    renderStudentReadingPage();
    updatePointsDisplay(state.user.studentId);
}

function navigateToStudentPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.student-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageMap = {
        'reading-minutes': 'reading-minutes-page',
        'books': 'books-page',
        'badges': 'badges-page',
        'milestones': 'milestones-page'
    };
    
    const pageId = pageMap[pageName];
    if (pageId) {
        document.getElementById(pageId).classList.add('active');
    }
    
    // Render content for reading minutes page
    if (pageName === 'reading-minutes') {
        renderStudentReadingPage();
    }

    // Render content for books page
    if (pageName === 'books') {
        renderBooksPage();
    }

    // Render content for milestones page
    if (pageName === 'milestones') {
        renderMilestonesPage();
    }

    // Render content for badges page
    if (pageName === 'badges') {
        renderStudentBadgesPage();
    }
}

function renderStudentReadingPage() {
    const user = state.user;
    const student = state.students.find(s => s.id === user.studentId);
    
    // Update header name
    document.getElementById('student-name-header').textContent = student.name;
    
    // Get all reading logs for this student
    const studentLogs = state.readingLogs.filter(log => log.studentId === user.studentId);
    
    // Calculate time periods
    const now = new Date();
    const thisWeekMinutes = calculateMinutesForPeriod(studentLogs, 'week', now);
    const thisMonthMinutes = calculateMinutesForPeriod(studentLogs, 'month', now);
    const thisYearMinutes = calculateMinutesForPeriod(studentLogs, 'year', now);
    const readingStreak = calculateReadingStreak(studentLogs);

    // Update stat cards
    document.getElementById('minutes-this-week').textContent = thisWeekMinutes;
    document.getElementById('minutes-this-month').textContent = thisMonthMinutes;
    document.getElementById('minutes-this-year').textContent = thisYearMinutes;
    document.getElementById('reading-streak').textContent = readingStreak;
    document.getElementById('header-streak-number').textContent = readingStreak;

    // Update progress bar
    updateStudentProgressBar();

    // Render reading logs table
    renderStudentReadingLogs();
}

function calculateMinutesForPeriod(logs, period, referenceDate) {
    const refDate = new Date(referenceDate);

    // Helper function to parse date string as local date
    function parseLocalDate(date) {
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = date.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(date);
    }

    return logs.reduce((total, log) => {
        const logDate = parseLocalDate(log.date);
        let inPeriod = false;

        if (period === 'week') {
            // Get Monday of current week
            const monday = new Date(refDate);
            const day = monday.getDay();
            const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
            monday.setDate(monday.getDate() + diff);
            monday.setHours(0, 0, 0, 0);

            // Get Sunday of current week
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            inPeriod = logDate >= monday && logDate <= sunday;
        } else if (period === 'month') {
            inPeriod = logDate.getMonth() === refDate.getMonth() &&
                      logDate.getFullYear() === refDate.getFullYear();
        } else if (period === 'year') {
            inPeriod = logDate.getFullYear() === refDate.getFullYear();
        }

        return inPeriod ? total + log.minutesRead : total;
    }, 0);
}

function calculateReadingStreak(logs) {
    if (logs.length === 0) return 0;

    // Helper function to get date string in local timezone
    function getLocalDateString(date) {
        let d;
        if (typeof date === 'string') {
            // Parse YYYY-MM-DD string as local date
            const [year, month, day] = date.split('-').map(Number);
            d = new Date(year, month - 1, day);
        } else {
            d = new Date(date);
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Helper function to parse date string to local midnight
    function parseLocalDate(dateStr) {
        // Parse YYYY-MM-DD string as local date
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    // Get unique dates sorted descending (newest first)
    const uniqueDates = [...new Set(logs.map(log => getLocalDateString(log.date)))].sort().reverse();

    if (uniqueDates.length === 0) return 0;

    // Get today at midnight in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse the most recent reading date
    const mostRecentDateStr = uniqueDates[0];
    const mostRecentDate = parseLocalDate(mostRecentDateStr);

    // Calculate days since last reading
    const daysSinceLastReading = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));

    // If last reading was more than 1 day ago, streak is 0
    if (daysSinceLastReading > 1) return 0;

    // Count consecutive days backwards from most recent date
    let streak = 0;
    let currentCheckDate = parseLocalDate(mostRecentDateStr);

    for (const dateStr of uniqueDates) {
        const expectedDateStr = getLocalDateString(currentCheckDate);

        if (dateStr === expectedDateStr) {
            streak++;
            // Move back one day for next iteration
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
            // Gap found, stop counting
            break;
        }
    }

    return streak;
}

let readingLogPage = 1;
const READING_LOG_PER_PAGE = 10;

function renderStudentReadingLogs() {
    const user = state.user;
    const studentLogs = state.readingLogs.filter(log => log.studentId === user.studentId);

    const tbody = document.getElementById('student-reading-logs');
    const paginationEl = document.getElementById('reading-log-pagination');
    tbody.innerHTML = '';
    paginationEl.innerHTML = '';

    if (studentLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No reading logs yet</td></tr>';
        return;
    }

    // Sort by date descending, then by time logged descending (using id as timestamp)
    studentLogs.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA; // Different dates: sort by date descending
        }
        // Same date: sort by id descending (most recent logged first)
        return b.id - a.id;
    });

    const totalPages = Math.ceil(studentLogs.length / READING_LOG_PER_PAGE);
    if (readingLogPage > totalPages) readingLogPage = totalPages;

    const start = (readingLogPage - 1) * READING_LOG_PER_PAGE;
    const pageLogs = studentLogs.slice(start, start + READING_LOG_PER_PAGE);

    pageLogs.forEach(log => {
        const tr = document.createElement('tr');
        const loggedBy = log.loggedBy === 'student' ? 'Self' : 'Teacher';
        
        // Make "Free Reading" clickable so student can assign to a book
        let bookTitleContent;
        if (log.isFreeReading) {
            bookTitleContent = `<span class="free-reading-link" onclick="openEditFreeReadingModal(${log.id})" style="cursor: pointer; color: #3498db; text-decoration: underline;">Free Reading</span>`;
        } else {
            bookTitleContent = log.bookTitle;
        }
        
        tr.innerHTML = `
            <td>${formatDateForDisplay(log.date)}</td>
            <td>${bookTitleContent}</td>
            <td>${log.minutesRead}</td>
            <td>${loggedBy}</td>
        `;
        tbody.appendChild(tr);
    });

    // Render pagination controls
    if (totalPages > 1) {
        let html = '';
        html += `<button class="pagination-btn" ${readingLogPage === 1 ? 'disabled' : ''} onclick="changeReadingLogPage(${readingLogPage - 1})">&laquo; Prev</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-btn ${i === readingLogPage ? 'active' : ''}" onclick="changeReadingLogPage(${i})">${i}</button>`;
        }
        html += `<button class="pagination-btn" ${readingLogPage === totalPages ? 'disabled' : ''} onclick="changeReadingLogPage(${readingLogPage + 1})">Next &raquo;</button>`;
        paginationEl.innerHTML = html;
    }
}

function changeReadingLogPage(page) {
    readingLogPage = page;
    renderStudentReadingLogs();
}

// Helper function to get local date in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to format date string for display (avoids timezone issues)
function formatDateForDisplay(dateString) {
    // dateString is in YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day).toLocaleDateString();
}

// Functions for editing free reading logs
function openEditFreeReadingModal(logId) {
    const log = state.readingLogs.find(l => l.id === logId);
    if (!log || !log.isFreeReading) return;

    const studentId = state.user.studentId;
    const studentBooks = state.studentBooks[studentId] || [];

    // Create modal content with list of student's books
    let modalHTML = `
        <div id="edit-free-reading-modal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeEditFreeReadingModal()">&times;</span>
                <h2>Assign Book to Free Reading</h2>
                <p>Select which book you were reading, or add a new one:</p>
                <div id="free-reading-book-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
    `;

    // Show current books
    if (studentBooks.length > 0) {
        modalHTML += '<div style="margin-bottom: 1rem;"><strong>Your Books:</strong></div>';
        studentBooks.forEach(book => {
            const coverImg = book.cover ? `<img src="${book.cover}" style="width: 40px; height: 60px; object-fit: cover; margin-right: 0.75rem; border-radius: 3px;">` : '<div style="width: 40px; height: 60px; background: #ddd; margin-right: 0.75rem; border-radius: 3px; display: flex; align-items: center; justify-content: center;">📖</div>';
            modalHTML += `
                <button class="free-reading-book-option" onclick="assignBookToFreeReading(${logId}, '${book.title.replace(/'/g, "\\'")}', ${studentId})">
                    ${coverImg}
                    <div style="text-align: left;">
                        <div style="font-weight: 500;">${book.title}</div>
                        <div style="font-size: 0.85rem; color: #666;">by ${book.author}</div>
                    </div>
                </button>
            `;
        });
    }

    // Option to search for new book
    modalHTML += `
                </div>
                <div style="border-top: 1px solid #ddd; padding-top: 1rem;">
                    <strong>Or search for a book:</strong>
                    <input type="text" id="free-reading-search" placeholder="Search books..." style="width: 100%; padding: 0.5rem; margin-top: 0.5rem;">
                    <div id="free-reading-search-results" style="margin-top: 0.5rem;"></div>
                </div>
            </div>
        </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('edit-free-reading-modal').classList.add('active');

    // Add search functionality
    document.getElementById('free-reading-search').addEventListener('input', (e) => {
        handleFreeReadingBookSearch(e, logId, studentId);
    });
}

function closeEditFreeReadingModal() {
    const modal = document.getElementById('edit-free-reading-modal');
    if (modal) {
        modal.remove();
    }
}

let freeReadingSearchTimeout;
function handleFreeReadingBookSearch(e, logId, studentId) {
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('free-reading-search-results');

    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    clearTimeout(freeReadingSearchTimeout);
    freeReadingSearchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();

            if (data.docs && data.docs.length > 0) {
                resultsDiv.innerHTML = data.docs.map((book, index) => {
                    const title = book.title || 'Unknown Title';
                    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
                    const coverId = book.cover_i;
                    const thumbnail = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

                    return `
                        <button class="free-reading-book-option" onclick="assignNewBookToFreeReading(${logId}, '${title.replace(/'/g, "\\'")}', '${authors.replace(/'/g, "\\'")}', '${coverId || ''}', ${studentId})">
                            ${thumbnail ? `<img src="${thumbnail}" style="width: 40px; height: 60px; object-fit: cover; margin-right: 0.75rem; border-radius: 3px;">` : '<div style="width: 40px; height: 60px; background: #ddd; margin-right: 0.75rem; border-radius: 3px; display: flex; align-items: center; justify-content: center;">📚</div>'}
                            <div style="text-align: left;">
                                <div style="font-weight: 500;">${title}</div>
                                <small>by ${authors}</small>
                            </div>
                        </button>
                    `;
                }).join('');
            } else {
                resultsDiv.innerHTML = '<div style="color: #999;">No books found</div>';
            }
        } catch (error) {
            console.error('Error searching books:', error);
            resultsDiv.innerHTML = '<div style="color: #999;">Error searching books</div>';
        }
    }, 300);
}

function assignBookToFreeReading(logId, bookTitle, studentId) {
    const log = state.readingLogs.find(l => l.id === logId);
    if (!log) return;

    // Update the reading log with the book title
    log.bookTitle = bookTitle;
    log.isFreeReading = false;

    // Add book to student's books if not already there
    if (!state.studentBooks[studentId]) {
        state.studentBooks[studentId] = [];
    }

    const existingBook = state.studentBooks[studentId].find(b => b.title === bookTitle);
    if (!existingBook) {
        const book = state.studentBooks[studentId].find(b => b.title === bookTitle);
        if (!book) {
            state.studentBooks[studentId].push({
                id: Date.now() + Math.random(),
                title: bookTitle,
                author: 'Unknown',
                cover: '',
                status: 'Reading',
                dateAdded: new Date().toISOString()
            });
        }
    }

    // Save changes
    localStorage.setItem('readingLogs', JSON.stringify(state.readingLogs));
    localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));

    closeEditFreeReadingModal();
    renderStudentReadingPage();
}

function assignNewBookToFreeReading(logId, bookTitle, authors, coverId, studentId) {
    const log = state.readingLogs.find(l => l.id === logId);
    if (!log) return;

    const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

    // Update the reading log with the book title
    log.bookTitle = bookTitle;
    log.isFreeReading = false;

    // Add book to student's books
    if (!state.studentBooks[studentId]) {
        state.studentBooks[studentId] = [];
    }

    const existingBook = state.studentBooks[studentId].find(b => b.title === bookTitle);
    if (!existingBook) {
        state.studentBooks[studentId].push({
            id: Date.now() + Math.random(),
            title: bookTitle,
            author: authors,
            cover: cover,
            status: 'Reading',
            dateAdded: new Date().toISOString()
        });
    }

    // Save changes
    localStorage.setItem('readingLogs', JSON.stringify(state.readingLogs));
    localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));

    closeEditFreeReadingModal();
    renderStudentReadingPage();
}

function openStudentLogReadingModal() {
    const dateInput = document.getElementById('student-reading-date');
    const today = new Date();

    // Set default date to today
    dateInput.value = getLocalDateString();

    // Set date restrictions: first day of current month to today
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    dateInput.min = getLocalDateString(firstDayOfMonth);
    dateInput.max = getLocalDateString(today);

    document.getElementById('student-log-reading-modal').classList.remove('hidden');
}

function closeStudentLogReadingModal() {
    document.getElementById('student-log-reading-modal').classList.add('hidden');
    document.getElementById('student-log-reading-form').reset();
    document.getElementById('student-book-results').innerHTML = '';
    resetTimerState();
    setLogMode('manual');
}

// Reading Timer
let readingTimerInterval = null;
let readingTimerSeconds = 0;
let readingTimerRunning = false;
let readingTimerFinished = false;
let currentLogMode = 'manual';

function setLogMode(mode) {
    currentLogMode = mode;
    document.getElementById('log-mode-manual-btn').classList.toggle('active', mode === 'manual');
    document.getElementById('log-mode-timer-btn').classList.toggle('active', mode === 'timer');

    const manualDateGroup = document.getElementById('manual-date-group');
    const manualMinutesGroup = document.getElementById('manual-minutes-group');
    const timerGroup = document.getElementById('timer-group');
    const dateInput = document.getElementById('student-reading-date');
    const minutesInput = document.getElementById('student-minutes-read');

    if (mode === 'manual') {
        manualDateGroup.classList.remove('hidden');
        manualMinutesGroup.classList.remove('hidden');
        timerGroup.classList.add('hidden');
        dateInput.required = true;
        minutesInput.required = true;
    } else {
        manualDateGroup.classList.add('hidden');
        manualMinutesGroup.classList.add('hidden');
        timerGroup.classList.remove('hidden');
        dateInput.required = false;
        minutesInput.required = false;
        resetTimerState();
    }
}

function resetTimerState() {
    if (readingTimerInterval) {
        clearInterval(readingTimerInterval);
        readingTimerInterval = null;
    }
    readingTimerSeconds = 0;
    readingTimerRunning = false;
    readingTimerFinished = false;

    document.getElementById('timer-display-text').textContent = '00:00';
    document.getElementById('timer-start-btn').classList.remove('hidden');
    document.getElementById('timer-pause-btn').classList.add('hidden');
    document.getElementById('timer-resume-btn').classList.add('hidden');
    document.getElementById('timer-end-btn').classList.add('hidden');
    document.getElementById('timer-result').classList.add('hidden');
    document.getElementById('student-log-submit-btn').disabled = false;
}

function updateTimerDisplay() {
    const minutes = Math.floor(readingTimerSeconds / 60);
    const seconds = readingTimerSeconds % 60;
    document.getElementById('timer-display-text').textContent =
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function startReadingTimer() {
    readingTimerRunning = true;
    readingTimerFinished = false;
    document.getElementById('timer-start-btn').classList.add('hidden');
    document.getElementById('timer-pause-btn').classList.remove('hidden');
    document.getElementById('timer-end-btn').classList.remove('hidden');
    document.getElementById('timer-resume-btn').classList.add('hidden');
    document.getElementById('timer-result').classList.add('hidden');
    document.getElementById('student-log-submit-btn').disabled = true;

    readingTimerInterval = setInterval(() => {
        readingTimerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function pauseReadingTimer() {
    readingTimerRunning = false;
    clearInterval(readingTimerInterval);
    readingTimerInterval = null;
    document.getElementById('timer-pause-btn').classList.add('hidden');
    document.getElementById('timer-resume-btn').classList.remove('hidden');
}

function resumeReadingTimer() {
    readingTimerRunning = true;
    document.getElementById('timer-resume-btn').classList.add('hidden');
    document.getElementById('timer-pause-btn').classList.remove('hidden');

    readingTimerInterval = setInterval(() => {
        readingTimerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function endReadingTimer() {
    readingTimerRunning = false;
    readingTimerFinished = true;
    clearInterval(readingTimerInterval);
    readingTimerInterval = null;

    const roundedMinutes = Math.round(readingTimerSeconds / 60);
    const displayMinutes = Math.max(roundedMinutes, 1); // At least 1 minute

    document.getElementById('timer-pause-btn').classList.add('hidden');
    document.getElementById('timer-resume-btn').classList.add('hidden');
    document.getElementById('timer-end-btn').classList.add('hidden');
    document.getElementById('timer-start-btn').classList.add('hidden');

    const resultEl = document.getElementById('timer-result');
    resultEl.textContent = `${displayMinutes} minute${displayMinutes !== 1 ? 's' : ''} recorded`;
    resultEl.classList.remove('hidden');

    document.getElementById('student-log-submit-btn').disabled = false;
}

// Celebration Modal
function showCelebration(minutes) {
    const modal = document.getElementById('celebration-modal');
    document.getElementById('celebration-text').textContent = `Congrats! You logged ${minutes} minutes.`;
    modal.classList.remove('hidden');

    spawnBalloons();
    spawnFireworks();

    // Focus the continue button so Enter works immediately
    setTimeout(() => {
        document.getElementById('celebration-continue-btn').focus();
    }, 100);
}

function closeCelebration() {
    const modal = document.getElementById('celebration-modal');
    modal.classList.add('hidden');
    document.getElementById('balloons-container').innerHTML = '';
    document.getElementById('fireworks-container').innerHTML = '';
}

function spawnBalloons() {
    const container = document.getElementById('balloons-container');
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#ff6b9d'];
    for (let i = 0; i < 15; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = Math.random() * 100 + '%';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.animationDuration = (3 + Math.random() * 3) + 's';
        balloon.style.animationDelay = (Math.random() * 1.5) + 's';
        balloon.style.width = (40 + Math.random() * 25) + 'px';
        balloon.style.height = (50 + Math.random() * 30) + 'px';
        container.appendChild(balloon);
    }
}

function spawnFireworks() {
    const container = document.getElementById('fireworks-container');
    const colors = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#9b59b6', '#ff6b9d', '#fff', '#e67e22'];

    function createBurst() {
        const cx = 10 + Math.random() * 80; // % from left
        const cy = 10 + Math.random() * 50; // % from top
        const burstColor = colors[Math.floor(Math.random() * colors.length)];
        const particleCount = 20 + Math.floor(Math.random() * 15);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-burst';
            particle.style.left = cx + '%';
            particle.style.top = cy + '%';
            particle.style.backgroundColor = burstColor;
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.3);
            const distance = 60 + Math.random() * 80;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            particle.style.animationDuration = (0.6 + Math.random() * 0.5) + 's';
            particle.style.animationDelay = Math.random() * 0.15 + 's';
            container.appendChild(particle);

            // Clean up particle after animation
            setTimeout(() => particle.remove(), 1200);
        }
    }

    // Fire multiple bursts over time
    createBurst();
    setTimeout(createBurst, 400);
    setTimeout(createBurst, 800);
    setTimeout(createBurst, 1300);
    setTimeout(createBurst, 1800);
    setTimeout(createBurst, 2400);
}

function handleStudentLogReadingSubmit(e) {
    e.preventDefault();

    const user = state.user;
    const bookTitle = document.getElementById('student-book-title').value;
    const bookFinished = document.getElementById('student-book-finished').checked;

    let date, minutesRead;

    if (currentLogMode === 'timer') {
        if (!readingTimerFinished) {
            alert('Please end the timer before logging.');
            return;
        }
        date = getLocalDateString();
        minutesRead = Math.max(Math.round(readingTimerSeconds / 60), 1);
    } else {
        date = document.getElementById('student-reading-date').value;
        minutesRead = parseInt(document.getElementById('student-minutes-read').value);
    }

    // Create new reading log
    const newLog = {
        id: Date.now(),
        studentId: user.studentId,
        date: date,
        bookTitle: bookTitle,
        minutesRead: minutesRead,
        bookFinished: bookFinished,
        loggedBy: 'student'
    };

    state.readingLogs.push(newLog);

    // Add book to student's "My Books" if a book was selected from API
    if (state.selectedBook) {
        if (!state.studentBooks[user.studentId]) {
            state.studentBooks[user.studentId] = [];
        }

        // Check if book already exists in student's collection
        const existingBook = state.studentBooks[user.studentId].find(
            b => b.title === state.selectedBook.title
        );

        if (existingBook) {
            // Update existing book status if marked as finished
            if (bookFinished) {
                existingBook.status = 'Finished';
                existingBook.dateFinished = date;
            }
        } else {
            // Add new book with appropriate status
            const newBook = {
                id: Date.now() + Math.random(),
                title: state.selectedBook.title,
                author: state.selectedBook.author,
                cover: state.selectedBook.cover,
                status: bookFinished ? 'Finished' : 'Reading',
                dateFinished: bookFinished ? date : null,
                dateAdded: new Date().toISOString()
            };
            state.studentBooks[user.studentId].push(newBook);
        }

        // Remove from wishlist if it exists there
        if (state.studentWishlist[user.studentId]) {
            state.studentWishlist[user.studentId] = state.studentWishlist[user.studentId].filter(
                book => book.title !== state.selectedBook.title
            );
            localStorage.setItem('studentWishlist', JSON.stringify(state.studentWishlist));
        }
    }

    // Update student's total minutes
    const student = state.students.find(s => s.id === user.studentId);
    student.totalMinutesRead += minutesRead;

    // Save to localStorage
    localStorage.setItem('readingLogs', JSON.stringify(state.readingLogs));
    localStorage.setItem('students', JSON.stringify(state.students));
    localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));

    // Clear selected book
    state.selectedBook = null;

    // Check and award badges
    checkAndAwardBadges(user.studentId);

    closeStudentLogReadingModal();
    renderStudentReadingPage();

    // Show celebration
    showCelebration(minutesRead);
}

let studentBookSearchTimeout;
function handleStudentBookSearch(e) {
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('student-book-results');

    if (query.length < 2) {
        // Show suggestions if empty, otherwise clear
        if (query.length === 0) {
            showStudentBookSuggestions();
        } else {
            resultsDiv.innerHTML = '';
        }
        return;
    }
    
    clearTimeout(studentBookSearchTimeout);
    studentBookSearchTimeout = setTimeout(async () => {
        try {
            // Using Open Library API (free, no rate limits)
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                resultsDiv.innerHTML = data.docs.map((book, index) => {
                    const title = book.title || 'Unknown Title';
                    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
                    const coverId = book.cover_i;
                    const thumbnail = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

                    return `
                        <div class="book-result-item" data-book-index="${index}">
                            ${thumbnail ? `<img src="${thumbnail}" alt="${title}" class="book-thumbnail">` : '<div class="book-thumbnail-placeholder">📚</div>'}
                            <div class="book-info">
                                <strong>${title}</strong><br>
                                <small>by ${authors}</small>
                            </div>
                        </div>
                    `;
                }).join('');

                // Store books data temporarily for selection
                window.currentStudentBookSearchResults = data.docs;

                // Add click handlers
                document.querySelectorAll('#student-book-results .book-result-item').forEach((item, index) => {
                    item.addEventListener('click', () => {
                        const book = window.currentStudentBookSearchResults[index];
                        const title = book.title || 'Unknown Title';
                        const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
                        const coverId = book.cover_i;
                        const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

                        // Store selected book metadata
                        state.selectedBook = { title, author: authors, cover };
                        document.getElementById('student-book-title').value = title;
                        resultsDiv.innerHTML = '';
                    });
                });
            } else {
                resultsDiv.innerHTML = '<div class="book-result-item">No books found</div>';
            }
        } catch (error) {
            console.error('Error searching books:', error);
            resultsDiv.innerHTML = '<div class="book-result-item">Error searching books</div>';
        }
    }, 300);
}

// Show student's current books and wishlist on focus
function showStudentBookSuggestions() {
    const studentId = state.user.studentId;
    const resultsDiv = document.getElementById('student-book-results');

    // Get current reading books (not finished)
    const currentBooks = (state.studentBooks[studentId] || []).filter(book => book.status !== 'Finished');

    // Get wishlist books
    const wishlistBooks = state.studentWishlist[studentId] || [];

    if (currentBooks.length === 0 && wishlistBooks.length === 0) {
        resultsDiv.innerHTML = '<div class="book-suggestions-empty">Start typing to search for books...</div>';
        return;
    }

    let html = '';

    // Show currently reading books first
    if (currentBooks.length > 0) {
        html += '<div class="book-suggestions-section"><div class="suggestions-header">Currently Reading</div>';
        html += currentBooks.map(book => `
            <div class="book-suggestion-item" data-book-type="current" data-book-id="${book.id}">
                ${book.cover ? `<img src="${book.cover}" alt="${book.title}" class="suggestion-thumbnail">` : '<div class="suggestion-thumbnail-placeholder">📚</div>'}
                <div class="suggestion-info">
                    <strong>${book.title}</strong><br>
                    <small>by ${book.author}</small>
                </div>
            </div>
        `).join('');
        html += '</div>';
    }

    // Show wishlist books
    if (wishlistBooks.length > 0) {
        html += '<div class="book-suggestions-section"><div class="suggestions-header">From Your Wishlist</div>';
        html += wishlistBooks.map(book => `
            <div class="book-suggestion-item" data-book-type="wishlist" data-book-id="${book.id}">
                ${book.cover ? `<img src="${book.cover}" alt="${book.title}" class="suggestion-thumbnail">` : '<div class="suggestion-thumbnail-placeholder">📚</div>'}
                <div class="suggestion-info">
                    <strong>${book.title}</strong><br>
                    <small>by ${book.author}</small>
                </div>
            </div>
        `).join('');
        html += '</div>';
    }

    resultsDiv.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.book-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const bookType = item.getAttribute('data-book-type');
            const bookId = item.getAttribute('data-book-id');
            let book;

            if (bookType === 'current') {
                book = currentBooks.find(b => b.id == bookId);
            } else {
                book = wishlistBooks.find(b => b.id == bookId);
            }

            if (book) {
                state.selectedBook = {
                    title: book.title,
                    author: book.author,
                    cover: book.cover
                };
                document.getElementById('student-book-title').value = book.title;
                resultsDiv.innerHTML = '';
            }
        });
    });
}

// Navigation
function navigateToPage(pageName) {
    state.currentPage = pageName;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageEl = document.getElementById(`page-${pageName}`);
    if (pageEl) {
        pageEl.classList.add('active');
    }
    
    // Update breadcrumb
    updateBreadcrumb(pageName);
    
    // Update data if needed
    if (pageName === 'dashboard') {
        renderBooksFinishedChart();
        renderBadgesEarnedChart();
    } else if (pageName === 'reading') {
        populateMonthSelector();
        handleMonthChange();
    } else if (pageName === 'my-class') {
        renderStudentsTable();
    } else if (pageName === 'badges') {
        renderTeacherBadgesPage();
    }
}

function updateBreadcrumb(pageName) {
    const breadcrumbMap = {
        'dashboard': ['Reports'],
        'reading': ['Dashboard'],
        'my-class': ['My Students', 'My Class'],
        'groups': ['My Students', 'Groups'],
        'badges': ['Challenges', 'Badges'],
        'redeem': ['Challenges', 'Redeem']
    };
    
    const crumbs = breadcrumbMap[pageName] || [];
    const breadcrumbEl = document.getElementById('breadcrumb');
    
    breadcrumbEl.innerHTML = crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const separator = index > 0 ? '<span class="separator">/</span>' : '';
        const className = isLast ? 'active' : '';
        return `${separator}<span class="${className}">${crumb}</span>`;
    }).join('');
}

// Month Selector
function populateMonthSelector() {
    const selector = document.getElementById('month-selector');
    if (!selector) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // School year: August 2025 to May 2026, up to the current month
    const months = [];
    const startYear = 2025;
    const startMonth = 7; // August
    const endYear = 2026;
    const endMonth = 4; // May

    let y = startYear;
    let m = startMonth;
    while (y < endYear || (y === endYear && m <= endMonth)) {
        // Only include months up to the current month
        if (y < currentYear || (y === currentYear && m <= currentMonth)) {
            months.push({ year: y, month: m });
        }
        m++;
        if (m > 11) { m = 0; y++; }
    }

    selector.innerHTML = months.map(item => {
        const isCurrentMonth = item.year === currentYear && item.month === currentMonth;
        const label = `${monthNames[item.month]} ${item.year}`;
        return `<option value="${item.year}-${item.month}" ${isCurrentMonth ? 'selected' : ''}>${label}</option>`;
    }).join('');
}

function getSelectedMonth() {
    const selector = document.getElementById('month-selector');
    if (!selector || !selector.value) {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    }
    const [year, month] = selector.value.split('-').map(Number);
    return { year, month };
}

function handleMonthChange() {
    const selected = getSelectedMonth();
    renderLeaderboard(selected.year, selected.month);
    updateTeacherProgressBarForMonth(selected.year, selected.month);
}

function updateTeacherProgressBarForMonth(year, month) {
    const refDate = new Date(year, month, 15);
    const allLogs = state.readingLogs;
    const classMinutes = calculateMinutesForPeriod(allLogs, 'month', refDate);
    const goal = getMonthlyGoal();
    updateProgressBar(classMinutes, goal, 'teacher-vehicle-marker', 'teacher-progress-text');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const titleEl = document.getElementById('progress-bar-title');
    if (titleEl) {
        titleEl.textContent = `Class Reading - ${monthNames[month]} ${year}`;
    }
}

// Leaderboard
function renderLeaderboard(year, month) {
    const listEl = document.getElementById('leaderboard-list');

    // If no year/month provided, use current month
    if (year === undefined || month === undefined) {
        const selected = getSelectedMonth();
        year = selected.year;
        month = selected.month;
    }

    const refDate = new Date(year, month, 15);

    // Calculate minutes per student for the selected month
    const studentMinutes = state.students.map(student => {
        const studentLogs = state.readingLogs.filter(log => log.studentId === student.id);
        const minutes = calculateMinutesForPeriod(studentLogs, 'month', refDate);
        return { ...student, monthMinutes: minutes };
    });

    const sortedStudents = studentMinutes.sort((a, b) => b.monthMinutes - a.monthMinutes);

    const getMedal = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return '⚪';
    };

    listEl.innerHTML = sortedStudents.map((student, index) => `
        <div class="leaderboard-item">
            <span class="medal">${getMedal(index)}</span>
            <span class="rank">#${index + 1}</span>
            <span class="student-name">${student.name}</span>
            <span class="minutes">${student.monthMinutes} minutes</span>
        </div>
    `).join('');
}

// Students Table
function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = state.students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.lexileScore}</td>
            <td>
                <button class="edit-btn" onclick="openEditStudentModal(${student.id})">✏️</button>
            </td>
        </tr>
    `).join('');
}

// Students Checkbox List for Log Reading
function renderStudentsCheckboxList() {
    const listEl = document.getElementById('students-checkbox-list');
    listEl.innerHTML = state.students.map(student => `
        <label>
            <input type="checkbox" name="student" value="${student.id}" checked>
            ${student.name}
        </label>
    `).join('');
}

// Log Reading Modal
function openLogReadingModal() {
    document.getElementById('log-reading-modal').classList.remove('hidden');
    document.getElementById('date-read').value = getLocalDateString();
    updateFreeReadingFields();
}

function closeLogReadingModal() {
    document.getElementById('log-reading-modal').classList.add('hidden');
    document.getElementById('log-reading-form').reset();
    renderStudentsCheckboxList(); // Reset checkboxes
}

function updateFreeReadingFields() {
    const isFreeReading = document.querySelector('input[name="freeReading"]:checked').value === 'yes';
    const bookTitleGroup = document.getElementById('book-title-group');
    const bookFinishedGroup = document.getElementById('book-finished-group');
    const bookTitleInput = document.getElementById('book-title');
    
    if (isFreeReading) {
        bookTitleGroup.style.display = 'none';
        bookFinishedGroup.style.display = 'none';
        bookTitleInput.removeAttribute('required');
    } else {
        bookTitleGroup.style.display = 'block';
        bookFinishedGroup.style.display = 'block';
        bookTitleInput.setAttribute('required', 'required');
    }
}

function handleSelectAllStudents(e) {
    const checkboxes = document.querySelectorAll('#students-checkbox-list input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
}

function handleLogReadingSubmit(e) {
    e.preventDefault();
    
    const selectedStudentIds = Array.from(
        document.querySelectorAll('#students-checkbox-list input:checked')
    ).map(cb => parseInt(cb.value));
    
    if (selectedStudentIds.length === 0) {
        alert('Please select at least one student');
        return;
    }
    
    const minutes = parseInt(document.getElementById('minutes').value);
    const isFreeReading = document.querySelector('input[name="freeReading"]:checked').value === 'yes';
    const bookTitle = isFreeReading ? 'Free Reading' : document.getElementById('book-title').value;
    const bookFinished = isFreeReading ? null : document.querySelector('input[name="bookFinished"]:checked').value === 'yes';
    const dateRead = document.getElementById('date-read').value;
    
    if (!isFreeReading && !bookTitle) {
        alert('Please enter a book title');
        return;
    }
    
    // Create individual reading logs for each student
    selectedStudentIds.forEach(studentId => {
        const log = {
            id: Date.now() + studentId, // Unique ID for each log
            studentId: studentId,
            date: dateRead,
            bookTitle: bookTitle,
            minutesRead: minutes,
            bookFinished: bookFinished,
            isFreeReading: isFreeReading,
            loggedBy: 'teacher'
        };
        state.readingLogs.push(log);

        // Add book to student's "My Books" if it's a recognized book (not free reading)
        if (!isFreeReading && state.selectedBook) {
            if (!state.studentBooks[studentId]) {
                state.studentBooks[studentId] = [];
            }

            // Check if book already exists in student's collection
            const existingBook = state.studentBooks[studentId].find(
                b => b.title === state.selectedBook.title
            );

            if (existingBook) {
                // Update existing book status if marked as finished
                if (bookFinished) {
                    existingBook.status = 'Finished';
                    existingBook.dateFinished = dateRead;
                }
            } else {
                // Add new book with appropriate status
                const newBook = {
                    id: Date.now() + Math.random(),
                    title: state.selectedBook.title,
                    author: state.selectedBook.author,
                    cover: state.selectedBook.cover,
                    status: bookFinished ? 'Finished' : 'Reading',
                    dateFinished: bookFinished ? dateRead : null,
                    dateAdded: new Date().toISOString()
                };
                state.studentBooks[studentId].push(newBook);
            }

            // Remove from wishlist if it exists there
            if (state.studentWishlist[studentId]) {
                state.studentWishlist[studentId] = state.studentWishlist[studentId].filter(
                    book => book.title !== state.selectedBook.title
                );
            }
        }
    });

    localStorage.setItem('readingLogs', JSON.stringify(state.readingLogs));
    localStorage.setItem('studentWishlist', JSON.stringify(state.studentWishlist));
    localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));

    // Update student minutes
    state.students = state.students.map(student => {
        if (selectedStudentIds.includes(student.id)) {
            return { ...student, totalMinutesRead: student.totalMinutesRead + minutes };
        }
        return student;
    });
    localStorage.setItem('students', JSON.stringify(state.students));

    // Clear selected book
    state.selectedBook = null;

    // Check and award badges for all students who read
    selectedStudentIds.forEach(studentId => {
        checkAndAwardBadges(studentId);
    });

    // Update UI
    handleMonthChange();
    renderBooksFinishedChart();
    renderBadgesEarnedChart();
    closeLogReadingModal();
}

// Book Search with Google Books API
let searchTimeout;
function handleBookSearch(e) {
    const query = e.target.value;
    const resultsEl = document.getElementById('book-search-results');
    
    clearTimeout(searchTimeout);
    
    if (!query.trim()) {
        resultsEl.classList.add('hidden');
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            // Using Open Library API (free, no rate limits)
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
            );
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                resultsEl.innerHTML = data.docs.map((book, index) => {
                    const title = book.title || 'Unknown Title';
                    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
                    const coverId = book.cover_i;
                    const thumbnail = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

                    return `
                        <div class="book-result-item" data-book-index="${index}">
                            ${thumbnail ? `<img src="${thumbnail}" alt="${title}" class="book-thumbnail">` : '<div class="book-thumbnail-placeholder">📚</div>'}
                            <div class="book-info">
                                <strong>${title}</strong><br>
                                <small>by ${authors}</small>
                            </div>
                        </div>
                    `;
                }).join('');

                // Store books data temporarily for selection
                window.currentBookSearchResults = data.docs;

                // Add click handlers
                document.querySelectorAll('.book-result-item').forEach((item, index) => {
                    item.addEventListener('click', () => {
                        const book = window.currentBookSearchResults[index];
                        selectBook(book);
                    });
                });

                resultsEl.classList.remove('hidden');
            } else {
                resultsEl.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error searching books:', error);
            resultsEl.classList.add('hidden');
        }
    }, 500);
}

function selectBook(book) {
    const title = book.title || 'Unknown Title';
    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
    const coverId = book.cover_i;
    const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

    // Store selected book metadata in state
    state.selectedBook = {
        title: title,
        author: authors,
        cover: cover
    };

    // Update the input field
    document.getElementById('book-title').value = title;
    document.getElementById('book-search-results').classList.add('hidden');
}

// Edit Student Modal
function openEditStudentModal(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    
    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-email').value = student.email;
    document.getElementById('edit-lexile').value = student.lexileScore;
    
    document.getElementById('edit-student-modal').classList.remove('hidden');
}

function closeEditStudentModal() {
    document.getElementById('edit-student-modal').classList.add('hidden');
    document.getElementById('edit-student-form').reset();
}

function handleEditStudentSubmit(e) {
    e.preventDefault();
    
    const studentId = parseInt(document.getElementById('edit-student-id').value);
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const lexileScore = document.getElementById('edit-lexile').value;
    
    state.students = state.students.map(student => {
        if (student.id === studentId) {
            return { ...student, name, email, lexileScore };
        }
        return student;
    });
    
    localStorage.setItem('students', JSON.stringify(state.students));
    renderStudentsTable();
    renderLeaderboard();
    closeEditStudentModal();
}

// Books Page Functions - Part 1: Main Render and My Books
function renderBooksPage() {
    const studentId = state.user.studentId;
    renderMyBooks(studentId);
    renderWishlist(studentId);
    renderReadingHistory(studentId);
}

function renderMyBooks(studentId) {
    const booksGrid = document.getElementById('my-books-grid');
    const books = state.studentBooks[studentId] || [];
    const currentBooks = books.filter(book => book.status !== 'Finished');

    if (currentBooks.length === 0) {
        booksGrid.innerHTML = '<p class="no-books-message">No books yet. Start reading to add books here!</p>';
        return;
    }

    booksGrid.innerHTML = currentBooks.map(book => `
        <div class="book-card">
            <div class="book-cover">
                ${book.cover ? `<img src="${book.cover}" alt="${book.title}">` : '<div class="book-cover-placeholder">📚</div>'}
            </div>
            <div class="book-details">
                <h4 class="book-title">${book.title}</h4>
                <p class="book-author">${book.author}</p>
                <div class="book-status-section">
                    <label>Status:</label>
                    <select class="book-status-dropdown" data-book-id="${book.id}" onchange="updateBookStatus(${studentId}, '${book.id}', this.value)">
                        <option value="Reading" ${book.status === 'Reading' ? 'selected' : ''}>Reading</option>
                        <option value="Paused" ${book.status === 'Paused' ? 'selected' : ''}>Paused</option>
                        <option value="Stopped" ${book.status === 'Stopped' ? 'selected' : ''}>Stopped</option>
                        <option value="Finished" ${book.status === 'Finished' ? 'selected' : ''}>Finished</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

// Books Page Functions - Part 2: Wishlist and Reading History
function renderWishlist(studentId) {
    const wishlistGrid = document.getElementById('wishlist-grid');
    const wishlist = state.studentWishlist[studentId] || [];

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = '<p class="no-books-message">No books in your wishlist yet. Search and add books above!</p>';
        return;
    }

    wishlistGrid.innerHTML = wishlist.map(book => `
        <div class="book-card">
            <div class="book-cover">
                ${book.cover ? `<img src="${book.cover}" alt="${book.title}">` : '<div class="book-cover-placeholder">📚</div>'}
            </div>
            <div class="book-details">
                <h4 class="book-title">${book.title}</h4>
                <p class="book-author">${book.author}</p>
                <button class="remove-wishlist-btn" onclick="removeFromWishlist(${studentId}, '${book.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function renderReadingHistory(studentId) {
    const historyGrid = document.getElementById('reading-history-grid');
    const books = state.studentBooks[studentId] || [];
    const finishedBooks = books.filter(book => book.status === 'Finished');

    if (finishedBooks.length === 0) {
        historyGrid.innerHTML = '<p class="no-books-message">No finished books yet. Keep reading!</p>';
        return;
    }

    historyGrid.innerHTML = finishedBooks.map(book => {
        let dateFinishedDisplay = '';
        if (book.dateFinished) {
            const [year, month, day] = book.dateFinished.split('-');
            dateFinishedDisplay = `${month}/${day}/${year}`;
        }
        const rating = book.rating || 0;
        return `
        <div class="book-card">
            <div class="book-cover">
                ${book.cover ? `<img src="${book.cover}" alt="${book.title}">` : '<div class="book-cover-placeholder">📚</div>'}
            </div>
            <div class="book-details">
                <h4 class="book-title">${book.title}</h4>
                <p class="book-author">${book.author}</p>
                ${dateFinishedDisplay ? `<p class="book-date-finished">Date Finished: ${dateFinishedDisplay}</p>` : ''}
                <div class="book-status-badge finished">✓ Finished</div>
                <div class="star-rating" data-book-id="${book.id}" data-student-id="${studentId}">
                    ${renderStars(rating, book.id, studentId)}
                </div>
            </div>
        </div>
    `}).join('');
}

function renderStars(rating, bookId, studentId) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const fullStar = rating >= i;
        const halfStar = !fullStar && rating >= i - 0.5;
        const starClass = fullStar ? 'star full' : (halfStar ? 'star half' : 'star empty');
        stars += `<span class="${starClass}" data-value="${i}" data-book-id="${bookId}" data-student-id="${studentId}" onclick="handleStarClick(event, ${bookId}, ${studentId}, ${i})">★</span>`;
    }
    const ratingText = rating > 0 ? `<span class="rating-text">${rating}/5</span>` : '<span class="rating-text rating-prompt">Rate this book</span>';
    return stars + ratingText;
}

// Track last clicked star for toggle behavior
let lastClickedStar = null;

function handleStarClick(event, bookId, studentId, starValue) {
    if (!state.studentBooks[studentId]) return;
    
    const book = state.studentBooks[studentId].find(b => b.id == bookId);
    const currentRating = book?.rating || 0;
    
    let rating;
    
    // Check if clicking the same star that was just clicked
    const isSameStar = lastClickedStar === `${bookId}-${starValue}`;
    
    if (isSameStar) {
        // Same star clicked again: toggle to half star or reduce by 0.5
        if (currentRating === starValue) {
            rating = starValue - 0.5;
        } else if (currentRating === starValue - 0.5) {
            rating = starValue - 1;
        } else {
            rating = starValue - 0.5;
        }
    } else {
        // Different star clicked: set to full star
        rating = starValue;
    }
    
    lastClickedStar = `${bookId}-${starValue}`;
    
    updateBookRating(studentId, bookId, rating);
}

function updateBookRating(studentId, bookId, rating) {
    if (!state.studentBooks[studentId]) return;

    state.studentBooks[studentId] = state.studentBooks[studentId].map(book => {
        if (book.id == bookId) {
            return { ...book, rating: rating };
        }
        return book;
    });

    localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));
    renderReadingHistory(studentId);
}

// Books Page Functions - Part 3: Update Book Status
function updateBookStatus(studentId, bookId, newStatus) {
    if (!state.studentBooks[studentId]) return;

    state.studentBooks[studentId] = state.studentBooks[studentId].map(book => {
        if (book.id == bookId) {
            const updated = { ...book, status: newStatus };
            if (newStatus === 'Finished') {
                updated.dateFinished = getLocalDateString();
            }
            return updated;
        }
        return book;
    });

    localStorage.setItem('studentBooks', JSON.stringify(state.studentBooks));
    renderBooksPage();
}

// Books Page Functions - Part 4: Wishlist Search and Management
let wishlistSearchTimeout;
function handleWishlistSearch(e) {
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('wishlist-search-results');

    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    clearTimeout(wishlistSearchTimeout);
    wishlistSearchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();

            if (data.docs && data.docs.length > 0) {
                resultsDiv.innerHTML = data.docs.map((book, index) => {
                    const title = book.title || 'Unknown Title';
                    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
                    const coverId = book.cover_i;
                    const thumbnail = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-S.jpg` : '';

                    return `
                        <div class="wishlist-result-item" data-book-index="${index}">
                            ${thumbnail ? `<img src="${thumbnail}" alt="${title}" class="result-thumbnail">` : '<div class="result-thumbnail-placeholder">📚</div>'}
                            <div class="result-info">
                                <strong>${title}</strong><br>
                                <small>by ${authors}</small>
                            </div>
                            <button class="add-wishlist-btn" onclick="addToWishlist(${index})">Add</button>
                        </div>
                    `;
                }).join('');

                window.currentWishlistSearchResults = data.docs;
            } else {
                resultsDiv.innerHTML = '<div class="no-results">No books found</div>';
            }
        } catch (error) {
            console.error('Error searching books:', error);
            resultsDiv.innerHTML = '<div class="no-results">Error searching books</div>';
        }
    }, 300);
}

function addToWishlist(bookIndex) {
    const book = window.currentWishlistSearchResults[bookIndex];
    const studentId = state.user.studentId;
    const title = book.title || 'Unknown Title';
    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
    const coverId = book.cover_i;
    const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

    if (!state.studentWishlist[studentId]) {
        state.studentWishlist[studentId] = [];
    }

    const exists = state.studentWishlist[studentId].find(b => b.title === title);
    if (exists) {
        alert('This book is already in your wishlist!');
        return;
    }

    const newBook = {
        id: Date.now() + Math.random(),
        title: title,
        author: authors,
        cover: cover,
        dateAdded: new Date().toISOString()
    };

    state.studentWishlist[studentId].push(newBook);
    localStorage.setItem('studentWishlist', JSON.stringify(state.studentWishlist));

    document.getElementById('wishlist-search-input').value = '';
    document.getElementById('wishlist-search-results').innerHTML = '';
    renderWishlist(studentId);
}

function removeFromWishlist(studentId, bookId) {
    if (!state.studentWishlist[studentId]) return;

    state.studentWishlist[studentId] = state.studentWishlist[studentId].filter(
        book => book.id != bookId
    );

    localStorage.setItem('studentWishlist', JSON.stringify(state.studentWishlist));
    renderWishlist(studentId);
}

// Badges & Challenges Functions - Part 1: Challenge Creation
function openCreateChallengeModal() {
    document.getElementById('create-challenge-modal').classList.remove('hidden');
    // Default to BSG
    document.querySelector('input[name="challenge-org"][value="bsg"]').checked = true;
    applyOrgMode('bsg', 'tiers-container', 'add-tier-btn', addTierRow);
}

function applyOrgMode(mode, containerId, addBtnId, addFn) {
    const container = document.getElementById(containerId);
    const addBtn = document.getElementById(addBtnId);
    container.innerHTML = '';
    if (mode === 'bsg') {
        addFn('Bronze', '', '');
        addFn('Silver', '', '');
        addFn('Gold', '', '');
        addBtn.classList.add('hidden');
    } else {
        addFn('', '', '');
        addBtn.classList.add('hidden');
    }
    // Lock tier name inputs for BSG mode, unlock for one-and-done
    container.querySelectorAll('.tier-name-input').forEach(input => {
        input.readOnly = (mode === 'bsg');
    });
    // Hide remove buttons when tiers are fixed
    container.querySelectorAll('.remove-tier-btn').forEach(btn => {
        btn.classList.toggle('hidden', true);
    });
}

function closeCreateChallengeModal() {
    document.getElementById('create-challenge-modal').classList.add('hidden');
    document.getElementById('create-challenge-form').reset();
    document.getElementById('thumbnail-preview').classList.add('hidden');
    document.getElementById('goal-unit').textContent = '';
    document.getElementById('tiers-container').innerHTML = '';
}

function getGoalPlaceholder() {
    const type = document.getElementById('challenge-type').value;
    if (type === 'minutes') return 'Minutes';
    if (type === 'books') return 'Books';
    if (type === 'streak') return 'Days';
    return 'Goal';
}

function handleChallengeTypeChange(e) {
    const type = e.target.value;
    const goalUnit = document.getElementById('goal-unit');

    if (type === 'minutes') {
        goalUnit.textContent = 'Set tier goals in total minutes to read';
    } else if (type === 'books') {
        goalUnit.textContent = 'Set tier goals in total books to finish';
    } else if (type === 'streak') {
        goalUnit.textContent = 'Set tier goals in consecutive days';
    } else {
        goalUnit.textContent = '';
    }

    // Update placeholder on all existing tier goal inputs
    const placeholder = getGoalPlaceholder();
    document.querySelectorAll('#tiers-container .tier-goal-input').forEach(input => {
        input.placeholder = placeholder;
    });
}

function addTierRow(name, goal, points, existingIcon) {
    const container = document.getElementById('tiers-container');
    const placeholder = getGoalPlaceholder();
    const row = document.createElement('div');
    row.className = 'tier-row';
    row.innerHTML = `
        <div class="tier-row-fields">
            <input type="text" class="tier-name-input" placeholder="Tier name (e.g., Bronze)" value="${name || ''}" required>
            <input type="number" class="tier-goal-input" placeholder="${placeholder}" min="1" value="${goal || ''}" required>
            <input type="number" class="tier-points-input" placeholder="Points" min="1" value="${points || ''}" required>
            <button type="button" class="remove-tier-btn" onclick="removeTierRow(this)">&times;</button>
        </div>
        <div class="tier-icon-row">
            <label class="tier-icon-label">Badge Image *</label>
            <input type="file" class="tier-icon-input" accept=".jpg,.jpeg,.png">
            ${existingIcon ? `<img src="${existingIcon}" class="tier-icon-preview" alt="Badge preview">` : ''}
        </div>
    `;
    if (existingIcon) {
        row.dataset.existingIcon = existingIcon;
    }
    container.appendChild(row);
}

function removeTierRow(btn) {
    const container = document.getElementById('tiers-container');
    if (container.querySelectorAll('.tier-row').length > 1) {
        btn.closest('.tier-row').remove();
    } else {
        alert('At least one tier is required.');
    }
}

function handleThumbnailPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('thumbnail-preview-img').src = event.target.result;
            document.getElementById('thumbnail-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function handleCreateChallengeSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('challenge-name').value;
    const description = document.getElementById('challenge-description').value.trim();
    const thumbnailFile = document.getElementById('challenge-thumbnail').files[0];
    const type = document.getElementById('challenge-type').value;
    const startDate = document.getElementById('challenge-start-date').value;
    const endDate = document.getElementById('challenge-end-date').value;

    if (startDate > endDate) {
        alert('End date must be on or after start date.');
        return;
    }

    // Collect tiers
    const tierRows = document.querySelectorAll('#tiers-container .tier-row');
    const tiers = [];
    let valid = true;
    const tierIconFiles = [];

    tierRows.forEach(row => {
        const tierName = row.querySelector('.tier-name-input').value.trim();
        const tierGoal = parseInt(row.querySelector('.tier-goal-input').value);
        const tierPoints = parseInt(row.querySelector('.tier-points-input').value);
        const tierIconFile = row.querySelector('.tier-icon-input').files[0];
        if (!tierName || isNaN(tierGoal) || isNaN(tierPoints) || tierGoal < 1 || tierPoints < 1) {
            valid = false;
        }
        if (!tierIconFile) {
            valid = false;
        }
        tiers.push({ name: tierName, goal: tierGoal, points: tierPoints });
        tierIconFiles.push(tierIconFile);
    });

    if (!valid || tiers.length === 0) {
        alert('Please fill in all tier fields and badge images.');
        return;
    }

    // Sort tiers by goal ascending (keep icon files in sync)
    const indexed = tiers.map((t, i) => ({ ...t, _file: tierIconFiles[i], _i: i }));
    indexed.sort((a, b) => a.goal - b.goal);

    // Read all files: thumbnail + tier icons
    const filePromises = [readFileAsDataURL(thumbnailFile)];
    indexed.forEach(t => filePromises.push(readFileAsDataURL(t._file)));

    Promise.all(filePromises).then(results => {
        const thumbnailData = results[0];
        const sortedTiers = indexed.map((t, i) => ({
            name: t.name,
            goal: t.goal,
            points: t.points,
            icon: results[i + 1]
        }));

        const challenge = {
            id: Date.now(),
            name: name,
            description: description || '',
            thumbnail: thumbnailData,
            type: type,
            tiers: sortedTiers,
            startDate: startDate,
            endDate: endDate,
            createdBy: state.user.username,
            createdAt: new Date().toISOString()
        };

        state.challenges.push(challenge);
        localStorage.setItem('challenges', JSON.stringify(state.challenges));

        closeCreateChallengeModal();
        renderTeacherBadgesPage();
    });
}

// Badges & Challenges Functions - Part 2: Teacher Badges Page
function renderTeacherBadgesPage() {
    const listEl = document.getElementById('teacher-challenges-list');

    if (state.challenges.length === 0) {
        listEl.innerHTML = '<p class="no-challenges-message">No challenges created yet. Click "Create Challenge" to get started!</p>';
        return;
    }

    listEl.innerHTML = state.challenges.map(challenge => {
        const typeLabel = challenge.type === 'minutes' ? 'minutes' : (challenge.type === 'books' ? 'books' : 'day streak');
        const tiers = challenge.tiers || [];
        const tiersHTML = tiers.map(tier =>
            `<span class="tier-tag">${tier.name}: ${tier.goal} ${typeLabel} (${tier.points} pts)</span>`
        ).join('');

        return `
            <div class="teacher-challenge-card">
                <img src="${challenge.thumbnail}" alt="${challenge.name}" class="challenge-icon-small">
                <div class="challenge-details">
                    <h3>${challenge.name}</h3>
                    ${challenge.description ? `<p class="challenge-description">${challenge.description}</p>` : ''}
                    <p>${formatDateRange(challenge.startDate, challenge.endDate)}</p>
                    <div class="challenge-tiers">${tiersHTML}</div>
                </div>
                <div class="challenge-actions">
                    <button class="edit-challenge-btn" onclick="openEditChallengeModal(${challenge.id})">✏️</button>
                    <button class="delete-challenge-btn" onclick="deleteChallenge(${challenge.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteChallenge(challengeId) {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    state.challenges = state.challenges.filter(c => c.id !== challengeId);
    localStorage.setItem('challenges', JSON.stringify(state.challenges));
    renderTeacherBadgesPage();
}

function openEditChallengeModal(challengeId) {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    document.getElementById('edit-challenge-id').value = challenge.id;
    document.getElementById('edit-challenge-name').value = challenge.name;
    document.getElementById('edit-challenge-description').value = challenge.description || '';
    document.getElementById('edit-challenge-type').value = challenge.type;
    document.getElementById('edit-challenge-start-date').value = challenge.startDate;
    document.getElementById('edit-challenge-end-date').value = challenge.endDate;

    // Show current thumbnail
    document.getElementById('edit-thumbnail-preview-img').src = challenge.thumbnail;
    document.getElementById('edit-thumbnail-preview').classList.remove('hidden');

    // Update goal unit hint
    const goalUnit = document.getElementById('edit-goal-unit');
    if (challenge.type === 'minutes') goalUnit.textContent = 'Set tier goals in total minutes to read';
    else if (challenge.type === 'books') goalUnit.textContent = 'Set tier goals in total books to finish';
    else if (challenge.type === 'streak') goalUnit.textContent = 'Set tier goals in consecutive days';

    // Detect org mode from existing tiers
    const tiers = challenge.tiers || [];
    const tierNames = tiers.map(t => t.name);
    const isBSG = tiers.length === 3 &&
        tierNames.includes('Bronze') && tierNames.includes('Silver') && tierNames.includes('Gold');

    const orgMode = isBSG ? 'bsg' : 'one';
    document.querySelector(`input[name="edit-challenge-org"][value="${orgMode}"]`).checked = true;

    // Populate tiers
    const container = document.getElementById('edit-tiers-container');
    container.innerHTML = '';
    tiers.forEach(tier => {
        addEditTierRow(tier.name, tier.goal, tier.points, tier.icon);
    });

    // Apply org mode restrictions
    const addBtn = document.getElementById('edit-add-tier-btn');
    addBtn.classList.add('hidden');
    container.querySelectorAll('.tier-name-input').forEach(input => {
        input.readOnly = isBSG;
    });
    container.querySelectorAll('.remove-tier-btn').forEach(btn => {
        btn.classList.add('hidden');
    });

    document.getElementById('edit-challenge-modal').classList.remove('hidden');
}

function closeEditChallengeModal() {
    document.getElementById('edit-challenge-modal').classList.add('hidden');
    document.getElementById('edit-challenge-form').reset();
    document.getElementById('edit-thumbnail-preview').classList.add('hidden');
    document.getElementById('edit-goal-unit').textContent = '';
    document.getElementById('edit-tiers-container').innerHTML = '';
}

function addEditTierRow(name, goal, points, existingIcon) {
    const container = document.getElementById('edit-tiers-container');
    const type = document.getElementById('edit-challenge-type').value;
    let placeholder = 'Goal';
    if (type === 'minutes') placeholder = 'Minutes';
    else if (type === 'books') placeholder = 'Books';
    else if (type === 'streak') placeholder = 'Days';

    const row = document.createElement('div');
    row.className = 'tier-row';
    row.innerHTML = `
        <div class="tier-row-fields">
            <input type="text" class="tier-name-input" placeholder="Tier name (e.g., Bronze)" value="${name || ''}" required>
            <input type="number" class="tier-goal-input" placeholder="${placeholder}" min="1" value="${goal || ''}" required>
            <input type="number" class="tier-points-input" placeholder="Points" min="1" value="${points || ''}" required>
            <button type="button" class="remove-tier-btn" onclick="removeEditTierRow(this)">&times;</button>
        </div>
        <div class="tier-icon-row">
            <label class="tier-icon-label">${existingIcon ? 'Badge Image (leave empty to keep current)' : 'Badge Image *'}</label>
            <input type="file" class="tier-icon-input" accept=".jpg,.jpeg,.png">
            ${existingIcon ? `<img src="${existingIcon}" class="tier-icon-preview" alt="Badge preview">` : ''}
        </div>
    `;
    if (existingIcon) {
        row.dataset.existingIcon = existingIcon;
    }
    container.appendChild(row);
}

function removeEditTierRow(btn) {
    const container = document.getElementById('edit-tiers-container');
    if (container.querySelectorAll('.tier-row').length > 1) {
        btn.closest('.tier-row').remove();
    } else {
        alert('At least one tier is required.');
    }
}

function handleEditChallengeSubmit(e) {
    e.preventDefault();

    const challengeId = parseInt(document.getElementById('edit-challenge-id').value);
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const name = document.getElementById('edit-challenge-name').value;
    const description = document.getElementById('edit-challenge-description').value.trim();
    const thumbnailFile = document.getElementById('edit-challenge-thumbnail').files[0];
    const type = document.getElementById('edit-challenge-type').value;
    const startDate = document.getElementById('edit-challenge-start-date').value;
    const endDate = document.getElementById('edit-challenge-end-date').value;

    if (startDate > endDate) {
        alert('End date must be on or after start date.');
        return;
    }

    // Collect tiers
    const tierRows = document.querySelectorAll('#edit-tiers-container .tier-row');
    const tiers = [];
    let valid = true;
    const tierIconFiles = [];
    const existingIcons = [];

    tierRows.forEach(row => {
        const tierName = row.querySelector('.tier-name-input').value.trim();
        const tierGoal = parseInt(row.querySelector('.tier-goal-input').value);
        const tierPoints = parseInt(row.querySelector('.tier-points-input').value);
        const tierIconFile = row.querySelector('.tier-icon-input').files[0];
        const existingIcon = row.dataset.existingIcon || null;

        if (!tierName || isNaN(tierGoal) || isNaN(tierPoints) || tierGoal < 1 || tierPoints < 1) {
            valid = false;
        }
        if (!tierIconFile && !existingIcon) {
            valid = false;
        }
        tiers.push({ name: tierName, goal: tierGoal, points: tierPoints });
        tierIconFiles.push(tierIconFile);
        existingIcons.push(existingIcon);
    });

    if (!valid || tiers.length === 0) {
        alert('Please fill in all tier fields and badge images.');
        return;
    }

    // Sort tiers by goal (keep files/existing icons in sync)
    const indexed = tiers.map((t, i) => ({ ...t, _file: tierIconFiles[i], _existing: existingIcons[i], _i: i }));
    indexed.sort((a, b) => a.goal - b.goal);

    // Read new files where needed
    const filePromises = [];

    // Thumbnail
    if (thumbnailFile) {
        filePromises.push(readFileAsDataURL(thumbnailFile));
    } else {
        filePromises.push(Promise.resolve(challenge.thumbnail));
    }

    // Tier icons
    indexed.forEach(t => {
        if (t._file) {
            filePromises.push(readFileAsDataURL(t._file));
        } else {
            filePromises.push(Promise.resolve(t._existing));
        }
    });

    Promise.all(filePromises).then(results => {
        challenge.name = name;
        challenge.description = description || '';
        challenge.thumbnail = results[0];
        challenge.type = type;
        challenge.tiers = indexed.map((t, i) => ({
            name: t.name,
            goal: t.goal,
            points: t.points,
            icon: results[i + 1]
        }));
        challenge.startDate = startDate;
        challenge.endDate = endDate;

        localStorage.setItem('challenges', JSON.stringify(state.challenges));

        // Recalculate points for students who already completed tiers in this challenge
        Object.keys(state.studentPoints).forEach(studentId => {
            const data = state.studentPoints[studentId];
            if (!data) return;
            let recalculated = false;
            data.completed.forEach(entry => {
                if (entry.challengeId === challengeId) {
                    const updatedTier = challenge.tiers[entry.tierIndex];
                    if (updatedTier && entry.points !== updatedTier.points) {
                        entry.points = updatedTier.points;
                        entry.tierName = updatedTier.name;
                        recalculated = true;
                    }
                }
            });
            if (recalculated) {
                data.total = data.completed.reduce((sum, c) => sum + c.points, 0);
            }
        });
        localStorage.setItem('studentPoints', JSON.stringify(state.studentPoints));

        closeEditChallengeModal();
        renderTeacherBadgesPage();
    });
}

// Badges & Challenges Functions - Part 3: Progress Calculation
function getChallengeProgress(studentId, challenge) {
    // Helper function to parse date string as local date
    function parseLocalDate(date) {
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = date.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(date);
    }

    const startDate = parseLocalDate(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = parseLocalDate(challenge.endDate);
    endDate.setHours(23, 59, 59, 999);

    const logsInRange = state.readingLogs.filter(log => {
        if (log.studentId !== studentId) return false;
        const logDate = parseLocalDate(log.date);
        return logDate >= startDate && logDate <= endDate;
    });

    if (challenge.type === 'minutes') {
        return logsInRange.reduce((total, log) => total + log.minutesRead, 0);
    } else if (challenge.type === 'books') {
        const booksInRange = (state.studentBooks[studentId] || []).filter(book => {
            if (book.status !== 'Finished' || !book.dateFinished) return false;
            const bookDate = parseLocalDate(book.dateFinished);
            return bookDate >= startDate && bookDate <= endDate;
        });
        return booksInRange.length;
    } else if (challenge.type === 'streak') {
        if (logsInRange.length === 0) return 0;

        const uniqueDates = [...new Set(logsInRange.map(log => {
            const d = parseLocalDate(log.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))].sort();

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1]);
            const currDate = new Date(uniqueDates[i]);
            const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    return 0;
}

function checkAndAwardBadges(studentId) {
    if (!state.studentPoints[studentId]) {
        state.studentPoints[studentId] = { total: 0, completed: [] };
    }

    let pointsChanged = false;
    let badgesChanged = false;

    state.challenges.forEach(challenge => {
        const progress = getChallengeProgress(studentId, challenge);
        const tiers = challenge.tiers || [];

        tiers.forEach((tier, tierIndex) => {
            if (progress >= tier.goal) {
                // Check if this tier is already completed
                const alreadyCompleted = state.studentPoints[studentId].completed.find(
                    c => c.challengeId === challenge.id && c.tierIndex === tierIndex
                );

                if (!alreadyCompleted) {
                    state.studentPoints[studentId].completed.push({
                        challengeId: challenge.id,
                        tierIndex: tierIndex,
                        tierName: tier.name,
                        points: tier.points,
                        dateEarned: new Date().toISOString()
                    });
                    pointsChanged = true;
                } else if (alreadyCompleted.points !== tier.points || alreadyCompleted.tierName !== tier.name) {
                    // Sync points/name if teacher updated the challenge
                    alreadyCompleted.points = tier.points;
                    alreadyCompleted.tierName = tier.name;
                    pointsChanged = true;
                }

                // Award badge for each completed tier
                if (!state.earnedBadges[studentId]) {
                    state.earnedBadges[studentId] = [];
                }
                const alreadyEarned = state.earnedBadges[studentId].find(
                    b => b.challengeId === challenge.id && (b.tierIndex || 0) === tierIndex
                );
                if (!alreadyEarned) {
                    const badgeName = challenge.tiers.length === 1
                        ? challenge.name
                        : `${challenge.name} - ${tier.name}`;
                    const badge = {
                        id: Date.now() + Math.random(),
                        challengeId: challenge.id,
                        tierIndex: tierIndex,
                        badgeName: badgeName,
                        badgeIcon: tier.icon,
                        startDate: challenge.startDate,
                        endDate: challenge.endDate,
                        dateEarned: new Date().toISOString()
                    };
                    state.earnedBadges[studentId].push(badge);
                    badgesChanged = true;
                }
            }
        });
    });

    // Save changes to localStorage once at the end
    if (badgesChanged) {
        localStorage.setItem('earnedBadges', JSON.stringify(state.earnedBadges));
    }

    if (pointsChanged) {
        // Recalculate total from all completed entries
        state.studentPoints[studentId].total = state.studentPoints[studentId].completed.reduce((sum, c) => sum + c.points, 0);
        localStorage.setItem('studentPoints', JSON.stringify(state.studentPoints));
        updatePointsDisplay(studentId);
    }
}

function getStudentTotalPoints(studentId) {
    return (state.studentPoints[studentId] && state.studentPoints[studentId].total) || 0;
}

function updatePointsDisplay(studentId) {
    const pointsEl = document.getElementById('student-points-display');
    if (pointsEl) {
        pointsEl.textContent = `${getStudentTotalPoints(studentId)} pts`;
    }
}

// Badges & Challenges Functions - Part 4: Student Badges Rendering
function renderStudentBadgesPage() {
    const studentId = state.user.studentId;
    checkAndAwardBadges(studentId);
    updatePointsDisplay(studentId);
    renderEarnedBadges(studentId);
    renderChallenges(studentId);
}

function renderEarnedBadges(studentId) {
    const gridEl = document.getElementById('earned-badges-grid');
    const badges = state.earnedBadges[studentId] || [];

    if (badges.length === 0) {
        gridEl.innerHTML = '<p class="no-badges-message">No badges earned yet. Complete challenges to earn badges!</p>';
        return;
    }

    // Deduplicate at render time as a safety net
    const seen = new Set();
    const uniqueBadges = badges.filter(badge => {
        const key = `${badge.challengeId}-${badge.tierIndex || 0}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const displayBadges = uniqueBadges.map(badge => {
        let baseName = badge.badgeName || badge.challengeName || '';
        let tierLevel = '';

        // Extract tier level from badge name
        const bronzeMatch = baseName.match(/ - Bronze$/i);
        const silverMatch = baseName.match(/ - Silver$/i);
        const goldMatch = baseName.match(/ - Gold$/i);

        if (bronzeMatch) tierLevel = 'Bronze';
        else if (silverMatch) tierLevel = 'Silver';
        else if (goldMatch) tierLevel = 'Gold';

        // Remove suffixes
        baseName = baseName.replace(/ - Complete$/i, '')
                           .replace(/ - Bronze$/i, '')
                           .replace(/ - Silver$/i, '')
                           .replace(/ - Gold$/i, '')
                           .trim();

        return {
            ...badge,
            displayName: baseName,
            tierLevel: tierLevel
        };
    });

    gridEl.innerHTML = displayBadges.map(badge => {
        const icon = badge.badgeIcon || badge.challengeIcon || '';
        const name = badge.displayName;
        const tier = badge.tierLevel;

        // Determine background color based on tier
        let bgColor = '#ffffff';
        if (tier === 'Bronze') bgColor = '#cd7f32';
        else if (tier === 'Silver') bgColor = '#c0c0c0';
        else if (tier === 'Gold') bgColor = '#ffd700';

        return `
        <div class="earned-badge-card" style="background-color: ${bgColor};">
            <img src="${icon}" alt="${name}" class="badge-icon">
            <div class="badge-info-box">
                <h4>${name}</h4>
                ${tier ? `<p class="badge-tier">${tier}</p>` : ''}
                <p class="badge-month">${badge.startDate && badge.endDate ? formatDateRange(badge.startDate, badge.endDate) : ''}</p>
            </div>
        </div>`;
    }).join('');
}

function renderChallenges(studentId) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    function parseLocal(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    const activeChallenges = state.challenges.filter(c => {
        const start = parseLocal(c.startDate);
        const end = parseLocal(c.endDate);
        return now >= start && now <= end;
    });

    const pastChallenges = state.challenges.filter(c => {
        const end = parseLocal(c.endDate);
        return now > end;
    });

    renderChallengeList('active-challenges-list', activeChallenges, studentId, true);
    renderChallengeList('past-challenges-list', pastChallenges, studentId, false);
}

function renderChallengeList(elementId, challenges, studentId, isActive) {
    const listEl = document.getElementById(elementId);

    if (challenges.length === 0) {
        const message = isActive ? 'No active challenges right now.' : 'No past challenges yet.';
        listEl.innerHTML = `<p class="no-challenges-message">${message}</p>`;
        return;
    }

    listEl.innerHTML = challenges.map(challenge => {
        const progress = getChallengeProgress(studentId, challenge);
        const tiers = challenge.tiers || [];
        const typeLabel = challenge.type === 'minutes' ? 'minutes' : (challenge.type === 'books' ? 'books' : 'day streak');
        const highestTier = tiers.length > 0 ? tiers[tiers.length - 1] : null;
        const allCompleted = highestTier && progress >= highestTier.goal;

        // Build tier progress rows
        const tiersHTML = tiers.map(tier => {
            const reached = progress >= tier.goal;
            const percentage = Math.min((progress / tier.goal) * 100, 100);
            return `
                <div class="tier-progress-row ${reached ? 'tier-reached' : ''}">
                    <span class="tier-label">${tier.name}</span>
                    <div class="tier-progress-bar-container">
                        <div class="tier-progress-bar-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <span class="tier-goal-text">${Math.min(progress, tier.goal)} / ${tier.goal}</span>
                    <span class="tier-points-text">${reached ? '✓' : ''} ${tier.points} pts</span>
                </div>
            `;
        }).join('');

        // Calculate points earned for this challenge
        const pointsData = state.studentPoints[studentId];
        const challengePointsEarned = pointsData
            ? pointsData.completed.filter(c => c.challengeId === challenge.id).reduce((sum, c) => sum + c.points, 0)
            : 0;
        const totalPossible = tiers.reduce((sum, t) => sum + t.points, 0);

        return `
            <div class="challenge-card ${allCompleted ? 'completed' : ''}">
                <img src="${challenge.thumbnail}" alt="${challenge.name}" class="challenge-icon">
                <div class="challenge-info">
                    <h4>${challenge.name}</h4>
                    ${challenge.description ? `<p class="challenge-description">${challenge.description}</p>` : ''}
                    <p class="challenge-period">${formatDateRange(challenge.startDate, challenge.endDate)}</p>
                    ${allCompleted ? '<span class="completed-badge">✓ Completed</span>' : ''}
                    <p class="challenge-points-summary">${challengePointsEarned} / ${totalPossible} points earned</p>
                    <div class="challenge-tiers-progress">
                        ${tiersHTML}
                    </div>
                    <p class="challenge-raw-progress">${progress} ${typeLabel} total</p>
                </div>
            </div>
        `;
    }).join('');
}

// Milestones Functions
function getMilestoneProgress(studentId) {
    // Calculate books read (finished books)
    const finishedBooks = (state.studentBooks[studentId] || []).filter(
        book => book.status === 'Finished'
    ).length;

    // Calculate total minutes read (already tracked in student object)
    const student = state.students.find(s => s.id === studentId);
    const totalMinutes = student ? student.totalMinutesRead : 0;

    return {
        booksRead: finishedBooks,
        minutesRead: totalMinutes
    };
}

function getCurrentTier(current, tiers) {
    // Find the highest tier achieved
    let achievedTier = null;
    let nextTier = tiers[0];

    for (let i = 0; i < tiers.length; i++) {
        if (current >= tiers[i].goal) {
            achievedTier = tiers[i];
            nextTier = tiers[i + 1] || tiers[i]; // Stay at max tier if completed all
        } else {
            nextTier = tiers[i];
            break;
        }
    }

    return { achievedTier, nextTier };
}

function renderMilestonesPage() {
    const studentId = state.user.studentId;
    const progress = getMilestoneProgress(studentId);
    const container = document.getElementById('milestones-container');

    let html = '';

    // Books Read Milestone
    const booksConfig = MILESTONES.booksRead;
    const booksTier = getCurrentTier(progress.booksRead, booksConfig.tiers);
    html += renderMilestone(
        booksConfig,
        progress.booksRead,
        booksTier.achievedTier,
        booksTier.nextTier
    );

    // Minutes Read Milestone
    const minutesConfig = MILESTONES.minutesRead;
    const minutesTier = getCurrentTier(progress.minutesRead, minutesConfig.tiers);
    html += renderMilestone(
        minutesConfig,
        progress.minutesRead,
        minutesTier.achievedTier,
        minutesTier.nextTier
    );

    container.innerHTML = html;
}

function renderMilestone(config, current, achievedTier, nextTier) {
    const percentage = (current / nextTier.goal) * 100;
    const cappedPercentage = Math.min(percentage, 100);
    const badgeColor = achievedTier ? achievedTier.color : '#E0E0E0';
    const isRainbow = badgeColor === 'rainbow';

    return `
        <div class="milestone-item">
            <div class="milestone-badge ${isRainbow ? 'rainbow-badge' : ''}"
                 style="${!isRainbow ? `background-color: ${badgeColor}` : ''}">
                <span class="milestone-icon">${config.icon}</span>
            </div>
            <div class="milestone-content">
                <div class="milestone-header">
                    <h3 class="milestone-name">${config.name}</h3>
                    ${achievedTier ? `<span class="milestone-tier">${achievedTier.name}</span>` : ''}
                </div>
                <div class="milestone-progress-section">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${cappedPercentage}%;"></div>
                    </div>
                    <span class="progress-text">${current} / ${nextTier.goal} ${config.unit}</span>
                </div>
            </div>
        </div>
    `;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeState();
    
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Check if already logged in
    if (state.user) {
        if (state.user.role === 'teacher') {
            showTeacherApp();
        } else if (state.user.role === 'student') {
            showStudentApp();
        }
    }
    
    // Student logout
    const studentLogoutBtn = document.getElementById('student-logout-btn');
    if (studentLogoutBtn) {
        studentLogoutBtn.addEventListener('click', () => {
            state.user = null;
            localStorage.removeItem('user');
            document.getElementById('student-app-screen').classList.remove('active');
            document.getElementById('login-screen').classList.add('active');
        });
    }
    
    // Teacher logout
    const teacherLogoutBtn = document.getElementById('teacher-logout-btn');
    if (teacherLogoutBtn) {
        teacherLogoutBtn.addEventListener('click', () => {
            state.user = null;
            localStorage.removeItem('user');
            document.getElementById('app-screen').classList.remove('active');
            document.getElementById('login-screen').classList.add('active');
        });
    }
    
    // Student navigation
    document.querySelectorAll('.student-dropdown a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            navigateToStudentPage(page);
        });
    });
    
    // Student Log Reading
    const studentLogReadingBtn = document.getElementById('student-log-reading-btn');
    if (studentLogReadingBtn) {
        studentLogReadingBtn.addEventListener('click', openStudentLogReadingModal);
    }
    
    const studentCancelLogBtn = document.getElementById('student-cancel-log-btn');
    if (studentCancelLogBtn) {
        studentCancelLogBtn.addEventListener('click', closeStudentLogReadingModal);
    }
    
    const studentLogReadingForm = document.getElementById('student-log-reading-form');
    if (studentLogReadingForm) {
        studentLogReadingForm.addEventListener('submit', handleStudentLogReadingSubmit);
    }
    
    // Log mode toggle
    document.getElementById('log-mode-manual-btn').addEventListener('click', () => setLogMode('manual'));
    document.getElementById('log-mode-timer-btn').addEventListener('click', () => setLogMode('timer'));

    // Timer controls
    document.getElementById('timer-start-btn').addEventListener('click', startReadingTimer);
    document.getElementById('timer-pause-btn').addEventListener('click', pauseReadingTimer);
    document.getElementById('timer-resume-btn').addEventListener('click', resumeReadingTimer);
    document.getElementById('timer-end-btn').addEventListener('click', endReadingTimer);

    // Celebration modal
    document.getElementById('celebration-continue-btn').addEventListener('click', closeCelebration);
    document.getElementById('celebration-modal').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            closeCelebration();
        }
    });

    const studentBookTitle = document.getElementById('student-book-title');
    if (studentBookTitle) {
        studentBookTitle.addEventListener('input', handleStudentBookSearch);
        studentBookTitle.addEventListener('focus', (e) => {
            if (e.target.value.trim().length === 0) {
                showStudentBookSuggestions();
            }
        });
    }

    // Books Page - Tab Switching
    document.querySelectorAll('.books-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');

            // Remove active class from all tabs and content
            document.querySelectorAll('.books-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.books-tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            e.target.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Books Page - Wishlist Search
    const wishlistSearchInput = document.getElementById('wishlist-search-input');
    if (wishlistSearchInput) {
        wishlistSearchInput.addEventListener('input', handleWishlistSearch);
    }

    // Badges - Teacher Challenge Creation
    const createChallengeBtn = document.getElementById('create-challenge-btn');
    if (createChallengeBtn) {
        createChallengeBtn.addEventListener('click', openCreateChallengeModal);
    }

    const cancelChallengeBtn = document.getElementById('cancel-challenge-btn');
    if (cancelChallengeBtn) {
        cancelChallengeBtn.addEventListener('click', closeCreateChallengeModal);
    }

    const createChallengeForm = document.getElementById('create-challenge-form');
    if (createChallengeForm) {
        createChallengeForm.addEventListener('submit', handleCreateChallengeSubmit);
    }

    const challengeTypeSelect = document.getElementById('challenge-type');
    if (challengeTypeSelect) {
        challengeTypeSelect.addEventListener('change', handleChallengeTypeChange);
    }

    const challengeThumbnailInput = document.getElementById('challenge-thumbnail');
    if (challengeThumbnailInput) {
        challengeThumbnailInput.addEventListener('change', handleThumbnailPreview);
    }

    const addTierBtn = document.getElementById('add-tier-btn');
    if (addTierBtn) {
        addTierBtn.addEventListener('click', () => addTierRow());
    }

    // Challenge Organization radio (Create)
    document.querySelectorAll('input[name="challenge-org"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            applyOrgMode(e.target.value, 'tiers-container', 'add-tier-btn', addTierRow);
        });
    });

    // Challenge Organization radio (Edit)
    document.querySelectorAll('input[name="edit-challenge-org"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            applyOrgMode(e.target.value, 'edit-tiers-container', 'edit-add-tier-btn', addEditTierRow);
        });
    });

    // Edit Challenge Modal
    const cancelEditChallengeBtn = document.getElementById('cancel-edit-challenge-btn');
    if (cancelEditChallengeBtn) {
        cancelEditChallengeBtn.addEventListener('click', closeEditChallengeModal);
    }

    const editChallengeForm = document.getElementById('edit-challenge-form');
    if (editChallengeForm) {
        editChallengeForm.addEventListener('submit', handleEditChallengeSubmit);
    }

    const editChallengeType = document.getElementById('edit-challenge-type');
    if (editChallengeType) {
        editChallengeType.addEventListener('change', (e) => {
            const type = e.target.value;
            const goalUnit = document.getElementById('edit-goal-unit');
            if (type === 'minutes') goalUnit.textContent = 'Set tier goals in total minutes to read';
            else if (type === 'books') goalUnit.textContent = 'Set tier goals in total books to finish';
            else if (type === 'streak') goalUnit.textContent = 'Set tier goals in consecutive days';
            else goalUnit.textContent = '';
            // Update existing tier placeholders
            let placeholder = 'Goal';
            if (type === 'minutes') placeholder = 'Minutes';
            else if (type === 'books') placeholder = 'Books';
            else if (type === 'streak') placeholder = 'Days';
            document.querySelectorAll('#edit-tiers-container .tier-goal-input').forEach(input => {
                input.placeholder = placeholder;
            });
        });
    }

    const editChallengeThumbnail = document.getElementById('edit-challenge-thumbnail');
    if (editChallengeThumbnail) {
        editChallengeThumbnail.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('edit-thumbnail-preview-img').src = event.target.result;
                    document.getElementById('edit-thumbnail-preview').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const editAddTierBtn = document.getElementById('edit-add-tier-btn');
    if (editAddTierBtn) {
        editAddTierBtn.addEventListener('click', () => addEditTierRow());
    }

    // Badges - Student Tab Switching
    document.querySelectorAll('.badges-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');

            // Remove active class from all tabs and content
            document.querySelectorAll('.badges-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.badges-tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            e.target.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Navigation - standalone nav links and dropdown links
    document.querySelectorAll('.dropdown a, .main-nav > a.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Log Reading
    document.getElementById('log-reading-btn').addEventListener('click', openLogReadingModal);
    document.getElementById('cancel-log-btn').addEventListener('click', closeLogReadingModal);
    document.getElementById('log-reading-form').addEventListener('submit', handleLogReadingSubmit);
    document.getElementById('select-all-students').addEventListener('change', handleSelectAllStudents);
    
    // Free reading toggle
    document.querySelectorAll('input[name="freeReading"]').forEach(radio => {
        radio.addEventListener('change', updateFreeReadingFields);
    });
    
    // Book search
    document.getElementById('book-title').addEventListener('input', handleBookSearch);
    
    // Edit Student
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditStudentModal);
    document.getElementById('edit-student-form').addEventListener('submit', handleEditStudentSubmit);
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeLogReadingModal();
                closeEditStudentModal();
                closeStudentLogReadingModal();
                closeChartDetailModal();
                closeEditChallengeModal();
            }
        });
    });

    // Chart detail modal close button
    document.getElementById('chart-detail-close').addEventListener('click', closeChartDetailModal);

    // Month selector
    document.getElementById('month-selector').addEventListener('change', handleMonthChange);

    // Dropdown menu click behavior (Teacher)
    document.querySelectorAll('.nav-item').forEach(navItem => {
        const dropdown = navItem.querySelector('.dropdown');
        const navLink = navItem.querySelector('.nav-link');
        
        navLink.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns
            document.querySelectorAll('.nav-item .dropdown').forEach(dd => {
                if (dd !== dropdown) dd.style.display = 'none';
            });
            // Toggle current dropdown
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    });
    
    // Dropdown menu click behavior (Student)
    document.querySelectorAll('.student-nav-item').forEach(navItem => {
        const dropdown = navItem.querySelector('.student-dropdown');
        const navMain = navItem.querySelector('.student-nav-main');
        
        navMain.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns
            document.querySelectorAll('.student-nav-item .student-dropdown').forEach(dd => {
                if (dd !== dropdown) dd.style.display = 'none';
            });
            // Toggle current dropdown
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Monthly Reading Goal Functions
    function getMonthlyGoal() {
        const storedGoal = localStorage.getItem('monthlyReadingGoal');
        return storedGoal ? parseInt(storedGoal) : 1000; // Default 1000 minutes
    }

    function setMonthlyGoal(goal) {
        localStorage.setItem('monthlyReadingGoal', goal.toString());
        updateAllProgressBars();
    }

    function calculateClassMonthlyMinutes() {
        const now = new Date();
        const allLogs = state.readingLogs;
        return calculateMinutesForPeriod(allLogs, 'month', now);
    }

    function updateProgressBar(current, goal, markerElementId, textElementId) {
        const percentage = Math.min((current / goal) * 100, 100);
        const marker = document.getElementById(markerElementId);
        const text = document.getElementById(textElementId);

        if (marker) {
            marker.style.left = `${percentage}%`;
        }
        if (text) {
            text.textContent = `${current} / ${goal} minutes`;
        }
    }

    // Edit Goal Button
    const editGoalBtn = document.getElementById('edit-goal-btn');
    if (editGoalBtn) {
        editGoalBtn.addEventListener('click', () => {
            const currentGoal = getMonthlyGoal();
            const newGoal = prompt(`Enter monthly reading goal (in minutes):`, currentGoal);
            if (newGoal && !isNaN(newGoal) && parseInt(newGoal) > 0) {
                setMonthlyGoal(parseInt(newGoal));
            }
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown, .student-dropdown').forEach(dd => {
            dd.style.display = 'none';
        });
    });
});
