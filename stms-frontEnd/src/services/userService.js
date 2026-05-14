import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { 'Content-Type': 'application/json' };
    }
    const cleanToken = token.replace(/^"|"$/g, '');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
    };
};

export const userService = {
    // Get users by location code with pagination (searches in hierarchy)
    getByLocationCodePaginated: async (locationCode, page = 0, size = 10, sortBy = 'fullNames', sortDir = 'asc') => {
        const response = await axios.get(
            `${API_BASE_URL}/users/location/${encodeURIComponent(locationCode)}/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    },

    // Get users by location code without pagination (searches in hierarchy)
    getByLocationCode: async (locationCode) => {
        const response = await axios.get(
            `${API_BASE_URL}/users/location/${encodeURIComponent(locationCode)}/list`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    },

    // Get all users with pagination
    getAllPaginated: async (page = 0, size = 10, sortBy = 'fullNames', sortDir = 'asc') => {
        const response = await axios.get(
            `${API_BASE_URL}/users/allPaginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    },

    // Search users by name with pagination
    searchPaginated: async (name, page = 0, size = 10, sortBy = 'fullNames', sortDir = 'asc') => {
        const response = await axios.get(
            `${API_BASE_URL}/users/search/paginated?name=${encodeURIComponent(name)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    }
};
