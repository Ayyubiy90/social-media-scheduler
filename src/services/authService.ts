import axios from "axios";

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
  token: string;
  message: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const handleApiError = (error: unknown): never => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("An unexpected error occurred");
};

export const loginUser = async (credentials: Credentials): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      credentials,
      {
        withCredentials: true, // Important for handling cookies
      }
    );
    const userData = response.data;

    if (!userData.token || !userData.uid) {
      throw new Error("Invalid response from server: missing token or uid");
    }

    // Store the token in localStorage for API requests
    localStorage.setItem("token", userData.token);
    localStorage.setItem("uid", userData.uid);

    return {
      token: userData.token,
      uid: userData.uid,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const registerUser = async (userData: Credentials): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      userData,
      {
        withCredentials: true, // Important for handling cookies
      }
    );
    const newUser = response.data;

    if (!newUser.token || !newUser.uid) {
      throw new Error("Invalid response from server: missing token or uid");
    }

    // Store the token in localStorage for API requests
    localStorage.setItem("token", newUser.token);
    localStorage.setItem("uid", newUser.uid);

    return {
      token: newUser.token,
      uid: newUser.uid,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await axios.post(`${API_URL}/auth/logout`, null, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless of server response
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
  }
};

// Configure axios defaults for all requests
axios.defaults.withCredentials = true; // Enable sending cookies with all requests
