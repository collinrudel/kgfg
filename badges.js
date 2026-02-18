// ============================================================================
// BADGES.JS - Challenge and Badge Management Functions
// ============================================================================

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
                    b => b.challengeId === challenge.id && b.tierIndex === tierIndex
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
    let badges = state.earnedBadges[studentId] || [];

    console.log(`renderEarnedBadges: Found ${badges.length} badge(s) for student ${studentId}`);
    badges.forEach(b => {
        console.log(`  - ${b.badgeName} (challengeId: ${b.challengeId}, tierIndex: ${b.tierIndex})`);
    });

    // Deduplicate badges for display (in case there are duplicates in state)
    const seen = new Set();
    badges = badges.filter(badge => {
        const key = `${badge.challengeId}-${badge.tierIndex}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    if (badges.length === 0) {
        gridEl.innerHTML = '<p class="no-badges-message">No badges earned yet. Complete challenges to earn badges!</p>';
        return;
    }

    // Filter out suffixes but keep all tier variations
    const displayBadges = badges.map(badge => {
        let baseName = badge.badgeName || badge.challengeName || '';
        let tierLevel = '';
        
        // Extract tier level from badge name
        const bronzeMatch = baseName.match(/ - Bronze$/i);
        const silverMatch = baseName.match(/ - Silver$/i);
        const goldMatch = baseName.match(/ - Gold$/i);
        
        if (bronzeMatch) tierLevel = 'Bronze';
        else if (silverMatch) tierLevel = 'Silver';
        else if (goldMatch) tierLevel = 'Gold';
        
        // Remove suffixes but keep the badge object
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
        let bgColor = '#ffffff'; // white for one-and-done
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
