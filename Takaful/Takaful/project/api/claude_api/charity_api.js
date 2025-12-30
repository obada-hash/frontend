const API_BASE_URL = 'http://127.0.0.1:8085/api';

// Get charity by ID
export async function getCharityById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/charities/${id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get charity:', error.message);
        throw error;
    }
}

// Get charity by user ID
export async function getCharityByUserId(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/charities/user/${userId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get charity by user ID:', error.message);
        throw error;
    }
}

// Get all charities
export async function getAllCharities() {
    try {
        const response = await fetch(`${API_BASE_URL}/charities`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to get all charities:', error.message);
        throw error;
    }
}

// Update charity
export async function updateCharity(id, charityData) {
    try {
        const response = await fetch(`${API_BASE_URL}/charities/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(charityData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Charity updated:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to update charity:', error.message);
        throw error;
    }
}

// Delete charity
export async function deleteCharity(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/charities/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Charity deleted:', result.message);
            return true;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to delete charity:', error.message);
        throw error;
    }
}

// Search charities
export async function searchCharities(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.name) {
            queryParams.append('name', params.name);
        }
        if (params.address) {
            queryParams.append('address', params.address);
        }
        
        const url = `${API_BASE_URL}/charities/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to search charities:', error.message);
        throw error;
    }
}