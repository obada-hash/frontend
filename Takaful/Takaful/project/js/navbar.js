import { isLoggedIn, logout, getCurrentUser } from '../api/claude_api/auth_api.js';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

function updateNavbar() {
    // 1. Check if user is logged in
    if (!isLoggedIn()) {
        return; // If not logged in, keep the default Login/Register buttons
    }

    // 2. Select the container that holds the buttons
    const authButtonsContainer = document.querySelector('.auth-buttons');
    if (!authButtonsContainer) return;

    // 3. Get User Info (optional, to say "Welcome")
    const user = getCurrentUser();
    
    // 4. Replace the HTML content
    // We remove the old buttons and add a Logout button
    authButtonsContainer.innerHTML = `
        <div class="user-menu" style="display: flex; align-items: center; gap: 15px;">
            <span style="font-weight: bold; color: var(--primary);">
                <i class="fas fa-user-circle"></i> مرحباً
            </span>
            <button id="logoutBtn" class="btn btn-outline" style="border-radius: 50px; padding: 8px 20px;">
                <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
            </button>
        </div>
    `;

    // 5. Add functionality to the new Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await logout();
                // Redirect to login page or refresh
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout failed', error);
                // Fallback: Force clear storage and redirect
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }
}