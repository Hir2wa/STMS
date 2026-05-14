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
    // Clean token - remove quotes if present
    const cleanToken = token.replace(/^"|"$/g, '');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
    };
};

export const announcementService = {
    // Get all announcements (admin only)
    getAll: async () => {
        const response = await axios.get(`${API_BASE_URL}/announcements/all`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get announcements for current user (filtered)
    getMyAnnouncements: async () => {
        const response = await axios.get(`${API_BASE_URL}/announcements/me`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create new announcement
    create: async (announcementData) => {
        const response = await axios.post(`${API_BASE_URL}/announcements/save`, announcementData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get replies for an announcement
    getReplies: async (announcementId) => {
        const response = await axios.get(`${API_BASE_URL}/announcements/${announcementId}/replies`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create a reply to an announcement
    createReply: async (announcementId, message) => {
        const response = await axios.post(`${API_BASE_URL}/announcements/${announcementId}/replies`, {
            message: message
        }, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Paginated methods
    getAllPaginated: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
        const response = await axios.get(`${API_BASE_URL}/announcements/allPaginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    searchPaginated: async (searchTerm, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
        const response = await axios.get(`${API_BASE_URL}/announcements/search/paginated?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

