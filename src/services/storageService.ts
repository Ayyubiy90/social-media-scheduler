import { getAuth, updateProfile } from "firebase/auth";
import { doc, getFirestore, updateDoc, getDoc } from "firebase/firestore";

export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    if (!user) {
      throw new Error("No user is currently logged in");
    }

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Store the base64 image in Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      profilePicture: base64,
      profilePictureUpdatedAt: new Date().toISOString()
    });

    // Use a placeholder URL for the auth profile that indicates we should fetch from Firestore
    const placeholderUrl = `firestore://profile-pictures/${user.uid}`;
    
    // Update the user's profile with the placeholder URL
    await updateProfile(user, {
      photoURL: placeholderUrl
    });

    return base64;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

export const getProfilePicture = async (userId: string): Promise<string | null> => {
  try {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data?.profilePicture || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting profile picture:", error);
    return null;
  }
};

// Helper function to check if a URL is a Firestore profile picture URL
export const isFirestoreProfileUrl = (url: string): boolean => {
  return url.startsWith('firestore://profile-pictures/');
};

// Helper function to get user ID from Firestore profile URL
export const getUserIdFromProfileUrl = (url: string): string | null => {
  if (!isFirestoreProfileUrl(url)) return null;
  return url.split('/').pop() || null;
};
