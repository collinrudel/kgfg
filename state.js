// ============================================================================
// STATE.JS - Global State Object and Initialization
// ============================================================================

// Global State
let state = {
    user: null,
    students: [],
    readingLogs: [],
    studentBooks: {}, // { studentId: [{ id, title, author, cover, status, dateAdded }] }
    studentWishlist: {}, // { studentId: [{ id, title, author, cover, dateAdded }] }
    challenges: [], // { id, name, description, thumbnail, type, tiers: [{ name, goal, points, icon }], startDate, endDate, createdBy }
    earnedBadges: {}, // { studentId: [{ id, challengeId, tierIndex, dateEarned, badgeName, badgeIcon, startDate, endDate }] }
    studentPoints: {}, // { studentId: { total: N, completed: [{ challengeId, tierIndex, tierName, points, dateEarned }] } }
    teacherFavorites: [],
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

    const storedFavorites = localStorage.getItem('teacherFavorites');
    if (storedFavorites) {
        state.teacherFavorites = JSON.parse(storedFavorites);
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

    // Deduplicate earned badges (remove duplicates for same challenge and tier)
    let badgesDeduped = false;
    Object.keys(state.earnedBadges).forEach(studentId => {
        const badges = state.earnedBadges[studentId];
        const seen = new Set();
        const dedupedBadges = badges.filter(badge => {
            const key = `${badge.challengeId}-${badge.tierIndex}`;
            if (seen.has(key)) {
                console.log(`Removing duplicate badge: ${badge.badgeName} (${key})`);
                badgesDeduped = true;
                return false; // Filter out duplicate
            }
            seen.add(key);
            return true;
        });
        if (badges.length !== dedupedBadges.length) {
            console.log(`Student ${studentId}: Removed ${badges.length - dedupedBadges.length} duplicate badge(s)`);
        }
        state.earnedBadges[studentId] = dedupedBadges;
    });
    if (badgesDeduped) {
        console.log('Deduplication complete. Total unique badges stored.');
        localStorage.setItem('earnedBadges', JSON.stringify(state.earnedBadges));
    }
}

// Helper function to manually clear all earned badges (for cleanup)
function clearEarnedBadges() {
    state.earnedBadges = {};
    localStorage.removeItem('earnedBadges');
    console.log('All earned badges cleared from state and localStorage');
    location.reload();
}

// Helper function to manually deduplicate earned badges and refresh
function deduplicateAndRefresh() {
    Object.keys(state.earnedBadges).forEach(studentId => {
        const badges = state.earnedBadges[studentId];
        const seen = new Set();
        const dedupedBadges = badges.filter(badge => {
            const key = `${badge.challengeId}-${badge.tierIndex}`;
            if (seen.has(key)) {
                console.log(`Removing duplicate badge: ${badge.badgeName} (${key})`);
                return false;
            }
            seen.add(key);
            return true;
        });
        if (badges.length !== dedupedBadges.length) {
            console.log(`Student ${studentId}: Removed ${badges.length - dedupedBadges.length} duplicate badge(s)`);
        }
        state.earnedBadges[studentId] = dedupedBadges;
    });
    localStorage.setItem('earnedBadges', JSON.stringify(state.earnedBadges));
    console.log('Badges deduplicated. Refreshing...');
    location.reload();
}
