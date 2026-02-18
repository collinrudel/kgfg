// ============================================================================
// MAIN.JS - Application Initialization and Event Listeners
// ============================================================================

// Event Listeners and Initialization
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
    document.querySelectorAll('.student-nav-link').forEach(link => {
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
                closeRecommendModal();
                closeBookStudentsModal();
            }
        });
    });

    // Chart detail modal close button
    document.getElementById('chart-detail-close').addEventListener('click', closeChartDetailModal);

    // Book Students Modal
    document.getElementById('close-book-students-modal').addEventListener('click', closeBookStudentsModal);

    // Recommend Modal
    document.getElementById('cancel-recommend').addEventListener('click', closeRecommendModal);
    document.getElementById('submit-recommend').addEventListener('click', handleRecommendSubmit);
    document.getElementById('recommend-select-all').addEventListener('change', (e) => {
        document.querySelectorAll('#recommend-students-list input[type="checkbox"]')
            .forEach(cb => cb.checked = e.target.checked);
    });

    // Teacher Books Page Tabs
    document.querySelectorAll('.teacher-books-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            document.querySelectorAll('.teacher-books-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.teacher-books-tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            if (tabName === 'favorites') {
                renderTeacherFavorites();
            }
        });
    });

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
