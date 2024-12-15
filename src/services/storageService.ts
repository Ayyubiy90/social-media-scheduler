import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, updateProfile } from "firebase/auth";
import app from "../config/firebase";

let storage: ReturnType<typeof getStorage>;
try {
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase Storage is not initialized:", error);
}

export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is currently logged in");
    }

    if (!storage) {
      throw new Error("Firebase Storage is not available. Profile picture cannot be uploaded at this time.");
    }

    // Create a reference to the profile picture in Firebase Storage
    const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update the user's profile with the new photo URL
    await updateProfile(user, {
      photoURL: downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    // If Firebase Storage is not available, use a data URL as a fallback
    if (!storage) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            updateProfile(user, { photoURL: dataUrl })
              .then(() => resolve(dataUrl))
              .catch(reject);
          } else {
            reject(new Error("No user is currently logged in"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    throw error;
  }
};
