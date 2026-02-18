// ============================================================================
// UTILS.JS - Utility Functions and Helper Methods
// ============================================================================

// Date Range Helper
function formatDateRange(startDate, endDate) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const startStr = `${monthNames[sm - 1]} ${sd}, ${sy}`;
    const endStr = `${monthNames[em - 1]} ${ed}, ${ey}`;
    return `${startStr} - ${endStr}`;
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

// Helper function to parse date string as local date
function parseLocalDate(date) {
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    return new Date(date);
}

// Read file as data URL
function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Calculate minutes for a given period
function calculateMinutesForPeriod(logs, period, referenceDate) {
    const refDate = new Date(referenceDate);

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

// Calculate reading streak for a student
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
