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

export const driverService = {
    // Get all drivers
    getAll: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/all`, {
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

    // Get driver by ID
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/drivers/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get driver by license number
    getByLicenseNumber: async (licenseNumber) => {
        const response = await axios.get(`${API_BASE_URL}/drivers/license/${licenseNumber}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get drivers by experience
    getByExperience: async (minYears) => {
        const response = await axios.get(`${API_BASE_URL}/drivers/experience/${minYears}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Search drivers by name
    search: async (name) => {
        const response = await axios.get(`${API_BASE_URL}/drivers/search?name=${name}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Check if driver exists by license number
    exists: async (licenseNumber) => {
        const response = await axios.get(`${API_BASE_URL}/drivers/exists/${licenseNumber}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create new driver
    create: async (driverData) => {
        const response = await axios.post(`${API_BASE_URL}/drivers/save`, driverData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Update driver
    update: async (id, driverData) => {
        const response = await axios.put(`${API_BASE_URL}/drivers/${id}`, driverData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Delete driver
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/drivers/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get current driver's stats
    getMyStats: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/me/stats`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching driver stats:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    // Get current driver's students
    getMyStudents: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/me/students`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching driver students:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    // Get current driver's schedules
    getMySchedules: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/drivers/me/schedules`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching driver schedules:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    // Paginated methods
    getAllPaginated: async (page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/drivers/allPaginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    searchPaginated: async (searchTerm, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/drivers/search/paginated?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

