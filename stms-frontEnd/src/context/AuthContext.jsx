import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Normalize token from storage / API response:
// - trims whitespace
// - removes surrounding quotes
// - removes accidental leading "Bearer "
const normalizeToken = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    let t = raw.trim();
    t = t.replace(/^"|"$/g, '');
    t = t.trim();
    if (/^Bearer\s+/i.test(t)) {
        t = t.replace(/^Bearer\s+/i, '').trim();
    }
    return t || null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => normalizeToken(localStorage.getItem('token')));
    const navigate = useNavigate();

    // Configure axios defaults
    useEffect(() => {
        // Set up axios defaults
        axios.defaults.baseURL = 'http://localhost:8081/api';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        
        // If we have a token, set it in axios defaults
        const cleanToken = normalizeToken(token || localStorage.getItem('token'));
        if (cleanToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
            // keep storage normalized (prevents "Bearer Bearer ..." / whitespace issues)
            if (localStorage.getItem('token') !== cleanToken) {
                localStorage.setItem('token', cleanToken);
            }
            if (token !== cleanToken) setToken(cleanToken);
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        
        // If we have a token but no user, try to fetch user details (or decode token)
        // For now we persist user in localStorage as well for simplicity
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [token]);

    // Global auth failure handler: if backend returns 401/403, token is missing/invalid -> force re-login.
    // This prevents the app from spamming every endpoint with 403s forever.
    useEffect(() => {
        let handling = false;
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status;
                const url = String(error?.config?.url || '');
                const isLoginCall = url.includes('/auth/login');

                if (!handling && !isLoginCall && (status === 401 || status === 403)) {
                    handling = true;
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];

                    // Avoid redirect loops
                    if (window.location.pathname !== '/login') {
                        toast.error('Session expired. Please login again.');
                        navigate('/login');
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptorId);
        };
    }, [navigate]);

    const login = async (email, password, otp = null) => {
        try {
            // Login request - no auth token needed
            // Temporarily remove Authorization from defaults for this request
            const originalAuth = axios.defaults.headers.common['Authorization'];
            delete axios.defaults.headers.common['Authorization'];
            
            let response;
            try {
                // Make login request without Authorization header
                const loginData = { username: email, password };
                if (otp) {
                    loginData.otp = otp;
                }
                response = await axios.post('/auth/login', loginData);
            } catch (loginError) {
                // Restore original Authorization if login fails
                if (originalAuth) {
                    axios.defaults.headers.common['Authorization'] = originalAuth;
                }
                throw loginError;
            }
            
            // Check if OTP is required
            if (response.data.requiresOtp) {
                return { requiresOtp: true, message: response.data.message || 'OTP sent to your email' };
            }
            
            // Handle both old format (plain string) and new format (JSON object with token property)
            let jwtToken = response.data.token || response.data;
            
            // If token is wrapped in quotes or is an object, extract it properly
            if (typeof jwtToken === 'object' && jwtToken.token) {
                jwtToken = jwtToken.token;
            }
            jwtToken = normalizeToken(jwtToken);
            if (!jwtToken) {
                throw new Error('Login succeeded but no token was returned.');
            }

            setToken(jwtToken);
            localStorage.setItem('token', jwtToken);
            // Set token in axios defaults for subsequent requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

            // Fetch user details after login
            // Since the login only returns a token, we need another call to get user info.
            // We can use getByEmail - token is now set in axios defaults
            const userResponse = await axios.get(`/users/email/${email}`);
            const userData = userResponse.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            toast.success('Login Successful!');

            // Redirect based on role
            if (userData.role === 'ADMIN') navigate('/admin');
            else if (userData.role === 'DRIVER') navigate('/driver');
            else if (userData.role === 'STUDENT' || userData.role === 'PARENT') navigate('/student');
            else navigate('/');

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Login failed. Please check your credentials.';
            toast.error('Login Failed: ' + errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
