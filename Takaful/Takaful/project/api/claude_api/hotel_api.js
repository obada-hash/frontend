const API_BASE_URL = 'http://127.0.0.1:8085/api';

// Get hotel by ID
export async function getHotelById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/${id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get hotel:', error.message);
        throw error;
    }
}

// Get hotel by user ID
export async function getHotelByUserId(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/user/${userId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get hotel by user ID:', error.message);
        throw error;
    }
}

// Get all hotels
export async function getAllHotels() {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get all hotels:', error.message);
        throw error;
    }
}

// Update hotel
export async function updateHotel(id, hotelData) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hotelData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Hotel updated:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to update hotel:', error.message);
        throw error;
    }
}

// Delete hotel
export async function deleteHotel(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Hotel deleted:', result.message);
            return true;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to delete hotel:', error.message);
        throw error;
    }
}

// Search hotels
export async function searchHotels(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.name) {
            queryParams.append('name', params.name);
        }
        if (params.address) {
            queryParams.append('address', params.address);
        }
        
        const url = `${API_BASE_URL}/hotels/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to search hotels:', error.message);
        throw error;
    }
}