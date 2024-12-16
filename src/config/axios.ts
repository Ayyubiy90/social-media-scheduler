import axios from "axios";
import { getAuth } from "firebase/auth";

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get fresh token
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          const token = await currentUser.getIdToken(true); // Force refresh
          localStorage.setItem("token", token);
          
          // Update request header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          // Retry request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // Clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function to update token
const updateToken = async (): Promise<void> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken(true);
      localStorage.setItem("token", token);
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

// Initialize token update interval
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(updateToken, TOKEN_REFRESH_INTERVAL);

// Initial token update
updateToken().catch(console.error);

export default axiosInstance;
