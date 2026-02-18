// ============================================================================
// BOOKS.JS - Books Page Management and Book Ratings
// ============================================================================

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
                ${book.recommended ? '<div class="recommended-badge">Recommended</div>' : ''}
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
