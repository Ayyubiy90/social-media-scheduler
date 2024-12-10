import axios from 'axios';

interface User {
    token: string;
}

interface Credentials {
    email: string;
    password: string;
}

const API_URL = 'http://localhost:5000/auth'; // Updated to include /auth prefix

export const loginUser = async (credentials: Credentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data as User;
};

export const registerUser = async (userData: Credentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data as User;
};

export const logoutUser = (): void => {
    localStorage.removeItem('token');
};
