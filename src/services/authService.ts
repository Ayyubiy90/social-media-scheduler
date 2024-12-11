import axios from "axios";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

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

    // Verify with backend
    await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      { token: user.token },
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

    // Register with backend
    await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      { token: user.token },
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
    let authProvider;

    switch (provider) {
      case "google":
        authProvider = new GoogleAuthProvider();
        break;
      case "facebook":
        authProvider = new FacebookAuthProvider();
        break;
      case "twitter":
        authProvider = new TwitterAuthProvider();
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const result = await signInWithPopup(auth, authProvider);
    const user = await mapFirebaseUserToUser(result.user);

    // Verify with backend
    await axios.post<AuthResponse>(
      `${API_URL}/auth/social-login`,
      { token: user.token, provider },
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
      await axios.post(`${API_URL}/auth/logout`, null, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await mapFirebaseUserToUser(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};

// Configure axios defaults
axios.defaults.withCredentials = true;
