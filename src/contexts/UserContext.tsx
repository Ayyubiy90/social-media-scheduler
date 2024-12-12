import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  subscribeToAuthChanges,
  socialLogin,
  User,
} from "../services/authService";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string }) => Promise<void>;
  socialLogin: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("An unexpected error occurred");
    }
    throw error;
  };

  const clearError = () => setError(null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      clearError();
      setLoading(true);
      const userData = await loginUser(credentials);
      setUser(userData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string }) => {
    try {
      clearError();
      setLoading(true);
      const newUser = await registerUser(userData);
      setUser(newUser);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      clearError();
      setLoading(true);
      const userData = await socialLogin(provider);
      setUser(userData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      clearError();
      setLoading(true);
      await logoutUser();
      setUser(null);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        socialLogin: handleSocialLogin,
        logout,
        clearError,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
