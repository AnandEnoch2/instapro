// In-memory storage
const users = new Map();
const loginAttempts = [];

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin123'
};

// State
let isLogin = true;
let loading = false;

// DOM Elements
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const usernameField = document.getElementById('usernameField');
const submitBtn = document.getElementById('submitBtn');
const authToggleText = document.getElementById('authToggleText');
const authToggleBtn = document.getElementById('authToggleBtn');
const authView = document.getElementById('authView');
const adminView = document.getElementById('adminView');

// Toast notification
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Toggle between login and signup
function toggleAuth() {
  isLogin = !isLogin;
  usernameField.style.display = isLogin ? 'none' : 'block';
  submitBtn.textContent = loading ? 'Please wait...' : (isLogin ? 'Log in' : 'Sign up');
  authToggleText.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
  authToggleBtn.textContent = isLogin ? 'Sign up' : 'Log in';
}

// Handle form submission
async function handleAuth(e) {
  e.preventDefault();
  if (loading) return;

  const email = emailInput.value;
  const password = passwordInput.value;
  const username = usernameInput.value;

  loading = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait...';

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Check for admin login
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      showToast('Admin logged in successfully!', 'success');
      authView.style.display = 'none';
      adminView.style.display = 'block';
      updateAdminTables();
      return;
    }

    if (isLogin) {
      const user = users.get(email);
      if (!user || user.password !== password) {
        loginAttempts.push({
          email,
          timestamp: new Date().toLocaleString(),
          success: false
        });
        throw new Error('Invalid email or password');
      }
      loginAttempts.push({
        email,
        timestamp: new Date().toLocaleString(),
        success: true
      });
      users.set(email, { ...user, loginTime: new Date().toLocaleString() });
      showToast('Logged in successfully!', 'success');
    } else {
      if (users.has(email)) {
        throw new Error('Email already registered');
      }
      users.set(email, {
        password,
        username,
        loginTime: new Date().toLocaleString()
      });
      showToast('Account created successfully!', 'success');
      toggleAuth();
    }

    // Clear form
    authForm.reset();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    loading = false;
    submitBtn.disabled = false;
    submitBtn.textContent = isLogin ? 'Log in' : 'Sign up';
  }
}

// Handle logout
function handleLogout() {
  authView.style.display = 'flex';
  adminView.style.display = 'none';
  emailInput.value = '';
  passwordInput.value = '';
  showToast('Logged out successfully', 'success');
}

// Update admin tables
function updateAdminTables() {
  // Update users table
  const usersTableBody = document.querySelector('#usersTable tbody');
  usersTableBody.innerHTML = '';
  
  for (const [email, user] of users.entries()) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${email}</td>
      <td>${user.username || 'N/A'}</td>
      <td>${user.loginTime || 'Never'}</td>
    `;
    usersTableBody.appendChild(row);
  }

  // Update attempts table
  const attemptsTableBody = document.querySelector('#attemptsTable tbody');
  attemptsTableBody.innerHTML = '';

  for (const attempt of loginAttempts) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${attempt.email}</td>
      <td>${attempt.timestamp}</td>
      <td>
        <span class="status-badge ${attempt.success ? 'success' : 'failed'}">
          ${attempt.success ? 'Success' : 'Failed'}
        </span>
      </td>
    `;
    attemptsTableBody.appendChild(row);
  }
}