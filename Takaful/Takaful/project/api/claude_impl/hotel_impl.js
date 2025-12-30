import {
    getHotelById,
    getHotelByUserId,
    getAllHotels,
    updateHotel,
    deleteHotel,
    searchHotels
} from '../claude_api/hotel_api.js';

// ============================================
// 1. GET HOTEL BY ID
// ============================================
export async function exampleGetHotelById() {
    try {
        const hotel = await getHotelById(1);
        console.log('Hotel details:', hotel);
        console.log('Hotel name:', hotel.hotelName);
        console.log('Total food posted:', hotel.totalFoodPosted);
        console.log('Completed donations:', hotel.totalCompleted);
        return hotel;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 2. GET HOTEL BY USER ID
// ============================================
export async function exampleGetHotelByUserId() {
    try {
        const hotel = await getHotelByUserId(3);
        console.log('Hotel for user:', hotel);
        return hotel;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 3. GET ALL HOTELS
// ============================================
export async function exampleGetAllHotels() {
    try {
        const hotels = await getAllHotels();
        console.log('All hotels:', hotels);
        console.log(`Total hotels: ${hotels.length}`);
        
        // Display each hotel
        hotels.forEach(hotel => {
            console.log(`- ${hotel.hotelName} (${hotel.address})`);
        });
        
        return hotels;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 4. UPDATE HOTEL
// ============================================
export async function exampleUpdateHotel() {
    const updatedData = {
        hotelName: "Grand Hotel Deluxe",
        address: "123 Updated Street, New City",
        contactPhone: "+9876543210",
        description: "Updated - Premium luxury hotel with excellent food donation program"
    };
    
    try {
        const result = await updateHotel(1, updatedData);
        console.log('Updated hotel:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 5. DELETE HOTEL
// ============================================
export async function exampleDeleteHotel() {
    try {
        await deleteHotel(1);
        console.log('Hotel deleted successfully');
        return true;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 6. SEARCH HOTELS BY NAME
// ============================================
export async function exampleSearchHotelsByName() {
    try {
        const hotels = await searchHotels({ name: 'Grand' });
        console.log('Search results by name:', hotels);
        console.log(`Found ${hotels.length} hotels`);
        return hotels;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 7. SEARCH HOTELS BY ADDRESS
// ============================================
export async function exampleSearchHotelsByAddress() {
    try {
        const hotels = await searchHotels({ address: 'City' });
        console.log('Search results by address:', hotels);
        console.log(`Found ${hotels.length} hotels`);
        return hotels;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 8. SEARCH ALL HOTELS (NO PARAMS)
// ============================================
export async function exampleSearchAllHotels() {
    try {
        const hotels = await searchHotels();
        console.log('All hotels via search:', hotels);
        return hotels;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 9. GET HOTEL WITH STATISTICS
// ============================================
export async function exampleGetHotelWithStats() {
    try {
        const hotel = await getHotelById(1);
        
        console.log('=== Hotel Statistics ===');
        console.log('Hotel Name:', hotel.hotelName);
        console.log('Address:', hotel.address);
        console.log('Phone:', hotel.contactPhone);
        console.log('Total Food Posted:', hotel.totalFoodPosted);
        console.log('Completed Donations:', hotel.totalCompleted);
        
        if (hotel.totalFoodPosted > 0) {
            const completionRate = ((hotel.totalCompleted / hotel.totalFoodPosted) * 100).toFixed(2);
            console.log(`Completion Rate: ${completionRate}%`);
        }
        
        return hotel;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 10. COMPLETE HOTEL PROFILE UPDATE FLOW
// ============================================
export async function exampleCompleteUpdateFlow() {
    try {
        // Step 1: Get current hotel data
        console.log('Step 1: Getting current hotel data...');
        const currentHotel = await getHotelById(1);
        console.log('Current data:', currentHotel);
        
        // Step 2: Update hotel
        console.log('Step 2: Updating hotel...');
        const updatedData = {
            hotelName: currentHotel.hotelName + ' (Updated)',
            address: currentHotel.address,
            contactPhone: currentHotel.contactPhone,
            description: 'Updated description: ' + currentHotel.description
        };
        
        const updatedHotel = await updateHotel(1, updatedData);
        console.log('Updated successfully:', updatedHotel);
        
        // Step 3: Verify update
        console.log('Step 3: Verifying update...');
        const verifiedHotel = await getHotelById(1);
        console.log('Verified data:', verifiedHotel);
        
        return verifiedHotel;
    } catch (error) {
        console.error('Update flow error:', error.message);
        throw error;
    }
}

// ============================================
// 11. COMPARE HOTEL PERFORMANCE
// ============================================
export async function exampleCompareHotelPerformance() {
    try {
        const hotels = await getAllHotels();
        
        console.log('=== Hotel Performance Comparison ===');
        
        hotels.forEach(hotel => {
            const completionRate = hotel.totalFoodPosted > 0 
                ? ((hotel.totalCompleted / hotel.totalFoodPosted) * 100).toFixed(2)
                : 0;
            
            console.log(`\n${hotel.hotelName}:`);
            console.log(`  - Food Posted: ${hotel.totalFoodPosted}`);
            console.log(`  - Completed: ${hotel.totalCompleted}`);
            console.log(`  - Rate: ${completionRate}%`);
        });
        
        return hotels;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 12. FIND TOP PERFORMING HOTELS
// ============================================
export async function exampleFindTopHotels() {
    try {
        const hotels = await getAllHotels();
        
        // Sort by total completed donations
        const topHotels = hotels
            .sort((a, b) => b.totalCompleted - a.totalCompleted)
            .slice(0, 5);
        
        console.log('=== Top 5 Hotels by Completed Donations ===');
        topHotels.forEach((hotel, index) => {
            console.log(`${index + 1}. ${hotel.hotelName} - ${hotel.totalCompleted} donations`);
        });
        
        return topHotels;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}