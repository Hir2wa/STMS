import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No token found in localStorage');
        return {
            'Content-Type': 'application/json'
        };
    }
    const cleanToken = token.replace(/^"|"$/g, '');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
    };
};

export const globalSearchService = {
    // Global search across all entities
    search: async (query, page = 0, size = 10) => {
        const response = await axios.get(`${API_BASE_URL}/search/global?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

