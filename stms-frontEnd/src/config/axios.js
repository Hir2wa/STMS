import axios from "axios";

// Get the API base URL from environment variables
// Vite uses VITE_ prefix for environment variables
// Call backend directly to avoid proxy issues
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:1000/api";

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: false, // Set to true if backend requires cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      const cleanToken = token.replace(/^"|"$/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if this is a login/auth error - suppress console errors for these
    const isAuthError =
      error.config?.url?.includes("/auth/login") &&
      (error.response?.status === 401 || error.response?.status === 403);

    // Only log non-authentication errors to console
    if (!isAuthError) {
      if (error.response) {
        // Log server errors (except auth errors) for debugging
        if (error.response.status >= 500) {
          console.error(
            "Server Error:",
            error.response.status,
            error.config?.url,
          );
        }
      } else if (error.request && !error.config?.url?.includes("/auth/login")) {
        // Log network errors (except for login attempts)
        console.error("Network Error:", error.config?.url);
      }
    }

    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login (only if not already on login page)
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
