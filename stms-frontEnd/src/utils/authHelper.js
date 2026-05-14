// Helper functions for authentication

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The token or null if not found
 */
export const getToken = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found in localStorage');
            return null;
        }
        // Clean token - remove quotes if present
        return token.replace(/^"|"$/g, '');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
    return getToken() !== null;
};

/**
 * Get authorization headers for API requests
 * @returns {object} Headers object with Authorization header
 */
export const getAuthHeaders = () => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn('No token available for request');
    }
    
    return headers;
};

/**
 * Verify token format
 * @param {string} token - The token to verify
 * @returns {boolean} True if token looks valid
 */
export const isValidTokenFormat = (token) => {
    if (!token || typeof token !== 'string') {
        return false;
    }
    // JWT tokens typically have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
};












