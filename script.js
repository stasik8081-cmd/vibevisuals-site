const API = 'https://vibevisuals-api.onrender.com';

let currentUser = null;
let authToken = null;

// Check saved session on load
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('vv_session');
    if (saved) {
        const session = JSON.parse(saved);
        authToken = session.token;
        currentUser = session.user;
    }
});

// Modal functions
function showAuth(form) {
    document.getElementById('auth-modal').classList.add('active');
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (currentUser && authToken) {
        document.getElementById('dashboard').classList.add('active');
        updateDashboard();
    } else {
        document.getElementById(form + '-form').classList.add('active');
    }
    
    clearErrors();
}

function closeAuth() {
    document.getElementById('auth-modal').classList.remove('active');
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(e => e.textContent = '');
    document.querySelectorAll('.success').forEach(e => e.textContent = '');
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch(API + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('vv_session', JSON.stringify({ token: authToken, user: currentUser }));
            
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById('dashboard').classList.add('active');
            updateDashboard();
        } else {
            document.getElementById('login-error').textContent = translateError(data.message);
        }
    } catch (err) {
        document.getElementById('login-error').textContent = 'Ошибка подключения к серверу';
    }
}

// Register
async function handleRegister(e) {
    e.preventDefault();
    clearErrors();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    if (password.length < 6) {
        document.getElementById('register-error').textContent = 'Пароль минимум 6 символов';
        return;
    }
    
    try {
        const res = await fetch(API + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('vv_session', JSON.stringify({ token: authToken, user: currentUser }));
            
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById('dashboard').classList.add('active');
            updateDashboard();
        } else {
            document.getElementById('register-error').textContent = translateError(data.message);
        }
    } catch (err) {
        document.getElementById('register-error').textContent = 'Ошибка подключения к серверу';
    }
}

// Update dashboard
function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById('dash-username').textContent = currentUser.username;
    
    const statusEl = document.getElementById('dash-status');
    if (currentUser.subscriptionActive) {
        statusEl.textContent = '✓ Подписка активна';
        statusEl.style.color = '#00d4aa';
    } else {
        statusEl.textContent = '✗ Подписка не активна';
        statusEl.style.color = '#ff6b6b';
    }
}

// Activate key
async function activateKey() {
    clearErrors();
    
    const key = document.getElementById('activation-key').value.trim();
    if (!key) {
        document.getElementById('key-error').textContent = 'Введите ключ';
        return;
    }
    
    try {
        const res = await fetch(API + '/api/user/activate-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({ key })
        });
        
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('key-success').textContent = '✓ Ключ активирован!';
            document.getElementById('activation-key').value = '';
            currentUser.subscriptionActive = true;
            localStorage.setItem('vv_session', JSON.stringify({ token: authToken, user: currentUser }));
            updateDashboard();
        } else {
            document.getElementById('key-error').textContent = translateError(data.message);
        }
    } catch (err) {
        document.getElementById('key-error').textContent = 'Ошибка подключения';
    }
}

// Logout
function logoutUser() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('vv_session');
    closeAuth();
}

// Download mod
function downloadMod() {
    if (!currentUser || !currentUser.subscriptionActive) {
        showAuth('login');
        return;
    }
    // Add actual download link here
    alert('Скачивание начнётся автоматически...');
}

// Translate errors
function translateError(msg) {
    const translations = {
        'Invalid credentials': 'Неверный email или пароль',
        'Email already exists': 'Email уже зарегистрирован',
        'Invalid or used key': 'Неверный или использованный ключ',
        'User not found': 'Пользователь не найден'
    };
    return translations[msg] || msg;
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuth();
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.length > 1) {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
