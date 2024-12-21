import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../services/authService";
import { subscribeToAuthChanges, logoutUser } from "../services/authService";
import { clearProfilePictureCache } from "../hooks/useProfilePicture";

interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUserChange = (newUser: User | null) => {
    setUser(newUser);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(handleUserChange);
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
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

  return (
    <UserContext.Provider value={{ user, loading, logout, refreshUser }}>
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
