import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

export function initUserMenu() {
    // Create and inject user menu HTML
    const userMenuHTML = `
        <button class="hamburger" id="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="side-nav" id="sideNav">
            <div class="user-profile-nav">
                <img src="" alt="Profile" id="navAvatar" class="nav-avatar">
                <div class="nav-username" id="navUsername">User Name</div>
                <div class="nav-email" id="navEmail">user@example.com</div>
            </div>

            <div class="nav-menu">
                <a href="dashboard.html" class="nav-item">
                    <i>🏠</i> Dashboard
                </a>
                <a href="#profile" class="nav-item">
                    <i>👤</i> Profile
                </a>
                <a href="#settings" class="nav-item">
                    <i>⚙️</i> Settings
                </a>
                <a href="#reset-password" class="nav-item">
                    <i>🔒</i> Reset Password
                </a>
                
                <div class="nav-divider"></div>
                
                <a href="#help" class="nav-item">
                    <i>❓</i> Help & Support
                </a>
                <button class="nav-item" id="logoutBtn">
                    <i>🚪</i> Logout
                </button>
            </div>
        </div>

        <div class="nav-overlay" id="navOverlay"></div>
    `;

    // Insert menu at the start of body
    document.body.insertAdjacentHTML('afterbegin', userMenuHTML);

    // Add event listeners
    const hamburger = document.getElementById('hamburger');
    const sideNav = document.getElementById('sideNav');
    const navOverlay = document.getElementById('navOverlay');
    const logoutBtn = document.getElementById('logoutBtn');

    // Toggle navigation
    function toggleNav() {
        hamburger.classList.toggle('active');
        sideNav.classList.toggle('active');
        navOverlay.classList.toggle('active');
    }

    hamburger.addEventListener('click', toggleNav);
    navOverlay.addEventListener('click', toggleNav);

    // Update user info from Firebase
    function updateUserInfo() {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('navAvatar').src = user.photoURL || 'path/to/default-avatar.jpg';
        document.getElementById('navUsername').textContent = user.displayName || 'User';
        document.getElementById('navEmail').textContent = user.email;

        // Store in localStorage for persistence
        localStorage.setItem('userProfile', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        }));
    }

    // Handle logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('userProfile');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });

    // Initialize user info
    updateUserInfo();

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            updateUserInfo();
        } else {
            window.location.href = 'login.html';
        }
    });
}
