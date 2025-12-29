import {
    exampleReserveFood,
    exampleGetOrderById,
    exampleGetOrdersByCharityId,
    exampleGetOrdersByCharityIdAndStatus,
    exampleGetUpcomingPickupsByCharityId,
    exampleGetOrdersByHotelId,
    exampleGetOrdersByHotelIdAndStatus,
    exampleGetUpcomingPickupsByHotelId,
    exampleUpdateOrder,
    exampleMarkAsPickedUp,
    exampleCancelOrder,
    exampleUpdateOrderStatus,
    exampleCompleteCharityOrderFlow,
    exampleCompleteHotelOrderFlow,
    exampleGetOrderStatistics
} from '../claude_impl/order_impl.js';

// Or import the direct API functions
import { reserveFood, getOrdersByCharityId, markAsPickedUp } from './order_api.js';

// Use examples
await exampleReserveFood();

// Or use API directly
const order = await reserveFood({
    foodId: 1,
    charityId: 1,
    notes: "Will pick up at 6 PM"
});
console.log(order);