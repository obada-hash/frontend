import { login } from '../api/claude_api/auth_api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. UI Setup & Variables ---
    const loginForm = document.getElementById('loginForm');

    // --- 2. LOGIN Logic (Using auth.js) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            // Basic validation
            if (!email || !password) {
                alert('❌ الرجاء تعبئة البريد الإلكتروني وكلمة المرور');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                // UI Loading
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...';
                submitBtn.disabled = true;

                // 1. Call auth.js login
                // Note: auth.js login() automatically saves the token to localStorage
                const result = await login({ email, password });

                alert('✅ تم تسجيل الدخول بنجاح!');

                // 2. Redirect based on Role (Checking the result from auth.js)
                // Assuming result.roles is an array like ["HOTEL"] or ["CHARITY"]
                const roles = result.roles || [];
                
                if (roles.includes('HOTEL') || roles.includes('RESTAURANT')) {
                    window.location.href = 'restaurant-dashboard.html';
                } else if (roles.includes('CHARITY')) {
                    window.location.href = 'charity-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                console.error(error);
                alert('❌ ' + (error.message || 'فشل تسجيل الدخول'));
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});