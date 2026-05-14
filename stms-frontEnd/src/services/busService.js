import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Get token from localStorage for each request
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please login first.');
    }
    // Clean token - remove quotes if present
    const cleanToken = token.replace(/^"|"$/g, '').trim();
    if (!cleanToken) {
        throw new Error('Invalid authentication token. Please login again.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
    };
};

export const busService = {
    // Get all buses
    getAll: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/buses/all`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                // Clear invalid token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                throw new Error('Session expired. Please login again.');
            }
            throw error;
        }
    },

    // Get bus by ID
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/buses/getById?id=${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get bus by plate number
    getByPlateNumber: async (plateNumber) => {
        const response = await axios.get(`${API_BASE_URL}/buses/getByPlate?plateNumber=${plateNumber}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get buses by status
    getByStatus: async (status) => {
        const response = await axios.get(`${API_BASE_URL}/buses/byStatus?status=${status}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get buses by route
    getByRoute: async (routeId) => {
        const response = await axios.get(`${API_BASE_URL}/buses/byRoute?routeId=${routeId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get buses by capacity
    getByCapacity: async (minCapacity) => {
        const response = await axios.get(`${API_BASE_URL}/buses/byCapacity?minCapacity=${minCapacity}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create new bus
    create: async (busData) => {
        const response = await axios.post(`${API_BASE_URL}/buses/save`, busData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Update bus
    update: async (id, busData) => {
        const response = await axios.put(`${API_BASE_URL}/buses/update?id=${id}`, busData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Delete bus
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/buses/delete?id=${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Assign driver to bus
    assignDriver: async (busId, driverId) => {
        const response = await axios.put(`${API_BASE_URL}/buses/assignDriver?busId=${busId}&driverId=${driverId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Assign route to bus
    assignRoute: async (busId, routeId) => {
        const response = await axios.put(`${API_BASE_URL}/buses/assignRoute?busId=${busId}&routeId=${routeId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Update bus status
    updateStatus: async (busId, status) => {
        const response = await axios.put(`${API_BASE_URL}/buses/updateStatus?busId=${busId}&status=${status}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Remove driver from bus
    removeDriver: async (busId) => {
        const response = await axios.put(`${API_BASE_URL}/buses/removeDriver?busId=${busId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Remove route from bus
    removeRoute: async (busId) => {
        const response = await axios.put(`${API_BASE_URL}/buses/removeRoute?busId=${busId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Paginated methods
    getAllPaginated: async (page = 0, size = 10, sortBy = 'plateNumber', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/buses/allPaginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    searchPaginated: async (searchTerm, page = 0, size = 10, sortBy = 'plateNumber', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/buses/search/paginated?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

