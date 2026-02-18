// ============================================================================
// AUTH.JS - Authentication and Login Functions
// ============================================================================

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
