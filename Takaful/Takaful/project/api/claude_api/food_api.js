const API_BASE_URL = 'http://127.0.0.1:8085/api';

// Create new food
export async function createFood(hotelId, foodData) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods?hotelId=${hotelId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(foodData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Success:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to create food:', error.message);
        throw error;
    }
}

// Get food by ID
export async function getFoodById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/${id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get food:', error.message);
        throw error;
    }
}

// Get all available food
export async function getAllAvailableFood() {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/available`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get available food:', error.message);
        throw error;
    }
}

// Get recent food
export async function getRecentFood() {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/recent`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get recent food:', error.message);
        throw error;
    }
}

// Get food by hotel ID
export async function getFoodByHotelId(hotelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/hotel/${hotelId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get hotel food:', error.message);
        throw error;
    }
}

// Get food by hotel ID and status
// ... (باقي الدوال الموجودة)

// إضافة دالة لجلب طعام فندق معين حسب الحالة
export async function getFoodByHotelIdAndStatus(hotelId, status) {
    try {
        // Backend Endpoint: /api/foods/hotel/{hotelId}/status/{status}
        const response = await fetch(`${API_BASE_URL}/foods/hotel/${hotelId}/status/${status}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            // في حال لم يكن هناك بيانات أو حدث خطأ بسيط، نرجع مصفوفة فارغة بدلاً من رمي خطأ لعدم كسر الواجهة
            console.warn('No food found or error:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Failed to get food by status:', error.message);
        return [];
    }
}

// Search food
export async function searchFood(keyword) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/search?keyword=${encodeURIComponent(keyword)}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to search food:', error.message);
        throw error;
    }
}

// Update food
export async function updateFood(id, foodData) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(foodData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Food updated:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to update food:', error.message);
        throw error;
    }
}

// Delete food
export async function deleteFood(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Food deleted:', result.message);
            return true;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to delete food:', error.message);
        throw error;
    }
}

// Update food status
export async function updateFoodStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/${id}/status?status=${status}`, {
            method: 'PATCH'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Status updated:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to update status:', error.message);
        throw error;
    }
}