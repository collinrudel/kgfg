// ============================================================================
// CONFIG.JS - Application Constants and Configuration
// ============================================================================

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
