import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Credentials } from "../services/authService";
import {
  subscribeToAuthChanges,
  logoutUser,
  registerUser,
  loginUser,
} from "../services/authService";
import { clearProfilePictureCache } from "../hooks/useProfilePicture";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUserChange = (newUser: User | null) => {
    setUser(newUser);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(handleUserChange);
    return () => unsubscribe();
  }, []);

  const login = async (credentials: Credentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await loginUser(credentials);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: Credentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await registerUser(credentials);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    // Clear the profile picture cache for the current user
    if (user?.uid) {
      clearProfilePictureCache(user.uid);
    }
    // Force a re-render of components using the user context
    setUser(user ? { ...user } : null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
