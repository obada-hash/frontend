import { login, register } from '../api/claude_api/auth_api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. UI Setup & Variables ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userTypeSelect = document.getElementById('userType');
    
    // Links to switch forms
    const showRegisterLink = document.querySelector('a[onclick="showForm(\'register\')"]');
    const showLoginLink = document.querySelector('a[onclick="showForm(\'login\')"]');

    // Remove inline onclick handlers to prevent conflicts with Module scope
    if(showRegisterLink) showRegisterLink.removeAttribute('onclick');
    if(showLoginLink) showLoginLink.removeAttribute('onclick');

    // --- 2. UI Functions ---

    // Switch between Login and Register tabs
    function switchForm(target) {
        console.log(`تبديل النموذج إلى: ${target}`);
        
        // Remove active class from forms
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');

        // Remove active class from tabs
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));

        // Activate target
        if (target === 'register') {
            registerForm.classList.add('active');
            // Highlight the register tab if it exists (optional visual sync)
        } else {
            loginForm.classList.add('active');
        }
    }

    // Toggle fields based on User Type (Restaurant vs Charity)
    function toggleRegistrationFields() {
        const type = userTypeSelect.value;
        const restaurantFields = document.getElementById('restaurantFields');
        const charityFields = document.getElementById('charityFields');

        // Hide all first
        restaurantFields.style.display = 'none';
        charityFields.style.display = 'none';
        
        // Remove 'required' from hidden inputs to prevent validation blocking
        setRequired(restaurantFields, false);
        setRequired(charityFields, false);

        if (type === 'restaurant') {
            restaurantFields.style.display = 'block';
            setRequired(restaurantFields, true);
        } else if (type === 'charity') {
            charityFields.style.display = 'block';
            setRequired(charityFields, true);
        }
    }

    // Helper to toggle required attributes
    function setRequired(container, isRequired) {
        container.querySelectorAll('input, select').forEach(input => {
            if (isRequired) input.setAttribute('required', '');
            else input.removeAttribute('required');
        });
    }

    // --- 3. Event Listeners ---

    // Switch Form Clicks
    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); switchForm('register'); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); switchForm('login'); });

    // Dropdown Change
    if (userTypeSelect) {
        userTypeSelect.removeAttribute('onchange'); // Remove inline handler
        userTypeSelect.addEventListener('change', toggleRegistrationFields);
    }

    // --- 4. LOGIN Logic (Using auth.js) ---
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

    // --- 5. REGISTER Logic (Using auth.js) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form Values
            const userType = userTypeSelect.value;
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Specific Values
            const address = document.getElementById('restaurantAddress').value.trim(); // Only for restaurant
            const restaurantType = document.getElementById('restaurantType')?.value || '';
            const charityLicense = document.getElementById('charityLicense')?.value?.trim() || '';
            const charityArea = document.getElementById('charityArea')?.value || '';

            // Validation
            if (!agreeTerms) {
                alert('❌ يجب الموافقة على الشروط والأحكام');
                return;
            }
            if (password !== confirmPassword) {
                alert('❌ كلمة المرور وتأكيدها غير متطابقين');
                return;
            }

            // Prepare Data Structure (Mapping to your Backend DTO)
            const role = (userType === 'restaurant') ? 'HOTEL' : 'CHARITY';

            const userData = {
                email: email,
                password: password,
                role: role,
                contactPhone: phone,
                address: address, // Note: Charities might not have this field in UI, might need to handle null
                
                // Logic from your script: Map 'name' to the correct backend field
                hotelName: (role === 'HOTEL') ? name : null,
                organizationName: (role === 'CHARITY') ? name : null,
                
                registrationNumber: (role === 'CHARITY') ? charityLicense : null,
                
                // Construct description based on selection
                description: (role === 'HOTEL') 
                    ? (restaurantType ? `نوع المطعم: ${restaurantType}` : '') 
                    : (charityArea ? `منطقة العمل: ${charityArea}` : '')
            };

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                // UI Loading
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
                submitBtn.disabled = true;

                // Call auth.js register
                await register(userData);

                alert('✅ تم إنشاء الحساب بنجاح! قم بتسجيل الدخول الآن.');
                
                // Reset and switch to login
                registerForm.reset();
                switchForm('login');

            } catch (error) {
                console.error(error);
                alert('❌ ' + (error.message || 'فشل إنشاء الحساب'));
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});