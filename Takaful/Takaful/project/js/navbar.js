import { isLoggedIn, logout, getCurrentUser } from '../api/claude_api/auth_api.js';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

function updateNavbar() {
    // 1. التحقق من تسجيل الدخول
    if (!isLoggedIn()) {
        return; // إذا لم يكن مسجلاً، اترك أزرار الدخول كما هي
    }

    // 2. تحديد العنصر الحاوي للأزرار
    const authButtonsContainer = document.querySelector('.auth-buttons');
    if (!authButtonsContainer) return;

    // 3. جلب معلومات المستخدم
    const user = getCurrentUser();
    
    // 4. تحديد الاسم الذي سيتم عرضه
    // - نحاول جلب الاسم من localStorage إذا كان موجوداً
    // - وإلا نستخدم البريد الإلكتروني
    let displayName = localStorage.getItem('userName') || user.email || 'زائر';

    // تحسين: إذا كان الاسم عبارة عن بريد إلكتروني، نأخذ الجزء الذي قبل @ فقط
    if (displayName.includes('@')) {
        displayName = displayName.split('@')[0];
    }

    // 5. استبدال محتوى HTML
    authButtonsContainer.innerHTML = `
        <div class="user-menu" style="display: flex; align-items: center; gap: 15px;">
            <span style="font-weight: bold; color: var(--primary); font-family: 'Tajawal', sans-serif;">
                <i class="fas fa-user-circle"></i> مرحباً، ${displayName}
            </span>
            <button id="logoutBtn" class="btn btn-outline" style="border-radius: 50px; padding: 8px 20px;">
                <i class="fas fa-sign-out-alt"></i> خروج
            </button>
        </div>
    `;

    // 6. تفعيل زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await logout();
                // توجيه لصفحة الدخول
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout failed', error);
                // تنظيف إجباري في حال الخطأ
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }
}