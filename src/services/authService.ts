import axios from 'axios';

export interface User {
    token: string;
    uid: string;
}

interface Credentials {
    email: string;
    password: string;
}

interface AuthResponse {
    uid: string;
    token?: string;
    message?: string;
    error?: string;
}

const API_URL = 'http://localhost:5000/auth';

const handleApiError = (error: unknown): never => {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
            throw new Error(axiosError.response.data.error);
        }
    }
    
    if (error instanceof Error) {
        throw error;
    }
    
    throw new Error('An unexpected error occurred');
};

export const loginUser = async (credentials: Credentials): Promise<User> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials);
        const userData = response.data;
        
        if (!userData.token || !userData.uid) {
            throw new Error('Invalid response from server: missing token or uid');
        }

        return {
            token: userData.token,
            uid: userData.uid
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

export const registerUser = async (userData: Credentials): Promise<User> => {
    try {
        // First register the user
        const registerResponse = await axios.post<AuthResponse>(`${API_URL}/register`, userData);
        
        if (!registerResponse.data.uid) {
            throw new Error('Registration failed: no user ID received');
        }

        // Then login to get the token
        const loginResponse = await loginUser(userData);
        return loginResponse;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await axios.post(`${API_URL}/logout`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
    }
};
