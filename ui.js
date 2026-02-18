// ============================================================================
// UI.JS - Navigation, UI Rendering, and Modal Management
// ============================================================================

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
    } else if (pageName === 'teacher-books') {
        renderTeacherBooksPage();
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
        'teacher-books': ['Books'],
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

function showTeacherApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    navigateToPage('reading');
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

// Teacher Books Page
function getClassBooksData() {
    const booksMap = {};
    for (const studentId in state.studentBooks) {
        const books = state.studentBooks[studentId];
        for (const book of books) {
            const key = book.title;
            if (!booksMap[key]) {
                booksMap[key] = {
                    title: book.title,
                    author: book.author,
                    cover: book.cover,
                    readingCount: 0,
                    finishedCount: 0
                };
            }
            if (book.status === 'Reading') {
                booksMap[key].readingCount++;
            } else if (book.status === 'Finished') {
                booksMap[key].finishedCount++;
            }
        }
    }
    return Object.values(booksMap).sort((a, b) => {
        if (b.readingCount !== a.readingCount) return b.readingCount - a.readingCount;
        if (b.finishedCount !== a.finishedCount) return b.finishedCount - a.finishedCount;
        return a.title.localeCompare(b.title);
    });
}

function renderTeacherBooksPage() {
    const listEl = document.getElementById('teacher-books-list');
    const books = getClassBooksData();

    if (books.length === 0) {
        listEl.innerHTML = '<p class="no-books-message">No books have been logged yet.</p>';
        return;
    }

    listEl.innerHTML = `
        <div class="students-table">
            <table>
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Author</th>
                        <th>Currently Reading</th>
                        <th>Finished</th>
                    </tr>
                </thead>
                <tbody>
                    ${books.map(book => `
                        <tr>
                            <td class="teacher-book-title-cell">
                                ${book.cover ? `<img src="${book.cover}" alt="${book.title}" class="teacher-book-cover">` : ''}
                                <span>${book.title}</span>
                            </td>
                            <td>${book.author || 'Unknown'}</td>
                            <td>${book.readingCount}</td>
                            <td>${book.finishedCount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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

// Book Search with Open Library API
function getClassBookSuggestions(query) {
    const classBooks = getClassBooksData();
    const lowerQuery = query.toLowerCase();
    const matching = classBooks.filter(b => b.title.toLowerCase().includes(lowerQuery));
    // Sort: currently reading first, then finished-only
    return matching.sort((a, b) => {
        if (b.readingCount !== a.readingCount) return b.readingCount - a.readingCount;
        if (b.finishedCount !== a.finishedCount) return b.finishedCount - a.finishedCount;
        return a.title.localeCompare(b.title);
    });
}

function renderClassBookItem(book, index) {
    return `
        <div class="book-result-item class-book-item" data-class-book-index="${index}">
            ${book.cover ? `<img src="${book.cover}" alt="${book.title}" class="book-thumbnail">` : '<div class="book-thumbnail-placeholder">📚</div>'}
            <div class="book-info">
                <strong>${book.title}</strong><br>
                <small>by ${book.author || 'Unknown'}</small>
            </div>
        </div>
    `;
}

let searchTimeout;
function handleBookSearch(e) {
    const query = e.target.value;
    const resultsEl = document.getElementById('book-search-results');

    clearTimeout(searchTimeout);

    if (!query.trim()) {
        resultsEl.classList.add('hidden');
        return;
    }

    // Show class book matches immediately
    const classSuggestions = getClassBookSuggestions(query);
    if (classSuggestions.length > 0) {
        resultsEl.innerHTML = '<div class="class-books-divider">Class Books</div>' +
            classSuggestions.map((book, i) => renderClassBookItem(book, i)).join('');
        window.currentClassBookResults = classSuggestions;
        resultsEl.querySelectorAll('.class-book-item').forEach((item, i) => {
            item.addEventListener('click', () => {
                const book = window.currentClassBookResults[i];
                selectClassBook(book);
            });
        });
        resultsEl.classList.remove('hidden');
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
            );
            const data = await response.json();

            let html = '';

            // Prepend class books
            const classMatches = getClassBookSuggestions(query);
            if (classMatches.length > 0) {
                html += '<div class="class-books-divider">Class Books</div>';
                html += classMatches.map((book, i) => renderClassBookItem(book, i)).join('');
                window.currentClassBookResults = classMatches;
            }

            if (data.docs && data.docs.length > 0) {
                if (classMatches.length > 0) {
                    html += '<div class="class-books-divider">Search Results</div>';
                }
                html += data.docs.map((book, index) => {
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

                window.currentBookSearchResults = data.docs;
            }

            if (html) {
                resultsEl.innerHTML = html;

                // Add click handlers for class books
                resultsEl.querySelectorAll('.class-book-item').forEach((item, i) => {
                    item.addEventListener('click', () => {
                        const book = window.currentClassBookResults[i];
                        selectClassBook(book);
                    });
                });

                // Add click handlers for API results
                resultsEl.querySelectorAll('.book-result-item:not(.class-book-item)').forEach((item) => {
                    const index = parseInt(item.getAttribute('data-book-index'));
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
            // Keep class book results visible if they exist
            if (!resultsEl.querySelector('.class-book-item')) {
                resultsEl.classList.add('hidden');
            }
        }
    }, 500);
}

function selectClassBook(book) {
    state.selectedBook = {
        title: book.title,
        author: book.author,
        cover: book.cover
    };
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-search-results').classList.add('hidden');
}

function selectBook(book) {
    const title = book.title || 'Unknown Title';
    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown';
    const coverId = book.cover_i;
    const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

    state.selectedBook = {
        title: title,
        author: authors,
        cover: cover
    };

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

// Render teacher and student charts
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
