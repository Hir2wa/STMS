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

export const studentService = {
    // Get all students
    getAll: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students/all`, {
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

    // Get student by ID
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/students/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by class
    getByClass: async (className) => {
        const response = await axios.get(`${API_BASE_URL}/students/class/${className}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by status
    getByStatus: async (status) => {
        const response = await axios.get(`${API_BASE_URL}/students/status/${status}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by parent
    getByParent: async (parentId) => {
        const response = await axios.get(`${API_BASE_URL}/students/parent/${parentId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by bus
    getByBus: async (busId) => {
        const response = await axios.get(`${API_BASE_URL}/students/bus/${busId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by pickup point
    getByPickupPoint: async (pickUpPoint) => {
        const response = await axios.get(`${API_BASE_URL}/students/pickup/${pickUpPoint}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by dropoff point
    getByDropoffPoint: async (dropOffPoint) => {
        const response = await axios.get(`${API_BASE_URL}/students/dropoff/${dropOffPoint}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Search students by name
    search: async (name) => {
        const response = await axios.get(`${API_BASE_URL}/students/search?name=${name}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Create new student
    create: async (studentData) => {
        const response = await axios.post(`${API_BASE_URL}/students/save`, studentData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Update student
    update: async (id, studentData) => {
        const response = await axios.put(`${API_BASE_URL}/students/${id}`, studentData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Delete student
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/students/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Assign parent to student
    assignParent: async (studentId, parentId) => {
        const response = await axios.put(`${API_BASE_URL}/students/assignParent?studentId=${studentId}&parentId=${parentId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Assign bus to student
    assignBus: async (studentId, busId) => {
        const response = await axios.put(`${API_BASE_URL}/students/assignBus?studentId=${studentId}&busId=${busId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Update student status
    updateStatus: async (studentId, status) => {
        const response = await axios.put(`${API_BASE_URL}/students/updateStatus?studentId=${studentId}&status=${status}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get current student's info with bus, driver, and schedules
    getMyInfo: async () => {
        const response = await axios.get(`${API_BASE_URL}/students/me/info`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Paginated methods
    getAllPaginated: async (page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/students/allPaginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    searchPaginated: async (searchTerm, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
        const response = await axios.get(`${API_BASE_URL}/students/search/paginated?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Get students by location code with pagination (searches in hierarchy)
    getByLocationCodePaginated: async (locationCode, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
        const response = await axios.get(
            `${API_BASE_URL}/students/location/${encodeURIComponent(locationCode)}/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    }
};

