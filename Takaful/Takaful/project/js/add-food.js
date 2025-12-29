import { createFood } from '../api/claude_api/food_api.js';
import { isLoggedIn, getCurrentUser } from '../api/claude_api/auth_api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. التحقق من الصلاحيات
    if (!isLoggedIn()) {
        alert('يرجى تسجيل الدخول أولاً للمتابعة.');
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    // التحقق من الأدوار (HOTEL أو ROLE_HOTEL)
    const isRestaurant = user.roles.some(role => 
        role.toUpperCase() === 'ROLE_HOTEL' || 
        role.toUpperCase() === 'RESTAURANT' || 
        role.toUpperCase() === 'HOTEL'
    );

    if (!isRestaurant) {
        alert('عذراً، هذه الصفحة مخصصة للمطاعم والفنادق فقط.');
        window.location.href = 'index.html';
        return;
    }

    // 2. معالجة نموذج الإضافة
    const form = document.getElementById('addFoodForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // جمع البيانات من الحقول
            const title = document.getElementById('foodTitle').value;
            const category = document.getElementById('foodType').value;
            const quantity = document.getElementById('foodQuantity').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const pickupTime = document.getElementById('pickupTime').value; // قراءة الحقل الجديد
            const description = document.getElementById('description').value;

            // تجهيز الكائن للإرسال
            const foodData = {
                title: title,
                type: category, 
                quantity: parseInt(quantity),
                availableUntil: expiryDate,
                pickupTime: pickupTime, // إرسال الحقل الإجباري للباك-إند
                description: description
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                // تفعيل حالة التحميل
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري النشر...';
                submitBtn.disabled = true;

                // إرسال الطلب (user.id يمثل hotelId)
                await createFood(user.id, foodData);

                alert('✅ تم إضافة الطعام بنجاح! شكراً لمساهمتك.');
                
                // إعادة توجيه
                window.location.href = 'food-available.html';

            } catch (error) {
                console.error(error);
                alert('❌ فشل إضافة الطعام: ' + (error.message || 'خطأ غير معروف'));
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});