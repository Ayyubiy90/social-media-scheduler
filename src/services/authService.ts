import axios from "axios";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import {
  googleProvider,
  facebookProvider,
  twitterProvider,
} from "../config/authProviders";
import { loginAttemptService } from "./loginAttemptService";

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

const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later";
    case "auth/requires-recent-login":
      return "Please log in again to change your password";
    default:
      return "Authentication failed. Please try again";
  }
};

const handleApiError = async (
  error: unknown,
  email: string | undefined = undefined
): Promise<never> => {
  let errorMessage = "";

  if (error && typeof error === "object" && "code" in error) {
    errorMessage = getErrorMessage(error as AuthError);
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unexpected error occurred";
  }

  // Get remaining attempts for login errors
  if (
    email &&
    (errorMessage.includes("Incorrect") || errorMessage.includes("No account"))
  ) {
    const remainingAttempts = await loginAttemptService.getRemainingAttempts(
      email
    );
    if (remainingAttempts > 0) {
      errorMessage += `\n\nRemaining attempts: ${remainingAttempts}`;
    } else {
      const { remainingTime } = await loginAttemptService.checkAttempts(email);
      if (remainingTime) {
        errorMessage = `Account is temporarily locked. Please wait ${remainingTime} seconds before trying again.`;
      }
    }
  }

  throw new Error(errorMessage);
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
    // Check if login attempts are allowed
    const { canAttempt, remainingTime } =
      await loginAttemptService.checkAttempts(credentials.email);

    if (!canAttempt) {
      throw new Error(
        `Account is temporarily locked. Please wait ${remainingTime} seconds before trying again.`
      );
    }

    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = await mapFirebaseUserToUser(userCredential.user);

    // Record successful login attempt
    await loginAttemptService.recordAttempt(credentials.email, true);

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
    // Record failed login attempt if it's not a lockout error
    if (
      credentials.email &&
      error instanceof Error &&
      !error.message.includes("temporarily locked")
    ) {
      await loginAttemptService.recordAttempt(credentials.email, false);
    }

    throw await handleApiError(error, credentials.email);
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
    throw await handleApiError(error);
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
    throw await handleApiError(error);
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

    // Create credential with current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    // Re-authenticate user
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    // Get a fresh token
    const token = await user.getIdToken();

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
    throw await handleApiError(error);
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
