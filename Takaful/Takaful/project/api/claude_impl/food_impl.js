import {
    createFood,
    getFoodById,
    getAllAvailableFood,
    getRecentFood,
    getFoodByHotelId,
    getFoodByHotelIdAndStatus,
    searchFood,
    updateFood,
    deleteFood,
    updateFoodStatus
} from '../claude_api/food_api.js';

// ============================================
// 1. CREATE FOOD
// ============================================
export async function exampleCreateFood() {
    const foodData = {
        title: "Chicken Biryani",
        description: "Delicious homemade chicken biryani with raita",
        quantity: 10,
        expiryTime: "2025-12-30T20:00:00",
        pickupTime: "2025-12-30T18:00:00",
        availableUntil: "2025-12-30T20:00:00",
        foodType: "NON_VEGETARIAN",
        category: "COOKED_MEAL"
    };
    
    try {
        const result = await createFood(1, foodData);
        console.log('Created food:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 2. GET FOOD BY ID
// ============================================
export async function exampleGetFoodById(id) {
    try {
        const food = await getFoodById(id);
        console.log('Food details:', food);
        return food;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 3. GET ALL AVAILABLE FOOD
// ============================================
export async function exampleGetAllAvailableFood() {
    try {
        const foods = await getAllAvailableFood();
        console.log('Available foods:', foods);
        console.log(`Total: ${foods.length} items`);
        return foods;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 4. GET RECENT FOOD
// ============================================
export async function exampleGetRecentFood() {
    try {
        const foods = await getRecentFood();
        console.log('Recent foods:', foods);
        return foods;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 5. GET FOOD BY HOTEL ID
// ============================================
export async function exampleGetFoodByHotelId(id) {
    try {
        const foods = await getFoodByHotelId(id);
        console.log('Hotel foods:', foods);
        return foods;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 6. GET FOOD BY HOTEL ID AND STATUS
// ============================================
export async function exampleGetFoodByHotelIdAndStatus(id, status) {
    try {
        // Status can be: AVAILABLE, RESERVED, COMPLETED, CANCELLED
        const foods = await getFoodByHotelIdAndStatus(id, status);
        console.log('Available foods from hotel:', foods);
        return foods;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 7. SEARCH FOOD
// ============================================
export async function exampleSearchFood(searchBy) {
    try {
        const foods = await searchFood(searchBy);
        console.log('Search results:', foods);
        return foods;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 8. UPDATE FOOD
// ============================================
export async function exampleUpdateFood(id) {
    const updatedData = {
        title: "Special Chicken Biryani",
        description: "Updated description with extra spices",
        quantity: 15,
        expiryTime: "2025-12-31T20:00:00",
        pickupTime: "2025-12-31T18:00:00",
        availableUntil: "2025-12-31T20:00:00",
        foodType: "NON_VEGETARIAN",
        category: "COOKED_MEAL"
    };
    
    try {
        const result = await updateFood(id, updatedData);
        console.log('Updated food:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 9. DELETE FOOD
// ============================================
export async function exampleDeleteFood(id) {
    try {
        await deleteFood(id);
        console.log('Food deleted successfully');
        return true;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 10. UPDATE FOOD STATUS
// ============================================
export async function exampleUpdateFoodStatus(id, status) {
    try {
        // Status options: AVAILABLE, RESERVED, COMPLETED, CANCELLED
        const result = await updateFoodStatus(id, status);
        console.log('Status updated:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}