import axios from "axios";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updatePassword,
  User as FirebaseUser,
} from "firebase/auth";
import {
  googleProvider,
  facebookProvider,
  twitterProvider,
} from "../config/authProviders";

export interface User {
  token: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
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

const mapFirebaseUserToUser = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  const token = await firebaseUser.getIdToken();
  return {
    token,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
};

export const loginUser = async (credentials: Credentials): Promise<User> => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = await mapFirebaseUserToUser(userCredential.user);

    // Get a fresh token
    const token = await userCredential.user.getIdToken();

    // Verify with backend
    await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      { token },
      { withCredentials: true }
    );

    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const registerUser = async (userData: Credentials): Promise<User> => {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = await mapFirebaseUserToUser(userCredential.user);

    // Get a fresh token
    const token = await userCredential.user.getIdToken();

    // Register with backend
    await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      { token },
      { withCredentials: true }
    );

    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const socialLogin = async (provider: string): Promise<User> => {
  try {
    const auth = getAuth();
    let selectedProvider;

    switch (provider) {
      case "google":
        selectedProvider = googleProvider;
        break;
      case "facebook":
        selectedProvider = facebookProvider;
        break;
      case "twitter":
        selectedProvider = twitterProvider;
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const result = await signInWithPopup(auth, selectedProvider);
    const user = await mapFirebaseUserToUser(result.user);

    // Get a fresh token
    const token = await result.user.getIdToken();

    // Verify with backend
    await axios.post<AuthResponse>(
      `${API_URL}/auth/social-login`,
      { token, provider },
      { withCredentials: true }
    );

    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    if (token) {
      // Clear backend session
      await axios.post(`${API_URL}/auth/logout`, null, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Sign out from Firebase
    await signOut(auth);

    // Clear any stored session data
    localStorage.removeItem("user");
    sessionStorage.clear();
  } catch (error) {
    console.error("Logout error:", error);
    // Still attempt to clear local state even if backend logout fails
    const auth = getAuth();
    await signOut(auth);
    localStorage.removeItem("user");
    sessionStorage.clear();
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error("No user is currently logged in");
    }

    // Re-authenticate user with current password
    const credential = await signInWithEmailAndPassword(
      auth,
      user.email,
      currentPassword
    );

    // Update password
    await updatePassword(credential.user, newPassword);

    // Get a fresh token
    const token = await credential.user.getIdToken();

    // Notify backend of password change
    await axios.post(
      `${API_URL}/auth/change-password`,
      { token },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw handleApiError(error);
  }
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await mapFirebaseUserToUser(firebaseUser);
        callback(user);
      } catch (error) {
        console.error("Error in auth state change:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Configure axios defaults
axios.defaults.withCredentials = true;
