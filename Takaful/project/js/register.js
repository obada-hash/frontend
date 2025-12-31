    import { register } from '../api/claude_api/auth_api.js';

    // اختيار نوع المستخدم
    function selectUserType(type) {
        // إزالة النشط من جميع الأزرار
        document.querySelectorAll('.user-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة النشط للزر المضغوط
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // إخفاء جميع النماذج
        document.querySelectorAll('.registration-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // إظهار النموذج المناسب
        if (type === 'restaurant') {
            document.getElementById('restaurantForm').classList.add('active');
        } else if (type === 'charity') {
            document.getElementById('charityForm').classList.add('active');
        }
    }

    // Make function available globally
    window.selectUserType = selectUserType;
    
    // معالجة تسجيل المطاعم/الفنادق
    document.getElementById('restaurantForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // التحقق من تطابق كلمة المرور
        const password = document.getElementById('restaurantPassword').value;
        const confirmPassword = document.getElementById('restaurantConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('❌ كلمات المرور غير متطابقة!');
            return;
        }
        
        if (password.length < 8) {
            alert('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        // Disable submit button
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
        
        // جمع البيانات للإرسال إلى API
        const hotelData = {
            email: document.getElementById('restaurantEmail').value,
            password: password,
            role: 'HOTEL',
            hotelName: document.getElementById('restaurantName').value,
            address: `${document.getElementById('restaurantAddress').value} - ${document.getElementById('restaurantCity').value}`,
            contactPhone: document.getElementById('restaurantPhone').value,
            description: `المالك: ${document.getElementById('restaurantOwner').value} | الترخيص: ${document.getElementById('restaurantLicense').value || 'غير محدد'}`
        };
        
        try {
            // إرسال البيانات إلى API
            const result = await register(hotelData);
            
            console.log('تم التسجيل بنجاح:', result);
            
            alert('✅ تم تسجيل المطعم/الفندق بنجاح!\n\nيمكنك الآن تسجيل الدخول.');
            
            // توجيه لصفحة تسجيل الدخول
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            alert('❌ فشل التسجيل: ' + error.message);
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    // معالجة تسجيل الجمعيات
    document.getElementById('charityForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // التحقق من تطابق كلمة المرور
        const password = document.getElementById('charityPassword').value;
        const confirmPassword = document.getElementById('charityConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('❌ كلمات المرور غير متطابقة!');
            return;
        }
        
        if (password.length < 8) {
            alert('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        // Disable submit button
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
        
        // جمع البيانات للإرسال إلى API
        const charityData = {
            email: document.getElementById('charityEmail').value,
            password: password,
            role: 'CHARITY',
            organizationName: document.getElementById('charityName').value,
            address: `${document.getElementById('charityAddress').value} - ${document.getElementById('charityArea').value} - ${document.getElementById('charityCity').value}`,
            contactPhone: document.getElementById('charityPhone').value,
            registrationNumber: document.getElementById('charityLicense').value,
            description: document.getElementById('charityDescription').value || `المدير: ${document.getElementById('charityManager').value} | سنة التأسيس: ${document.getElementById('charityEstablished').value || 'غير محدد'}`
        };
        
        try {
            // إرسال البيانات إلى API
            const result = await register(charityData);
            
            console.log('تم التسجيل بنجاح:', result);
            
            alert('✅ تم تسجيل الجمعية بنجاح!\n\nيمكنك الآن تسجيل الدخول.');
            
            // توجيه لصفحة تسجيل الدخول
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            alert('❌ فشل التسجيل: ' + error.message);
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    // التحقق من البريد الإلكتروني
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // التحقق من رقم الهاتف
    function validatePhone(phone) {
        const phoneRegex = /^(07)[0-9]{8}$/;
        return phoneRegex.test(phone);
    }
    
    // إضافة التحقق أثناء الكتابة
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#e74c3c';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.color = '#e74c3c';
                }
            } else {
                this.style.borderColor = '#ddd';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.color = '#666';
                }
            }
        });
    });
    
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.style.borderColor = '#e74c3c';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.color = '#e74c3c';
                }
            } else {
                this.style.borderColor = '#ddd';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.color = '#666';
                }
            }
        });
    });
// ```

// **Key changes made:**

// 1. ✅ **Imported the `register` function** from your `auth_api.js` file
// 2. ✅ **Restaurant/Hotel registration** sends data as `HOTEL` role with proper structure
// 3. ✅ **Charity registration** sends data as `CHARITY` role with proper structure
// 4. ✅ **Password validation** - checks if passwords match and are at least 8 characters
// 5. ✅ **Loading state** - disables button and shows spinner during registration
// 6. ✅ **Error handling** - displays error messages if registration fails
// 7. ✅ **Success redirect** - redirects to login page after successful registration
// 8. ✅ **Email and phone validation** - validates format in real-time

// **File structure should be:**
// ```
