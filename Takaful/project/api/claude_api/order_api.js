const API_BASE_URL = 'http://127.0.0.1:8085/api';

// Reserve food (create order)
export async function reserveFood(reservationData) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/reserve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Food reserved:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to reserve food:', error.message);
        throw error;
    }
}

// Get order by ID
export async function getOrderById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get order:', error.message);
        throw error;
    }
}

// Get orders by charity ID
export async function getOrdersByCharityId(charityId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/charity/${charityId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get charity orders:', error.message);
        throw error;
    }
}

// Get orders by charity ID and status
export async function getOrdersByCharityIdAndStatus(charityId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/charity/${charityId}/status/${status}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get charity orders by status:', error.message);
        throw error;
    }
}

// Get upcoming pickups by charity ID
export async function getUpcomingPickupsByCharityId(charityId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/charity/${charityId}/upcoming`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get upcoming pickups:', error.message);
        throw error;
    }
}

// Get orders by hotel ID
export async function getOrdersByHotelId(hotelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/hotel/${hotelId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get hotel orders:', error.message);
        throw error;
    }
}

// Get orders by hotel ID and status
export async function getOrdersByHotelIdAndStatus(hotelId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/hotel/${hotelId}/status/${status}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get hotel orders by status:', error.message);
        throw error;
    }
}

// Get upcoming pickups by hotel ID
export async function getUpcomingPickupsByHotelId(hotelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/hotel/${hotelId}/upcoming`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get upcoming pickups:', error.message);
        throw error;
    }
}

// Update order
export async function updateOrder(id, orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Order updated:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to update order:', error.message);
        throw error;
    }
}

// Mark order as picked up
export async function markAsPickedUp(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/pickup`, {
            method: 'PATCH'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Order marked as picked up:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to mark as picked up:', error.message);
        throw error;
    }
}

// Cancel order
export async function cancelOrder(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Order cancelled:', result.message);
            return true;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to cancel order:', error.message);
        throw error;
    }
}

// Update order status
export async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/status?status=${status}`, {
            method: 'PATCH'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Order status updated:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to update order status:', error.message);
        throw error;
    }
}