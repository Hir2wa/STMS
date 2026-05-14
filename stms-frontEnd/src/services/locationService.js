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

export const locationService = {
    // For cascading combo-boxes
    getRoots: async () => {
        const response = await axios.get(`${API_BASE_URL}/locations/roots/list`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getChildren: async (parentCode) => {
        const response = await axios.get(`${API_BASE_URL}/locations/${parentCode}/children/list`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getByCode: async (code) => {
        const response = await axios.get(`${API_BASE_URL}/locations/getLocation?code=${encodeURIComponent(code)}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Admin helpers (paginated)
    getByType: async (type, { page = 0, size = 50 } = {}) => {
        const response = await axios.get(`${API_BASE_URL}/locations/type/${type}?page=${page}&size=${size}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create province (root)
    createProvince: async (locationData) => {
        const response = await axios.post(`${API_BASE_URL}/locations/save`, locationData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create child under parentCode
    createChild: async (parentCode, locationData) => {
        const response = await axios.post(`${API_BASE_URL}/locations/saveChild?parentCode=${encodeURIComponent(parentCode)}`, locationData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    update: async (code, locationData) => {
        const response = await axios.put(`${API_BASE_URL}/locations/${encodeURIComponent(code)}`, locationData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    delete: async (code) => {
        const response = await axios.delete(`${API_BASE_URL}/locations/${encodeURIComponent(code)}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};


