const API_BASE_URL = 'http://127.0.0.1:8085/api';

// Register new user
export async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✓ Registration successful:', result.message);
            return result.data;
        } else {
            throw new Error(result.message || result.error);
        }
    } catch (error) {
        console.error('Failed to register:', error.message);
        throw error;
    }
}

// Login user
export async function login(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✓ Login successful');
            // Store token in localStorage (optional)
            if (result.accessToken) {
                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('userId', result.id);
                localStorage.setItem('userEmail', result.email);
                localStorage.setItem('userRoles', JSON.stringify(result.roles));
            }
            return result;
        } else {
            throw new Error(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Failed to login:', error.message);
        throw error;
    }
}

// Logout user
export async function logout() {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✓ Logout successful');
            // Clear localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRoles');
            return result;
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error('Failed to logout:', error.message);
        // Clear localStorage anyway
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRoles');
        throw error;
    }
}

// Check if user is logged in
export function isLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

// Get current user info from localStorage
export function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    return {
        id: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
        roles: JSON.parse(localStorage.getItem('userRoles') || '[]'),
        token: localStorage.getItem('accessToken')
    };
}

// Get authorization header for authenticated requests
export function getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}