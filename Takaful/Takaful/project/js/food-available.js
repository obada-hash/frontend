import { getAllAvailableFood, searchFood } from '../api/claude_api/food_api.js';
import { reserveFood as apiReserveFood } from '../api/claude_api/order_api.js';
import { isLoggedIn, getCurrentUser } from '../api/claude_api/auth_api.js';
import { getCharityByUserId } from '../api/claude_api/charity_api.js';

// --- 1. البيانات الافتراضية ---
// هام: جعلناها مصفوفة فارغة تماماً حتى لا تظهر أي بيانات وهمية
let foodItems = [];

// --- 2. تحويل البيانات (Mapping) ---
function mapFoodResponseToUiItem(fr) {
    const status = (fr.status || '').toString().toUpperCase();
    
    // تحويل حالات الباك-إند إلى كلاسات الواجهة
    const mappedStatus =
        status === 'AVAILABLE' ? 'available' :
        status === 'RESERVED' ? 'reserved' :
        status === 'COMPLETED' ? 'delivered' :
        status === 'PICKED_UP' ? 'delivered' :
        status === 'EXPIRED' ? 'expired' :
        status === 'CANCELLED' ? 'expired' :
        'available';

    const until = fr.availableUntil ? new Date(fr.availableUntil) : null;

    return {
        id: fr.id,
        name: fr.title || 'بدون عنوان',
        type: fr.category || (status ? status : '—'), // استخدام الفئة إن وجدت
        quantity: (fr.quantity != null) ? `${fr.quantity} وجبة` : 'غير محدد',
        location: fr.hotelAddress || 'غير محدد',
        restaurant: fr.hotelName || '—',
        restaurantPhone: fr.hotelPhone || '',
        expiry: until ? until.toLocaleString('ar-JO') : 'غير محدد',
        expiryDate: fr.availableUntil || '',
        status: mappedStatus,
        timeLeft: until ? computeTimeLeft(until) : '',
        reservedBy: fr.charityName || ''
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

// --- 3. الوظائف الرئيسية ---

async function loadFoods({ keyword } = {}) {
    const foodList = document.getElementById('foodList');
    const emptyState = document.getElementById('emptyState');
    
    // عرض حالة تحميل (اختياري)
    if (foodList) foodList.innerHTML = '<p style="text-align:center; padding: 20px;">جاري تحميل البيانات...</p>';

    try {
        let data;
        // محاولة جلب البيانات من السيرفر
        if (keyword) {
            data = await searchFood(keyword);
        } else {
            data = await getAllAvailableFood();
        }

        if (Array.isArray(data)) {
            foodItems = data.map(mapFoodResponseToUiItem);
        } else {
            foodItems = [];
        }
        
        console.log(`تم جلب ${foodItems.length} عنصر من قاعدة البيانات`);

    } catch (e) {
        console.error('فشل الاتصال بالسيرفر:', e);
        // في حال الخطأ، نؤكد أن القائمة فارغة ولا نستخدم بيانات وهمية
        foodItems = [];
        if (foodList) foodList.innerHTML = ''; // مسح رسالة التحميل
    } finally {
        updateFilterCounts();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset?.filter || 'all';
        renderFoodCards(activeFilter);
    }
}

// دالة الحجز (Global)
window.handleReserveClick = async function(foodId) {
    if (!isLoggedIn()) {
        alert('⚠️ يجب تسجيل الدخول أولاً لحجز الطعام.');
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    // التحقق من أن المستخدم جمعية خيرية
    const isCharity = user.roles.some(r => r.toUpperCase().includes('CHARITY'));

    if (!isCharity) {
        alert('⛔ عذراً، ميزة الحجز متاحة للجمعيات الخيرية فقط.');
        return;
    }

    const foodItem = foodItems.find(item => item.id === foodId);
    if (!confirm(`هل أنت متأكد من حجز "${foodItem?.name || 'هذه الوجبة'}"؟`)) {
        return;
    }

    try {
        // جلب معرف الجمعية الخاص بالمستخدم الحالي
        const charity = await getCharityByUserId(user.id);
        
        if (!charity || !charity.id) {
            throw new Error('لم يتم العثور على ملف الجمعية لهذا الحساب.');
        }

        const payload = {
            foodId: foodId,
            charityId: charity.id,
            notes: 'تم الحجز عبر الموقع الإلكتروني'
        };

        await apiReserveFood(payload);

        alert('✅ تم الحجز بنجاح!');
        loadFoods(); // تحديث القائمة لإخفاء العنصر أو تغيير حالته

    } catch (error) {
        console.error(error);
        alert('❌ فشل الحجز: ' + (error.message || 'حدث خطأ غير متوقع'));
    }
};

// دالة الاتصال (Global)
window.handleContactClick = function(phoneNumber) {
    if (!phoneNumber) {
        alert('رقم الهاتف غير متوفر');
        return;
    }
    if (confirm(`هل تريد الاتصال بالمطعم على الرقم: ${phoneNumber}؟`)) {
        window.location.href = `tel:${phoneNumber}`;
    }
};

// --- 4. عرض البطاقات (Render) ---

function renderFoodCards(filter = 'all') {
    const foodList = document.getElementById('foodList');
    const emptyState = document.getElementById('emptyState');
    
    let filteredItems = foodItems;
    if (filter !== 'all') {
        filteredItems = foodItems.filter(item => item.status === filter);
    }
    
    // التعامل مع الحالة الفارغة
    if (!foodList || filteredItems.length === 0) {
        if (foodList) foodList.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    let cardsHTML = '';
    
    filteredItems.forEach(item => {
        let statusClass = '';
        let statusText = '';
        let buttonHTML = '';
        
        switch(item.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'متاح للطلب';
                buttonHTML = `
                    <button class="btn-food btn-reserve" onclick="window.handleReserveClick(${item.id})">
                        <i class="fas fa-shopping-cart"></i> حجز الطعام
                    </button>
                    <button class="btn-food btn-cancel" onclick="window.handleContactClick('${item.restaurantPhone}')">
                        <i class="fas fa-phone"></i> اتصل بالمطعم
                    </button>
                `;
                break;
            case 'reserved':
                statusClass = 'status-reserved';
                statusText = item.reservedBy ? `محجوز لـ ${item.reservedBy}` : 'محجوز';
                buttonHTML = `
                    <button class="btn-food btn-disabled" disabled>
                        <i class="fas fa-user-clock"></i> تم الحجز
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
            default:
                statusClass = 'status-available';
                statusText = item.status;
        }
        
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
                            <i class="fas fa-clock"></i>
                            <span><strong>الوقت:</strong> ${item.timeLeft}</span>
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

// --- 5. تهيئة الصفحة ---

document.addEventListener('DOMContentLoaded', function() {
    loadFoods();

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderFoodCards(this.dataset.filter);
        });
    });

    // دالة المساعدة
    window.openHelpModal = function() {
        alert(`🎯 **دليل الحالة:**\n1. متاح: يمكن حجزه.\n2. محجوز: تم حجزه.`);
    };
});

// تحديث تلقائي كل 60 ثانية
setInterval(() => {
    loadFoods();
}, 60000);