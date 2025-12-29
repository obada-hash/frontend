// food-available.js
// الجافاسكريبت الخاص بصفحة الطعام المتاح

// بيانات افتراضية (Fallback) للطعام - تُستخدم فقط إذا فشل الاتصال بالخادم
let foodItems = [
    {
        id: 1,
        name: "وجبات معكرونة باللحم",
        type: "أطباق رئيسية",
        quantity: "50 وجبة",
        location: "اربد",
        restaurant: "مطعم الإخوة",
        expiry: "ينتهي اليوم",
        expiryDate: "2023-12-20",
        status: "available",
        timeLeft: "ينتهي خلال 4 ساعات",
        restaurantPhone: "0777777777"
    },
    {
        id: 2,
        name: "ساندويشات دجاج مشوي",
        type: "وجبات سريعة",
        quantity: "30 ساندويش",
        location: "عمان",
        restaurant: "مطعم الوجبات السريعة",
        expiry: "ينتهي غداً",
        expiryDate: "2023-12-21",
        status: "available",
        timeLeft: "ينتهي خلال 28 ساعة",
        restaurantPhone: "0777777777"
    },
    {
        id: 3,
        name: "كيك الشوكولاتة",
        type: "حلويات",
        quantity: "15 قطعة",
        location: " الزرقاء",
        restaurant: "مخبز الحلواني",
        expiry: "ينتهي 23/12",
        expiryDate: "2023-12-23",
        status: "reserved",
        reservedBy: "جمعية الرحمة",
        timeLeft: "محجوز",
        restaurantPhone: "0777777777"
    },
    {
        id: 4,
        name: "سلطات طازجة",
        type: "أطباق صحية",
        quantity: "40 علبة",
        location: "عمان",
        restaurant: "مطعم الصحة",
        expiry: "منتهي",
        expiryDate: "2023-12-18",
        status: "expired",
        timeLeft: "منتهي الصلاحية",
        restaurantPhone: "0777777777"
    },
    {
        id: 5,
        name: "أرز بسمتي مع دجاج",
        type: "أطباق رئيسية",
        quantity: "25 طبق",
        location: "العقبة",
        restaurant: "مطعم الأصايل",
        expiry: "ينتهي 22/12",
        expiryDate: "2023-12-22",
        status: "available",
        timeLeft: "ينتهي خلال يومين",
        restaurantPhone: "0777777777"
    },
    {
        id: 6,
        name: "فطائر الجبنة",
        type: "مخبوزات",
        quantity: "60 قطعة",
        location: "عمان -الجاردنز",
        restaurant: "مخبز الفرسان",
        expiry: "تم التوزيع",
        expiryDate: "2023-12-19",
        status: "delivered",
        timeLeft: "وصل للمستفيدين",
        restaurantPhone: "0777777777"
    },
    {
        id: 7,
        name: "عصائر طازجة",
        type: "مشروبات",
        quantity: "35 كوب",
        location: "البحر الميت ",
        restaurant: "مقهى العصائر",
        expiry: "ينتهي اليوم",
        expiryDate: "2023-12-20",
        status: "available",
        timeLeft: "ينتهي خلال 6 ساعات",
        restaurantPhone: "0777777777"
    },
    {
        id: 8,
        name: "مقبلات متنوعة",
        type: "مقبلات",
        quantity: "45 طبق",
        location:" عمان",
        restaurant: "مطعرالضيافة",
        expiry: "محجوز",
        expiryDate: "2023-12-24",
        status: "reserved",
        reservedBy: "جمعية البر",
        timeLeft: "محجوز للاستلام",
        restaurantPhone: "0777777777"
    }
];

// ===================== ربط الواجهة مع Spring Boot API =====================

// احفظ بيانات الدخول (JWT) إن وُجدت
function getAuth() {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    return { token, userId, roles };
}

function authHeaders() {
    const { token } = getAuth();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// تحويل FoodResponse القادم من الخادم لشكل يناسب واجهة البطاقات الحالية
function mapFoodResponseToUiItem(fr) {
    const status = (fr.status || '').toString().toUpperCase();
    const mappedStatus =
        status === 'AVAILABLE' ? 'available' :
        status === 'RESERVED' ? 'reserved' :
        status === 'COMPLETED' ? 'delivered' :
        status === 'EXPIRED' ? 'expired' :
        status === 'CANCELLED' ? 'expired' :
        'available';

    const until = fr.availableUntil ? new Date(fr.availableUntil) : null;

    return {
        id: fr.id,
        name: fr.title || 'بدون عنوان',
        type: status ? status : '—',
        quantity: (fr.quantity != null) ? `${fr.quantity} وجبة` : 'غير محدد',
        location: fr.hotelAddress || 'غير محدد',
        restaurant: fr.hotelName || '—',
        restaurantPhone: fr.hotelPhone || '',
        expiry: until ? until.toLocaleString('ar-JO') : 'غير محدد',
        expiryDate: fr.availableUntil || '',
        status: mappedStatus,
        timeLeft: until ? computeTimeLeft(until) : ''
    };
}

function computeTimeLeft(untilDate) {
    const now = new Date();
    const diffMs = untilDate - now;
    if (diffMs <= 0) return 'انتهت';
    const diffMin = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hours <= 0) return `ينتهي خلال ${mins} دقيقة`;
    return `ينتهي خلال ${hours} ساعة و ${mins} دقيقة`;
}

async function fetchAvailableFoods() {
    const res = await fetch('/api/foods/available');
    if (!res.ok) throw new Error('فشل جلب الطعام المتاح');
    const json = await res.json(); // ApiResponse
    return (json && json.data) ? json.data : [];
}

async function searchFoods(keyword) {
    const url = `/api/foods/search?keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل البحث عن الطعام');
    const json = await res.json(); // ApiResponse
    return (json && json.data) ? json.data : [];
}

async function loadFoods({ keyword } = {}) {
    try {
        const data = keyword ? await searchFoods(keyword) : await fetchAvailableFoods();
        foodItems = data.map(mapFoodResponseToUiItem);
    } catch (e) {
        console.warn('⚠️ لم يتم الاتصال بالخادم، سيتم استخدام البيانات الافتراضية.', e);
        // احتفظ بالـ foodItems الافتراضية كما هي
    } finally {
        updateFilterCounts();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset?.filter || 'all';
        renderFoodCards(activeFilter);
    }
}

// الحصول على Charity ID بناءً على userId (لعمليات الحجز)
async function getCharityIdForUser(userId) {
    const res = await fetch(`/api/charities/user/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('لم يتم العثور على بيانات الجمعية لهذا المستخدم');
    const json = await res.json(); // ApiResponse<CharityResponse>
    return json?.data?.id;
}

// إرسال طلب حجز للطعام (يتطلب تسجيل دخول كـ CHARITY)
async function reserveFoodViaApi(foodId) {
    const { token, userId, roles } = getAuth();

    if (!token || !userId) {
        alert('لازم تسجّل دخول أولاً.');
        window.location.href = 'login.html';
        return;
    }
    if (!roles.some(r => r.toUpperCase().includes('CHARITY'))) {
        alert('ميزة الحجز متاحة للجمعيات فقط.');
        return;
    }

    const charityId = await getCharityIdForUser(userId);

    const payload = { foodId, charityId, notes: 'تم الإرسال من واجهة الويب' };

    const res = await fetch('/api/orders/reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = json?.message || 'فشل الحجز';
        throw new Error(msg);
    }
    return json;
}


// دالة لعرض البطاقات
function renderFoodCards(filter = 'all') {
    const foodList = document.getElementById('foodList');
    const emptyState = document.getElementById('emptyState');
    
    // تصفية العناصر
    let filteredItems = foodItems;
    if (filter !== 'all') {
        filteredItems = foodItems.filter(item => item.status === filter);
    }
    
    // إذا ما في عناصر
    if (filteredItems.length === 0) {
        foodList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // إنشاء البطاقات
    let cardsHTML = '';
    
    filteredItems.forEach(item => {
        let statusClass = '';
        let statusText = '';
        let buttonHTML = '';
        
        // تحديد اللون والنص حسب الحالة
        switch(item.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'متاح للطلب';
                buttonHTML = `
                    <button class="btn-food btn-reserve" onclick="reserveFood(${item.id})">
                        <i class="fas fa-shopping-cart"></i> حجز الطعام
                    </button>
                    <button class="btn-food btn-cancel" onclick="contactRestaurant('${item.restaurantPhone}')">
                        <i class="fas fa-phone"></i> اتصل بالمطعم
                    </button>
                `;
                break;
            case 'reserved':
                statusClass = 'status-reserved';
                statusText = `محجوز - ${item.reservedBy}`;
                buttonHTML = `
                    <button class="btn-food btn-disabled" disabled>
                        <i class="fas fa-user-clock"></i> محجوز حالياً
                    </button>
                `;
                break;
            case 'expired':
                statusClass = 'status-expired';
                statusText = 'منتهي الصلاحية';
                buttonHTML = `
                    <button class="btn-food btn-disabled" disabled>
                        <i class="fas fa-exclamation-triangle"></i> غير متاح
                    </button>
                `;
                break;
            case 'delivered':
                statusClass = 'status-delivered';
                statusText = 'تم التوزيع';
                buttonHTML = `
                    <button class="btn-food btn-disabled" disabled>
                        <i class="fas fa-check-circle"></i> تم التوصيل
                    </button>
                `;
                break;
        }
        
        // إنشاء بطاقة الطعام
        cardsHTML += `
            <div class="food-card" data-status="${item.status}">
                <div class="food-status ${statusClass}">
                    <span>${statusText}</span>
                    <span class="food-type">${item.type}</span>
                </div>
                
                <div class="food-details">
                    <div class="food-title">
                        <h3>${item.name}</h3>
                    </div>
                    
                    <div class="food-info">
                        <div class="food-info-item">
                            <i class="fas fa-weight"></i>
                            <span><strong>الكمية:</strong> ${item.quantity}</span>
                        </div>
                        <div class="food-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>الموقع:</strong> ${item.location}</span>
                        </div>
                        <div class="food-info-item">
                            <i class="fas fa-store"></i>
                            <span><strong>المطعم:</strong> ${item.restaurant}</span>
                        </div>
                        <div class="food-info-item">
                            <i class="fas fa-phone"></i>
                            <span><strong>الهاتف:</strong> ${item.restaurantPhone}</span>
                        </div>
                    </div>
                    
                    <div class="food-expiry ${item.status === 'expired' ? 'expiry-warning' : ''}">
                        <div class="expiry-text">
                            <i class="fas fa-clock"></i>
                            <span><strong>الحالة:</strong> ${item.expiry} - ${item.timeLeft}</span>
                        </div>
                    </div>
                </div>
                
                <div class="food-actions">
                    ${buttonHTML}
                </div>
            </div>
        `;
    });
    
    foodList.innerHTML = cardsHTML;
}

// دالة حجز الطعام
function reserveFood(foodId) {
    const foodItem = foodItems.find(item => item.id === foodId);
    if (!foodItem) return;

    const userConfirmed = confirm(`هل تريد حجز "${foodItem.name}"؟

سيتم إرسال طلب الحجز للجمعية عبر الخادم.`);
    if (!userConfirmed) return;

    reserveFoodViaApi(foodId)
        .then(() => {
            alert(`تم إرسال طلب حجز "${foodItem.name}" بنجاح!`);
            // إعادة تحميل البيانات من الخادم لتحديث الحالات
            loadFoods();
        })
        .catch(err => {
            alert(err.message || 'حدث خطأ أثناء الحجز');
        });
}

// دالة الاتصال بالمطعم
function contactRestaurant(phoneNumber) {
    const callConfirmed = confirm(`هل تريد الاتصال بالمطعم على الرقم:\n\n${phoneNumber}؟`);
    
    if (callConfirmed) {
        window.location.href = `tel:${phoneNumber}`;
    }
}

// دالة لتحديث أعداد التصفية
function updateFilterCounts() {
    const filters = ['all', 'available', 'reserved', 'expired', 'delivered'];
    
    filters.forEach(filter => {
        const countElement = document.querySelector(`[data-filter="${filter}"] .filter-count`);
        if (countElement) {
            let count = 0;
            
            if (filter === 'all') {
                count = foodItems.length;
            } else {
                count = foodItems.filter(item => item.status === filter).length;
            }
            
            countElement.textContent = count;
        }
    });
}

// دالة لفتح نافذة المساعدة
function openHelpModal() {
    alert(`🎯 **كيف تستخدم الصفحة:**\n
1. استخدم أزرار التصفية لعرض أنواع الطعام المختلفة
2. الطعام "المتاح" يمكن حجزه مباشرة
3. الطعام "المحجوز" تم حجزه من جمعية أخرى
4. الطعام "المنتهي" تجاوز تاريخ الصلاحية
5. "تم التوزيع" وصل للمستفيدين بنجاح\n
📞 للاستفسارات: 0500000000`);
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات من Spring Boot
    loadFoods();
// عرض البطاقات
    renderFoodCards('all');
    updateFilterCounts();
    
    // إضافة حدث النقر لأزرار التصفية
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة النشط من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة النشط للزر المضغوط
            this.classList.add('active');
            
            // عرض البطاقات حسب التصفية
            const filter = this.dataset.filter;
            renderFoodCards(filter);
        });
    });
    
    // إضافة رسالة ترحيب
    console.log('🚀 صفحة الطعام المتاح جاهزة!');
});

// محاكاة تحديث تلقائي للبيانات كل 30 ثانية
setInterval(() => {
    console.log('🔄 تحديث البيانات...');
    updateFilterCounts();
}, 30000);