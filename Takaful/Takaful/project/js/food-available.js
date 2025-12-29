import { getAllAvailableFood, searchFood, getFoodByHotelIdAndStatus } from '../api/claude_api/food_api.js';
import { reserveFood as apiReserveFood, getOrdersByCharityIdAndStatus } from '../api/claude_api/order_api.js';
import { isLoggedIn, getCurrentUser } from '../api/claude_api/auth_api.js';
import { getCharityByUserId } from '../api/claude_api/charity_api.js';

let foodItems = [];

// --- 1. Mapping Functions ---

// تحويل استجابة الطعام (FoodResponse) إلى شكل البطاقة
function mapFoodResponseToUiItem(fr) {
    const status = (fr.status || '').toString().toUpperCase();
    let uiStatus = 'available';
    if (status === 'RESERVED') uiStatus = 'reserved';
    if (status === 'COMPLETED' || status === 'PICKED_UP') uiStatus = 'delivered';
    if (status === 'EXPIRED' || status === 'CANCELLED') uiStatus = 'expired';

    const until = fr.availableUntil ? new Date(fr.availableUntil) : null;

    return {
        id: fr.id,
        name: fr.title || 'بدون عنوان',
        type: fr.type || (status ? status : '—'),
        quantity: (fr.quantity != null) ? `${fr.quantity} وجبة` : 'غير محدد',
        location: fr.hotelAddress || 'غير محدد',
        restaurant: fr.hotelName || '—',
        restaurantPhone: fr.hotelPhone || '',
        expiry: until ? until.toLocaleString('ar-JO') : 'غير محدد',
        status: uiStatus,
        timeLeft: until ? computeTimeLeft(until) : '',
        reservedBy: fr.charityName || ''
    };
}

// تحويل استجابة الطلب (OrderResponse) إلى شكل البطاقة (للجمعيات)
function mapOrderResponseToUiItem(order) {
    // نفترض أن OrderResponse يحتوي على كائن food بداخله
    // إذا كان الهيكل مختلفاً، يجب تعديل هذا الجزء
    const food = order.food || {}; 
    const until = food.availableUntil ? new Date(food.availableUntil) : null;
    
    // تحويل حالة الطلب إلى حالة الواجهة
    let uiStatus = 'reserved'; // الافتراضي للطلبات هو محجوز
    const orderStatus = (order.status || '').toUpperCase();
    if (orderStatus === 'COMPLETED' || orderStatus === 'PICKED_UP') uiStatus = 'delivered';
    if (orderStatus === 'CANCELLED') uiStatus = 'expired';

    return {
        id: food.id, // نستخدم رقم الطعام للعمليات
        orderId: order.id, // نحتفظ برقم الطلب أيضاً
        name: food.title || 'طلب بدون عنوان',
        type: food.type || 'طلب',
        quantity: (food.quantity != null) ? `${food.quantity} وجبة` : 'غير محدد',
        location: food.hotelAddress || 'غير محدد',
        restaurant: food.hotelName || '—',
        restaurantPhone: food.hotelPhone || '',
        expiry: until ? until.toLocaleString('ar-JO') : 'غير محدد',
        status: uiStatus,
        timeLeft: until ? computeTimeLeft(until) : '',
        reservedBy: 'جمعيتكم' // بما أننا نعرض طلبات الجمعية نفسها
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

// --- 2. Main Loading Logic ---

async function loadFoods({ keyword, filterStatus } = {}) {
    const foodList = document.getElementById('foodList');
    
    if (foodList) foodList.innerHTML = '<p style="text-align:center; padding: 20px;">جاري تحميل البيانات...</p>';

    try {
        let data = [];
        const user = getCurrentUser();
        const activeBtn = document.querySelector('.filter-btn.active');
        const currentFilter = filterStatus || (activeBtn ? activeBtn.dataset.filter : 'all');

        console.log('Loading for filter:', currentFilter);

        if (keyword) {
            // 1. البحث (متاح للجميع)
            const foods = await searchFood(keyword);
            if (Array.isArray(foods)) {
                foodItems = foods.map(mapFoodResponseToUiItem);
            }
        } 
        else if (currentFilter === 'reserved') {
            // 2. الفلتر "محجوز"
            if (isLoggedIn() && isHotel(user)) {
                // الفندق يرى طعامه المحجوز
                const foods = await getFoodByHotelIdAndStatus(user.id, 'RESERVED');
                foodItems = foods.map(mapFoodResponseToUiItem);
            } else if (isLoggedIn() && isCharity(user)) {
                // الجمعية ترى طلباتها (PENDING عادة تعني محجوز بانتظار الاستلام)
                const charity = await getCharityByUserId(user.id);
                const orders = await getOrdersByCharityIdAndStatus(charity.id, 'PENDING'); 
                foodItems = orders.map(mapOrderResponseToUiItem);
            } else {
                foodItems = [];
            }
        } 
        else if (currentFilter === 'delivered') {
            // 3. الفلتر "مكتمل/تم التوزيع"
            if (isLoggedIn() && isHotel(user)) {
                // الفندق يرى طعامه المكتمل
                const foods = await getFoodByHotelIdAndStatus(user.id, 'COMPLETED');
                foodItems = foods.map(mapFoodResponseToUiItem);
            } else if (isLoggedIn() && isCharity(user)) {
                // الجمعية ترى طلباتها المكتملة
                const charity = await getCharityByUserId(user.id);
                // قد تكون الحالة COMPLETED أو PICKED_UP حسب الباك إند
                const orders = await getOrdersByCharityIdAndStatus(charity.id, 'COMPLETED');
                foodItems = orders.map(mapOrderResponseToUiItem);
            } else {
                foodItems = [];
            }
        } 
        else {
            // 4. الفلتر "الكل/متاح" (الوضع الافتراضي)
            const foods = await getAllAvailableFood();
            if (Array.isArray(foods)) {
                foodItems = foods.map(mapFoodResponseToUiItem);
            }
        }
        
        console.log(`تم جلب ${foodItems.length} عنصر.`);

    } catch (e) {
        console.error('Error loading data:', e);
        foodItems = [];
        if (foodList) foodList.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ أثناء جلب البيانات</p>';
    } finally {
        updateFilterCounts();
        renderFoodCards();
    }
}

// Helpers
function isHotel(user) {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.toUpperCase().includes('HOTEL'));
}

function isCharity(user) {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.toUpperCase().includes('CHARITY'));
}

// --- Global Actions ---

window.handleReserveClick = async function(foodId) {
    if (!isLoggedIn()) {
        alert('⚠️ يجب تسجيل الدخول أولاً.');
        window.location.href = 'login.html';
        return;
    }
    const user = getCurrentUser();
    if (!isCharity(user)) {
        alert('⛔ الحجز متاح للجمعيات الخيرية فقط.');
        return;
    }

    if (!confirm('تأكيد حجز هذه الوجبة؟')) return;

    try {
        const charity = await getCharityByUserId(user.id);
        await apiReserveFood({
            foodId: foodId,
            charityId: charity.id,
            notes: 'حجز عبر الموقع'
        });
        alert('✅ تم الحجز بنجاح!');
        // إعادة تحميل الصفحة لتحديث القوائم
        loadFoods(); 
    } catch (error) {
        alert('❌ فشل الحجز: ' + error.message);
    }
};

window.handleContactClick = function(phoneNumber) {
    if (!phoneNumber) alert('رقم الهاتف غير متوفر');
    else window.location.href = `tel:${phoneNumber}`;
};

// --- Rendering ---

function renderFoodCards() {
    const foodList = document.getElementById('foodList');
    const emptyState = document.getElementById('emptyState');
    
    if (!foodList || foodItems.length === 0) {
        if (foodList) foodList.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    let cardsHTML = '';
    
    foodItems.forEach(item => {
        let statusClass = '', statusText = '', buttonHTML = '';
        
        switch(item.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'متاح للطلب';
                buttonHTML = `
                    <button class="btn-food btn-reserve" onclick="window.handleReserveClick(${item.id})">
                        <i class="fas fa-shopping-cart"></i> حجز
                    </button>
                    <button class="btn-food btn-cancel" onclick="window.handleContactClick('${item.restaurantPhone}')">
                        <i class="fas fa-phone"></i> اتصال
                    </button>`;
                break;
            case 'reserved':
                statusClass = 'status-reserved';
                statusText = 'محجوز (قيد الانتظار)';
                buttonHTML = `
                    <button class="btn-food btn-disabled" disabled>
                        <i class="fas fa-clock"></i> بانتظار الاستلام
                    </button>
                    <button class="btn-food btn-cancel" onclick="window.handleContactClick('${item.restaurantPhone}')">
                        <i class="fas fa-phone"></i> تواصل مع المطعم
                    </button>`;
                break;
            case 'delivered':
                statusClass = 'status-delivered';
                statusText = 'مكتمل';
                buttonHTML = `
                    <button class="btn-food btn-disabled" disabled>
                        <i class="fas fa-check-circle"></i> تم الاستلام
                    </button>`;
                break;
            default:
                statusClass = 'status-expired';
                statusText = item.status;
        }
        
        cardsHTML += `
            <div class="food-card">
                <div class="food-status ${statusClass}">
                    <span>${statusText}</span>
                    <span class="food-type">${item.type}</span>
                </div>
                <div class="food-details">
                    <div class="food-title"><h3>${item.name}</h3></div>
                    <div class="food-info">
                        <div class="food-info-item"><i class="fas fa-weight"></i> <span><strong>الكمية:</strong> ${item.quantity}</span></div>
                        <div class="food-info-item"><i class="fas fa-store"></i> <span><strong>المطعم:</strong> ${item.restaurant}</span></div>
                        <div class="food-info-item"><i class="fas fa-clock"></i> <span><strong>الوقت:</strong> ${item.timeLeft}</span></div>
                    </div>
                </div>
                <div class="food-actions">${buttonHTML}</div>
            </div>
        `;
    });
    
    foodList.innerHTML = cardsHTML;
}

function updateFilterCounts() {
    const activeBtn = document.querySelector('.filter-btn.active');
    if(activeBtn) {
        const countSpan = activeBtn.querySelector('.filter-count');
        if(countSpan) countSpan.textContent = foodItems.length;
    }
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', function() {
    loadFoods();

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filterType = this.dataset.filter; // 'all', 'reserved', 'delivered'
            loadFoods({ filterStatus: filterType });
        });
    });
});