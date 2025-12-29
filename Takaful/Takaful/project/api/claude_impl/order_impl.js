import {
    reserveFood,
    getOrderById,
    getOrdersByCharityId,
    getOrdersByCharityIdAndStatus,
    getUpcomingPickupsByCharityId,
    getOrdersByHotelId,
    getOrdersByHotelIdAndStatus,
    getUpcomingPickupsByHotelId,
    updateOrder,
    markAsPickedUp,
    cancelOrder,
    updateOrderStatus
} from '../claude_api/order_api.JS';

// ============================================
// 1. RESERVE FOOD (CREATE ORDER)
// ============================================
export async function exampleReserveFood() {
    const reservationData = {
        foodId: 1,
        charityId: 1,
        notes: "Will pick up at 6 PM. Please have it ready at the front desk."
    };
    
    try {
        const order = await reserveFood(reservationData);
        console.log('Food reserved successfully:', order);
        console.log('Order ID:', order.id);
        console.log('Status:', order.status);
        console.log('Pickup time:', order.pickupTime);
        return order;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 2. GET ORDER BY ID
// ============================================
export async function exampleGetOrderById() {
    try {
        const order = await getOrderById(1);
        console.log('Order details:', order);
        console.log('Food:', order.foodTitle);
        console.log('Charity:', order.charityName);
        console.log('Status:', order.status);
        return order;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 3. GET ORDERS BY CHARITY ID
// ============================================
export async function exampleGetOrdersByCharityId() {
    try {
        const orders = await getOrdersByCharityId(1);
        console.log('Charity orders:', orders);
        console.log(`Total orders: ${orders.length}`);
        
        orders.forEach(order => {
            console.log(`- Order #${order.id}: ${order.foodTitle} (${order.status})`);
        });
        
        return orders;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 4. GET ORDERS BY CHARITY ID AND STATUS
// ============================================
export async function exampleGetOrdersByCharityIdAndStatus() {
    try {
        // Status options: PENDING, CONFIRMED, PICKED_UP, CANCELLED
        const orders = await getOrdersByCharityIdAndStatus(1, 'PENDING');
        console.log('Pending charity orders:', orders);
        console.log(`Total pending: ${orders.length}`);
        return orders;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 5. GET UPCOMING PICKUPS BY CHARITY ID
// ============================================
export async function exampleGetUpcomingPickupsByCharityId() {
    try {
        const orders = await getUpcomingPickupsByCharityId(1);
        console.log('Upcoming pickups for charity:', orders);
        
        orders.forEach(order => {
            console.log(`\nPickup #${order.id}:`);
            console.log(`  Food: ${order.foodTitle}`);
            console.log(`  Time: ${order.pickupTime}`);
            console.log(`  Hotel: ${order.hotelName}`);
        });
        
        return orders;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 6. GET ORDERS BY HOTEL ID
// ============================================
export async function exampleGetOrdersByHotelId() {
    try {
        const orders = await getOrdersByHotelId(1);
        console.log('Hotel orders:', orders);
        console.log(`Total orders: ${orders.length}`);
        
        orders.forEach(order => {
            console.log(`- Order #${order.id}: ${order.foodTitle} for ${order.charityName} (${order.status})`);
        });
        
        return orders;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 7. GET ORDERS BY HOTEL ID AND STATUS
// ============================================
export async function exampleGetOrdersByHotelIdAndStatus() {
    try {
        // Status options: PENDING, CONFIRMED, PICKED_UP, CANCELLED
        const orders = await getOrdersByHotelIdAndStatus(1, 'CONFIRMED');
        console.log('Confirmed hotel orders:', orders);
        console.log(`Total confirmed: ${orders.length}`);
        return orders;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 8. GET UPCOMING PICKUPS BY HOTEL ID
// ============================================
export async function exampleGetUpcomingPickupsByHotelId() {
    try {
        const orders = await getUpcomingPickupsByHotelId(1);
        console.log('Upcoming pickups for hotel:', orders);
        
        orders.forEach(order => {
            console.log(`\nPickup #${order.id}:`);
            console.log(`  Food: ${order.foodTitle}`);
            console.log(`  Time: ${order.pickupTime}`);
            console.log(`  Charity: ${order.charityName}`);
        });
        
        return orders;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 9. UPDATE ORDER (NOTES)
// ============================================
export async function exampleUpdateOrder() {
    const updatedData = {
        notes: "Updated: Will arrive 30 minutes earlier at 5:30 PM"
    };
    
    try {
        const order = await updateOrder(1, updatedData);
        console.log('Order updated:', order);
        console.log('New notes:', order.notes);
        return order;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 10. MARK ORDER AS PICKED UP
// ============================================
export async function exampleMarkAsPickedUp() {
    try {
        const order = await markAsPickedUp(1);
        console.log('Order marked as picked up:', order);
        console.log('New status:', order.status);
        return order;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 11. CANCEL ORDER
// ============================================
export async function exampleCancelOrder() {
    try {
        await cancelOrder(1);
        console.log('Order cancelled successfully');
        return true;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 12. UPDATE ORDER STATUS
// ============================================
export async function exampleUpdateOrderStatus() {
    try {
        // Status options: PENDING, CONFIRMED, PICKED_UP, CANCELLED
        const order = await updateOrderStatus(1, 'CONFIRMED');
        console.log('Order status updated:', order);
        console.log('New status:', order.status);
        return order;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 13. COMPLETE ORDER FLOW (CHARITY PERSPECTIVE)
// ============================================
export async function exampleCompleteCharityOrderFlow() {
    try {
        // Step 1: Reserve food
        console.log('Step 1: Reserving food...');
        const reservation = {
            foodId: 1,
            charityId: 1,
            notes: "Will pick up tomorrow at 6 PM"
        };
        const order = await reserveFood(reservation);
        console.log('Food reserved:', order);
        
        // Step 2: Check upcoming pickups
        console.log('\nStep 2: Checking upcoming pickups...');
        const upcomingPickups = await getUpcomingPickupsByCharityId(1);
        console.log('Upcoming pickups:', upcomingPickups.length);
        
        // Step 3: Update notes if needed
        console.log('\nStep 3: Updating pickup notes...');
        const updatedOrder = await updateOrder(order.id, {
            notes: "Updated: Will arrive at 5:45 PM instead"
        });
        console.log('Notes updated');
        
        // Step 4: Mark as picked up (after actual pickup)
        console.log('\nStep 4: Marking as picked up...');
        const completedOrder = await markAsPickedUp(order.id);
        console.log('Order completed:', completedOrder.status);
        
        return completedOrder;
    } catch (error) {
        console.error('Order flow error:', error.message);
        throw error;
    }
}

// ============================================
// 14. COMPLETE ORDER FLOW (HOTEL PERSPECTIVE)
// ============================================
export async function exampleCompleteHotelOrderFlow() {
    try {
        // Step 1: Check incoming orders
        console.log('Step 1: Checking incoming orders...');
        const orders = await getOrdersByHotelIdAndStatus(1, 'PENDING');
        console.log(`Pending orders: ${orders.length}`);
        
        if (orders.length > 0) {
            const orderId = orders[0].id;
            
            // Step 2: Confirm the order
            console.log('\nStep 2: Confirming order...');
            const confirmedOrder = await updateOrderStatus(orderId, 'CONFIRMED');
            console.log('Order confirmed');
            
            // Step 3: Check upcoming pickups
            console.log('\nStep 3: Checking upcoming pickups...');
            const upcomingPickups = await getUpcomingPickupsByHotelId(1);
            console.log('Upcoming pickups:', upcomingPickups.length);
            
            return confirmedOrder;
        }
        
        console.log('No pending orders to process');
    } catch (error) {
        console.error('Hotel order flow error:', error.message);
        throw error;
    }
}

// ============================================
// 15. GET ORDER STATISTICS
// ============================================
export async function exampleGetOrderStatistics() {
    try {
        const charityId = 1;
        const allOrders = await getOrdersByCharityId(charityId);
        
        const stats = {
            total: allOrders.length,
            pending: allOrders.filter(o => o.status === 'PENDING').length,
            confirmed: allOrders.filter(o => o.status === 'CONFIRMED').length,
            pickedUp: allOrders.filter(o => o.status === 'PICKED_UP').length,
            cancelled: allOrders.filter(o => o.status === 'CANCELLED').length
        };
        
        console.log('=== Order Statistics ===');
        console.log('Total Orders:', stats.total);
        console.log('Pending:', stats.pending);
        console.log('Confirmed:', stats.confirmed);
        console.log('Picked Up:', stats.pickedUp);
        console.log('Cancelled:', stats.cancelled);
        
        if (stats.total > 0) {
            const successRate = ((stats.pickedUp / stats.total) * 100).toFixed(2);
            console.log(`Success Rate: ${successRate}%`);
        }
        
        return stats;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}