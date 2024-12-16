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

const mapFirebaseUserToUser = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  const token = await firebaseUser.getIdToken();
  // Store token in localStorage
  localStorage.setItem("token", token);
  return {
    token,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
};

const getErrorMessage = async (
  error: AuthError,
  email: string
): Promise<string> => {
  // First check if account is locked
  const { canAttempt, remainingTime } = await loginAttemptService.checkAttempts(
    email
  );
  if (!canAttempt && remainingTime) {
    return `Please wait ${remainingTime} seconds before trying again`;
  }

  // Get base error message
  let message = "";
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      message = "Incorrect email or password";
      break;
    case "auth/user-not-found":
      message = "No account found with this email";
      break;
    case "auth/invalid-email":
      message = "Invalid email address";
      break;
    case "auth/too-many-requests":
      message = "Too many failed attempts. Please try again later";
      break;
    case "auth/requires-recent-login":
      message = "Please log in again to change your password";
      break;
    default:
      message = "Authentication failed. Please try again";
  }

  // Add remaining attempts if not locked and error is related to credentials
  if (
    canAttempt &&
    (error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found")
  ) {
    const remainingAttempts = await loginAttemptService.getRemainingAttempts(
      email
    );
    if (remainingAttempts > 0) {
      message = `${message} (${remainingAttempts} attempts remaining)`;
    }
  }

  return message;
};

const handleApiError = async (
  error: unknown,
  email: string | undefined = undefined
): Promise<never> => {
  let errorMessage = "";

  if (error && typeof error === "object" && "code" in error && email) {
    errorMessage = await getErrorMessage(error as AuthError, email);
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unexpected error occurred";
  }

  throw new Error(errorMessage);
};

export const loginUser = async (credentials: Credentials): Promise<User> => {
  try {
    // Check if login attempts are allowed
    const { canAttempt, remainingTime } =
      await loginAttemptService.checkAttempts(credentials.email);

    if (!canAttempt) {
      throw new Error(
        `Please wait ${remainingTime} seconds before trying again`
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
      !error.message.includes("Please wait")
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
  } catch (error) {
    console.error("Logout error:", error);
    // Still attempt to clear local state even if backend logout fails
    const auth = getAuth();
    await signOut(auth);
    localStorage.removeItem("token");
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
