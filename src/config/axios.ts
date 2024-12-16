import axios from "axios";
import { getAuth } from "firebase/auth";

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  // Try to get token from localStorage first
  const token = localStorage.getItem("token");
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = getAuth();
      if (auth.currentUser) {
        try {
          // Try to refresh token
          const token = await auth.currentUser.getIdToken(true);
          if (error.config) {
            if (!error.config.headers) {
              error.config.headers = {};
            }
            error.config.headers.Authorization = `Bearer ${token}`;
            // Store new token
            localStorage.setItem("token", token);
            // Retry the request with new token
            return axios(error.config);
          }
        } catch {
          // If refresh fails, sign out
          await auth.signOut();
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } else {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Function to update token
export const updateToken = async () => {
  const auth = getAuth();
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(true);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  }
};

// Refresh token periodically (every 30 minutes)
setInterval(updateToken, 30 * 60 * 1000);

export default axiosInstance;
