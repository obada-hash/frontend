import {
    exampleCreateFood,
    exampleGetFoodById,
    exampleGetAllAvailableFood,
    exampleGetRecentFood,
    exampleGetFoodByHotelId,
    exampleGetFoodByHotelIdAndStatus,
    exampleSearchFood,
    exampleUpdateFood,
    exampleDeleteFood,
    exampleUpdateFoodStatus
} from '../claude_impl/food_impl.js';

// Call any function
exampleGetAllAvailableFood();

// Or use them with await
async function test() {
    const foods = await exampleGetAllAvailableFood();
    console.log('Got foods:', foods);
}

// test();