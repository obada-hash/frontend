import { getAllAvailableFood, searchFood, getFoodByHotelIdAndStatus, getFoodById } from '../api/claude_api/food_api.js';
import { reserveFood as apiReserveFood, getOrdersByCharityIdAndStatus, updateOrderStatus } from '../api/claude_api/order_api.js'; // ✅ Added updateOrderStatus
import { isLoggedIn, getCurrentUser } from '../api/claude_api/auth_api.js';
import { getCharityByUserId } from '../api/claude_api/charity_api.js';

let foodItems = [];

// --- 1. Helper Functions (Enrichment Logic - فكرتك الجديدة) ---

/**
 * دالة تقوم بالدوران على قائمة الطلبات، وتجلب تفاصيل الطعام لكل طلب
 * لملء البيانات الناقصة مثل اسم الطعام واسم الفندق.
 */
async function enrichOrdersWithFoodData(orders) {
    if (!orders || orders.length === 0) return [];

    console.log("بدء عملية جلب تفاصيل الطعام للطلبات (Client-side Join)...");
    
    // نستخدم Promise.all لتنفيذ الطلبات بشكل متوازي لزيادة السرعة
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
        try {
            // إذا كان foodId موجوداً، نجلب تفاصيل الطعام
            // ملاحظة: ندعم الأسماء المختلفة للحقول (foodId أو order.food.id)
            const fId = order.foodId || (order.food ? order.food.id : null);
            
            if (fId) {
                const foodDetails = await getFoodById(fId);
                
                // دمج البيانات: نملأ حقول الطلب الفارغة ببيانات الطعام الأصلية
                // Order DTO Fields <--- Food Entity Fields
                order.foodTitle = order.foodTitle || foodDetails.title;
                order.hotelName = order.hotelName || foodDetails.hotelName;
                order.hotelAddress = order.hotelAddress || foodDetails.hotelAddress;
                order.hotelPhone = order.hotelPhone || foodDetails.hotelPhone;
                order.foodQuantity = (order.foodQuantity != null) ? order.foodQuantity : foodDetails.quantity;
                
                // نحتفظ بكائن الطعام كاملاً للاحتياط
                order.fullFoodDetails = foodDetails; 
            }
            return order;
        } catch (err) {
            console.error(`فشل جلب تفاصيل الطعام للطلب رقم ${order.id}:`, err);
            return order; // نعيد الطلب كما هو في حال الفشل
        }
    }));

    console.log("تم تحديث بيانات الطلبات بنجاح.");
    return enrichedOrders;
}

// --- 2. Helper Functions (Dates & Utils) ---

function parseJavaDate(dateVal) {
    if (!dateVal) return null;
    if (Array.isArray(dateVal)) {
        return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
    }
    return new Date(dateVal);
}

function computeTimeLeft(untilDate) {
    if (!untilDate) return '';
    const now = new Date();
    const diffMs = untilDate - now;
    if (diffMs <= 0) return 'انتهت';
    const diffMin = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hours <= 0) return `ينتهي خلال ${mins} دقيقة`;
    return `ينتهي خلال ${hours} ساعة و ${mins} دقيقة`;
}

// --- 3. Mapping Functions ---

function mapFoodResponseToUiItem(fr) {
    const status = (fr.status || fr.foodStatus || '').toString().toUpperCase();
    let uiStatus = 'available';
    if (status === 'RESERVED') uiStatus = 'reserved';
    if (status === 'COMPLETED' || status === 'PICKED_UP') uiStatus = 'delivered';
    if (status === 'EXPIRED' || status === 'CANCELLED') uiStatus = 'expired';

    const until = parseJavaDate(fr.availableUntil || fr.expiryTime);

    return {
        id: fr.id,
        name: fr.title || fr.foodTitle || 'بدون عنوان',
        type: fr.type || fr.foodType || (status ? status : '—'),
        quantity: (fr.quantity != null) ? `${fr.quantity} وجبة` : 'غير محدد',
        location: fr.hotelAddress || fr.address || 'غير محدد',
        restaurant: fr.hotelName || fr.restaurantName || '—',
        restaurantPhone: fr.hotelPhone || fr.contactPhone || '',
        expiry: until ? until.toLocaleString('ar-JO') : 'غير محدد',
        status: uiStatus,
        timeLeft: until ? computeTimeLeft(until) : '',
        reservedBy: fr.charityName || ''
    };
}

function mapOrderResponseToUiItem(order) {
    // الآن البيانات مضمونة الوجود لأننا جلبناها يدوياً في (enrichOrdersWithFoodData)
    
    const timeRef = order.pickupTime || order.requestedAt;
    const until = parseJavaDate(timeRef);
    
    let uiStatus = 'reserved'; 
    const orderStatus = (order.status || '').toUpperCase();
    
    // Match actual enum values (CONFIRMED, PICKED_UP, CANCELLED)
    if (orderStatus === 'PICKED_UP') uiStatus = 'delivered';
    if (orderStatus === 'CANCELLED') uiStatus = 'expired';
    // CONFIRMED stays as 'reserved'

    // ✅ FIXED: Display status in English
    let typeDisplay = 'Reserved';
    if (orderStatus === 'PICKED_UP') typeDisplay = 'Completed';
    if (orderStatus === 'CANCELLED') typeDisplay = 'Cancelled';

    return {
        id: order.foodId || (order.fullFoodDetails ? order.fullFoodDetails.id : null),
        orderId: order.id,  // ✅ Keep the actual order ID for status updates
        name: order.foodTitle || 'جارِ التحميل...',
        type: typeDisplay,  // ✅ FIXED: Show status in English
        quantity: (order.foodQuantity != null) ? `${order.foodQuantity} وجبة` : 'غير محدد',
        location: order.hotelAddress || 'غير محدد',
        restaurant: order.hotelName || '—',
        restaurantPhone: order.hotelPhone || '',
        expiry: until ? until.toLocaleString('ar-JO') : 'غير محدد',
        status: uiStatus,
        timeLeft: until ? computeTimeLeft(until) : '',
        reservedBy: order.charityName || 'جمعيتكم'
    };
}

// --- 4. Main Loading Logic ---

async function loadFoods({ keyword, filterStatus } = {}) {
    const foodList = document.getElementById('foodList');
    
    if (foodList) foodList.innerHTML = '<p style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...</p>';

    try {
        let rawData = [];
        const user = getCurrentUser();
        const activeBtn = document.querySelector('.filter-btn.active');
        const currentFilter = filterStatus || (activeBtn ? activeBtn.dataset.filter : 'all');

        console.log(`Loading data for filter: ${currentFilter}`);

        if (keyword) {
            // البحث (طعام)
            rawData = await searchFood(keyword);
            if (Array.isArray(rawData)) {
                foodItems = rawData.map(mapFoodResponseToUiItem);
            }
        }
        else if (currentFilter === 'available') {
            // ✅ FIXED: متاح - Show only available food (no orders)
            rawData = await getAllAvailableFood();
            if (Array.isArray(rawData)) {
                foodItems = rawData.map(mapFoodResponseToUiItem);
            }
        }
        else if (currentFilter === 'reserved') {
            // المحجوز
            if (isLoggedIn() && isHotel(user)) {
                rawData = await getFoodByHotelIdAndStatus(user.id, 'RESERVED');
                foodItems = rawData.map(mapFoodResponseToUiItem);
            } else if (isLoggedIn() && isCharity(user)) {
                try {
                    const charity = await getCharityByUserId(user.id);
                    
                    // Check if charity data exists
                    if (!charity || !charity.id) {
                        console.error('Charity data not found for user:', user.id);
                        foodItems = [];
                    } else {
                        console.log('Fetching orders for charity ID:', charity.id);
                        
                        // Use 'CONFIRMED' status for reserved orders
                        let orders = await getOrdersByCharityIdAndStatus(charity.id, 'CONFIRMED');
                        
                        // Validate orders array
                        if (!Array.isArray(orders)) {
                            console.warn('Orders response is not an array:', orders);
                            orders = [];
                        }
                        
                        // Enrich orders with food data
                        orders = await enrichOrdersWithFoodData(orders);
                        
                        // Map to UI items
                        foodItems = orders.map(mapOrderResponseToUiItem);
                    }
                } catch (charityError) {
                    console.error('Error loading charity orders:', charityError);
                    foodItems = [];
                }
            } else {
                foodItems = [];
            }
        } 
        else if (currentFilter === 'delivered') {
            // المكتمل
            if (isLoggedIn() && isHotel(user)) {
                rawData = await getFoodByHotelIdAndStatus(user.id, 'COMPLETED');
                foodItems = rawData.map(mapFoodResponseToUiItem);
            } else if (isLoggedIn() && isCharity(user)) {
                try {
                    const charity = await getCharityByUserId(user.id);
                    
                    // Check if charity data exists
                    if (!charity || !charity.id) {
                        console.error('Charity data not found for user:', user.id);
                        foodItems = [];
                    } else {
                        console.log('Fetching completed orders for charity ID:', charity.id);
                        
                        // Use 'PICKED_UP' status for delivered orders
                        let orders = await getOrdersByCharityIdAndStatus(charity.id, 'PICKED_UP');
                        
                        // Validate orders array
                        if (!Array.isArray(orders)) {
                            console.warn('Orders response is not an array:', orders);
                            orders = [];
                        }
                        
                        // Enrich orders with food data
                        orders = await enrichOrdersWithFoodData(orders);
                        
                        // Map to UI items
                        foodItems = orders.map(mapOrderResponseToUiItem);
                    }
                } catch (charityError) {
                    console.error('Error loading completed orders:', charityError);
                    foodItems = [];
                }
            } else {
                foodItems = [];
            }
        } 
        else {
            // ✅ FIXED: الكل (Show ALL food items for charities, not just available)
            if (isLoggedIn() && isCharity(user)) {
                try {
                    const charity = await getCharityByUserId(user.id);
                    
                    if (!charity || !charity.id) {
                        console.error('Charity data not found for user:', user.id);
                        // Still show available food even if charity not found
                        rawData = await getAllAvailableFood();
                        if (Array.isArray(rawData)) {
                            foodItems = rawData.map(mapFoodResponseToUiItem);
                        }
                    } else {
                        // Get ALL orders (confirmed, picked_up, cancelled)
                        const confirmedOrders = await getOrdersByCharityIdAndStatus(charity.id, 'CONFIRMED').catch(() => []);
                        const pickedUpOrders = await getOrdersByCharityIdAndStatus(charity.id, 'PICKED_UP').catch(() => []);
                        const cancelledOrders = await getOrdersByCharityIdAndStatus(charity.id, 'CANCELLED').catch(() => []);
                        
                        // Combine all orders
                        let allOrders = [
                            ...(Array.isArray(confirmedOrders) ? confirmedOrders : []),
                            ...(Array.isArray(pickedUpOrders) ? pickedUpOrders : []),
                            ...(Array.isArray(cancelledOrders) ? cancelledOrders : [])
                        ];
                        
                        // Enrich with food data
                        allOrders = await enrichOrdersWithFoodData(allOrders);
                        
                        // Get available food
                        const availableFood = await getAllAvailableFood();
                        
                        // Combine orders and available food
                        const orderItems = allOrders.map(mapOrderResponseToUiItem);
                        const availableItems = (Array.isArray(availableFood) ? availableFood : []).map(mapFoodResponseToUiItem);
                        
                        foodItems = [...orderItems, ...availableItems];
                    }
                } catch (error) {
                    console.error('Error loading all food for charity:', error);
                    // Fallback to just available food
                    rawData = await getAllAvailableFood();
                    if (Array.isArray(rawData)) {
                        foodItems = rawData.map(mapFoodResponseToUiItem);
                    }
                }
            } else {
                // For non-charity users (hotels, guests), show only available food
                rawData = await getAllAvailableFood();
                if (Array.isArray(rawData)) {
                    foodItems = rawData.map(mapFoodResponseToUiItem);
                }
            }
        }
        
        console.log(`Loaded ${foodItems.length} items.`);

    } catch (e) {
        console.error('Error loading data:', e);
        foodItems = [];
        if (foodList) foodList.innerHTML = `<p style="text-align:center; color:red;">حدث خطأ: ${e.message}</p>`;
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
        loadFoods(); 
    } catch (error) {
        alert('❌ فشل الحجز: ' + error.message);
    }
};

// ✅ NEW: Handle marking order as picked up
window.handleMarkPickedUp = async function(orderId) {
    if (!isLoggedIn()) {
        alert('⚠️ يجب تسجيل الدخول أولاً.');
        return;
    }
    
    const user = getCurrentUser();
    if (!isCharity(user)) {
        alert('⛔ هذا الإجراء متاح للجمعيات الخيرية فقط.');
        return;
    }

    if (!confirm('هل تأكد من استلام هذه الوجبة؟\nسيتم تحديث حالة الطلب إلى "تم الاستلام".')) {
        return;
    }

    try {
        console.log(`Marking order ${orderId} as PICKED_UP...`);
        
        // Call the API to update order status
        await updateOrderStatus(orderId, 'PICKED_UP');
        
        alert('✅ تم تأكيد الاستلام بنجاح!');
        
        // Reload the food list to reflect the changes
        loadFoods();
        
    } catch (error) {
        console.error('Error marking order as picked up:', error);
        alert('❌ فشل تحديث حالة الطلب: ' + error.message);
    }
};

window.handleContactClick = function(phoneNumber) {
    if (!phoneNumber || phoneNumber === 'undefined' || phoneNumber === 'null') {
        alert('رقم الهاتف غير متوفر');
    } else {
        window.location.href = `tel:${phoneNumber}`;
    }
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
    
    const user = getCurrentUser();
    const userIsCharity = isCharity(user);
    
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
                
                // ✅ NEW: Show "Mark as Picked Up" button for charities
                if (userIsCharity && item.orderId) {
                    buttonHTML = `
                        <button class="btn-food btn-reserve" onclick="window.handleMarkPickedUp(${item.orderId})" style="background: #28a745;">
                            <i class="fas fa-check-circle"></i> تأكيد الاستلام
                        </button>
                        <button class="btn-food btn-cancel" onclick="window.handleContactClick('${item.restaurantPhone}')">
                            <i class="fas fa-phone"></i> تواصل مع المطعم
                        </button>`;
                } else {
                    buttonHTML = `
                        <button class="btn-food btn-disabled" disabled>
                            <i class="fas fa-clock"></i> بانتظار الاستلام
                        </button>
                        <button class="btn-food btn-cancel" onclick="window.handleContactClick('${item.restaurantPhone}')">
                            <i class="fas fa-phone"></i> تواصل مع المطعم
                        </button>`;
                }
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
        
        const displayName = (item.name && item.name !== 'undefined') ? item.name : 'بيانات غير متوفرة';
        const displayRest = (item.restaurant && item.restaurant !== 'undefined') ? item.restaurant : 'غير محدد';
        const displayPhone = (item.restaurantPhone && item.restaurantPhone !== 'undefined') ? item.restaurantPhone : '—';

        cardsHTML += `
            <div class="food-card">
                <div class="food-status ${statusClass}">
                    <span>${statusText}</span>
                    <span class="food-type">${item.type}</span>
                </div>
                <div class="food-details">
                    <div class="food-title"><h3>${displayName}</h3></div>
                    <div class="food-info">
                        <div class="food-info-item"><i class="fas fa-weight"></i> <span><strong>الكمية:</strong> ${item.quantity}</span></div>
                        <div class="food-info-item"><i class="fas fa-store"></i> <span><strong>المطعم:</strong> ${displayRest}</span></div>
                        <div class="food-info-item"><i class="fas fa-phone"></i> <span><strong>الهاتف:</strong> ${displayPhone}</span></div>
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
            const filterType = this.dataset.filter;
            loadFoods({ filterStatus: filterType });
        });
    });
}); 