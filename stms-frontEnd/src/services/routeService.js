import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

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

export const routeService = {
    // Get all routes
    getAll: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/routes/all`, {
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

    // Get route by ID
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/routes/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get route by name
    getByName: async (routeName) => {
        const response = await axios.get(`${API_BASE_URL}/routes/name/${routeName}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get routes by start point
    getByStartPoint: async (startPoint) => {
        const response = await axios.get(`${API_BASE_URL}/routes/start/${startPoint}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get routes by end point
    getByEndPoint: async (endPoint) => {
        const response = await axios.get(`${API_BASE_URL}/routes/end/${endPoint}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Search routes by name
    search: async (name) => {
        const response = await axios.get(`${API_BASE_URL}/routes/search?name=${name}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Check if route exists by name
    exists: async (routeName) => {
        const response = await axios.get(`${API_BASE_URL}/routes/exists/${routeName}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create new route
    create: async (routeData) => {
        const response = await axios.post(`${API_BASE_URL}/routes/save`, routeData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Update route
    update: async (id, routeData) => {
        const response = await axios.put(`${API_BASE_URL}/routes/${id}`, routeData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Delete route
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/routes/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Add location to route
    addLocation: async (routeId, locationCode) => {
        const response = await axios.put(`${API_BASE_URL}/routes/addLocation?routeId=${routeId}&locationCode=${locationCode}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Remove location from route
    removeLocation: async (routeId, locationCode) => {
        const response = await axios.put(`${API_BASE_URL}/routes/removeLocation?routeId=${routeId}&locationCode=${locationCode}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Paginated methods
    getAllPaginated: async (page = 0, size = 10, sortBy = 'routeName', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/routes/allPaginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    searchPaginated: async (searchTerm, page = 0, size = 10, sortBy = 'routeName', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/routes/search/paginated?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

