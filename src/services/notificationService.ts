import axios from 'axios';

interface User {
    token: string;
    uid: string;  // Ensure uid is included
}

interface Credentials {
    email: string;
    password: string;
}

const API_URL = 'http://localhost:5000/auth';

export const loginUser = async (credentials: Credentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const userData = response.data as { token: string; uid: string }; // Explicitly typing the response
    return {
        token: userData.token,
        uid: userData.uid
    };
};

export const registerUser = async (userData: Credentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/register`, userData);
    const newUser = response.data as { token: string; uid: string }; // Explicitly typing the response
    return {
        token: newUser.token,
        uid: newUser.uid
    };
};

export const logoutUser = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
};
