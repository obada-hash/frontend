import {
    register,
    login,
    logout,
    isLoggedIn,
    getCurrentUser,
    getAuthHeader
} from '../claude_api/auth_api.js';

// ============================================
// 1. REGISTER AS HOTEL
// ============================================
export async function exampleRegisterHotel() {
    const hotelData = {
        email: "hotel@example.com",
        password: "securePassword123",
        role: "HOTEL",
        hotelName: "Grand Hotel",
        address: "123 Main Street, City",
        contactPhone: "+1234567890",
        description: "Luxury hotel in the heart of the city"
    };
    
    try {
        const result = await register(hotelData);
        console.log('Hotel registered:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 2. REGISTER AS CHARITY
// ============================================
export async function exampleRegisterCharity() {
    const charityData = {
        email: "charity@example.com",
        password: "securePassword123",
        role: "CHARITY",
        organizationName: "Hope Foundation",
        address: "456 Charity Lane, City",
        contactPhone: "+1234567890",
        registrationNumber: "REG-12345",
        description: "Helping those in need since 1990"
    };
    
    try {
        const result = await register(charityData);
        console.log('Charity registered:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 3. LOGIN
// ============================================
export async function exampleLogin() {
    const credentials = {
        email: "charity@example.com",
        password: "securePassword123"
    };
    
    try {
        const result = await login(credentials);
        console.log('Logged in successfully:', result);
        console.log('Access Token:', result.accessToken);
        console.log('User ID:', result.id);
        console.log('Email:', result.email);
        console.log('Roles:', result.roles);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 4. LOGOUT
// ============================================
export async function exampleLogout() {
    try {
        const result = await logout();
        console.log('Logged out successfully');
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 5. CHECK IF LOGGED IN
// ============================================
export function exampleCheckLogin() {
    const loggedIn = isLoggedIn();
    console.log('Is logged in:', loggedIn);
    return loggedIn;
}

// ============================================
// 6. GET CURRENT USER INFO
// ============================================
export function exampleGetCurrentUser() {
    const user = getCurrentUser();
    console.log('Current user:', user);
    return user;
}

// ============================================
// 7. MAKE AUTHENTICATED REQUEST
// ============================================
export async function exampleAuthenticatedRequest() {
    try {
        // Example: Get food by hotel ID using authentication
        const headers = {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        };
        
        const response = await fetch('http://127.0.0.1:8085/api/foods/hotel/1', {
            method: 'GET',
            headers: headers
        });
        
        const result = await response.json();
        console.log('Authenticated request result:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ============================================
// 8. COMPLETE LOGIN FLOW EXAMPLE
// ============================================
export async function exampleCompleteLoginFlow() {
    try {
        // Step 1: Check if already logged in
        if (isLoggedIn()) {
            console.log('Already logged in as:', getCurrentUser());
            return;
        }
        
        // Step 2: Login
        const credentials = {
            email: "hotel@example.com",
            password: "securePassword123"
        };
        
        const loginResult = await login(credentials);
        console.log('Login successful!');
        
        // Step 3: Get current user
        const user = getCurrentUser();
        console.log('Current user:', user);
        
        // Step 4: Make an authenticated request
        await exampleAuthenticatedRequest();
        
        // Step 5: Logout (optional)
        // await logout();
        
    } catch (error) {
        console.error('Login flow error:', error.message);
        throw error;
    }
}

// ============================================
// 9. COMPLETE REGISTRATION FLOW EXAMPLE
// ============================================
export async function exampleCompleteRegistrationFlow() {
    try {
        // Step 1: Register as hotel
        const hotelData = {
            email: "newhotel@example.com",
            password: "securePassword123",
            role: "HOTEL",
            hotelName: "New Grand Hotel",
            address: "789 New Street, City",
            contactPhone: "+9876543210",
            description: "Brand new luxury hotel"
        };
        
        const registerResult = await register(hotelData);
        console.log('Registration successful!');
        
        // Step 2: Login with new credentials
        const loginResult = await login({
            email: hotelData.email,
            password: hotelData.password
        });
        
        console.log('Auto-login successful after registration!');
        console.log('You can now make authenticated requests');
        
    } catch (error) {
        console.error('Registration flow error:', error.message);
        throw error;
    }
}