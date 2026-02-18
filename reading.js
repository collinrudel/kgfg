// ============================================================================
// READING.JS - Reading Log Management and Reading Timer
// ============================================================================

let readingLogPage = 1;
const READING_LOG_PER_PAGE = 10;

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
