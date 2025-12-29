import {
    exampleGetHotelById,
    exampleGetHotelByUserId,
    exampleGetAllHotels,
    exampleUpdateHotel,
    exampleDeleteHotel,
    exampleSearchHotelsByName,
    exampleSearchHotelsByAddress,
    exampleSearchAllHotels,
    exampleGetHotelWithStats,
    exampleCompleteUpdateFlow,
    exampleCompareHotelPerformance,
    exampleFindTopHotels
} from './hotel_examples.js';

// Or import the direct API functions
import { getHotelById, searchHotels, updateHotel } from './hotel_api.js';

// Use examples
await exampleGetAllHotels();

// Or use API directly
const hotels = await searchHotels({ name: 'Grand' });
console.log(hotels);