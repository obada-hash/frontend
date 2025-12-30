import {
    getCharityById,
    getCharityByUserId,
    getAllCharities,
    updateCharity,
    deleteCharity,
    searchCharities
} from '../claude_api/charity_api.js';

// ============================================
// 1. GET CHARITY BY ID
// ============================================
export async function exampleGetCharityById() {
    try {
        const charity = await getCharityById(1);
        console.log('Charity details:', charity);
        console.log('Organization name:', charity.organizationName);
        console.log('Total orders:', charity.totalOrders);
        console.log('Completed orders:', charity.totalCompleted);
        return charity;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 2. GET CHARITY BY USER ID
// ============================================
export async function exampleGetCharityByUserId() {
    try {
        const charity = await getCharityByUserId(5);
        console.log('Charity for user:', charity);
        return charity;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 3. GET ALL CHARITIES
// ============================================
export async function exampleGetAllCharities() {
    try {
        const charities = await getAllCharities();
        console.log('All charities:', charities);
        console.log(`Total charities: ${charities.length}`);
        
        // Display each charity
        charities.forEach(charity => {
            console.log(`- ${charity.organizationName} (${charity.address})`);
        });
        
        return charities;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 4. UPDATE CHARITY
// ============================================
export async function exampleUpdateCharity() {
    const updatedData = {
        organizationName: "Hope Foundation Updated",
        address: "456 New Charity Lane, City",
        contactPhone: "+9876543210",
        registrationNumber: "REG-54321",
        description: "Updated description - Helping those in need since 1990"
    };
    
    try {
        const result = await updateCharity(1, updatedData);
        console.log('Updated charity:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 5. DELETE CHARITY
// ============================================
export async function exampleDeleteCharity() {
    try {
        await deleteCharity(1);
        console.log('Charity deleted successfully');
        return true;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 6. SEARCH CHARITIES BY NAME
// ============================================
export async function exampleSearchCharitiesByName() {
    try {
        const charities = await searchCharities({ name: 'Hope' });
        console.log('Search results by name:', charities);
        console.log(`Found ${charities.length} charities`);
        return charities;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 7. SEARCH CHARITIES BY ADDRESS
// ============================================
export async function exampleSearchCharitiesByAddress() {
    try {
        const charities = await searchCharities({ address: 'City' });
        console.log('Search results by address:', charities);
        console.log(`Found ${charities.length} charities`);
        return charities;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 8. SEARCH ALL CHARITIES (NO PARAMS)
// ============================================
export async function exampleSearchAllCharities() {
    try {
        const charities = await searchCharities();
        console.log('All charities via search:', charities);
        return charities;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 9. GET CHARITY WITH STATISTICS
// ============================================
export async function exampleGetCharityWithStats() {
    try {
        const charity = await getCharityById(1);
        
        console.log('=== Charity Statistics ===');
        console.log('Organization:', charity.organizationName);
        console.log('Address:', charity.address);
        console.log('Phone:', charity.contactPhone);
        console.log('Registration:', charity.registrationNumber);
        console.log('Total Orders:', charity.totalOrders);
        console.log('Completed Orders:', charity.totalCompleted);
        
        if (charity.totalOrders > 0) {
            const completionRate = ((charity.totalCompleted / charity.totalOrders) * 100).toFixed(2);
            console.log(`Completion Rate: ${completionRate}%`);
        }
        
        return charity;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 10. COMPLETE CHARITY PROFILE UPDATE FLOW
// ============================================
export async function exampleCompleteUpdateFlow() {
    try {
        // Step 1: Get current charity data
        console.log('Step 1: Getting current charity data...');
        const currentCharity = await getCharityById(1);
        console.log('Current data:', currentCharity);
        
        // Step 2: Update charity
        console.log('Step 2: Updating charity...');
        const updatedData = {
            organizationName: currentCharity.organizationName + ' (Updated)',
            address: currentCharity.address,
            contactPhone: currentCharity.contactPhone,
            registrationNumber: currentCharity.registrationNumber,
            description: 'Updated description: ' + currentCharity.description
        };
        
        const updatedCharity = await updateCharity(1, updatedData);
        console.log('Updated successfully:', updatedCharity);
        
        // Step 3: Verify update
        console.log('Step 3: Verifying update...');
        const verifiedCharity = await getCharityById(1);
        console.log('Verified data:', verifiedCharity);
        
        return verifiedCharity;
    } catch (error) {
        console.error('Update flow error:', error.message);
        throw error;
    }
}