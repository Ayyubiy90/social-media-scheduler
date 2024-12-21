import { useState, useEffect } from 'react';
import { getProfilePicture, isFirestoreProfileUrl, getUserIdFromProfileUrl } from '../services/storageService';

// Cache for profile pictures
const profilePictureCache = new Map<string, string>();

export function useProfilePicture(photoURL: string | null) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfilePicture = async () => {
      if (!photoURL) {
        setProfilePicture(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isFirestoreProfileUrl(photoURL)) {
          const userId = getUserIdFromProfileUrl(photoURL);
          if (!userId) {
            throw new Error('Invalid profile picture URL');
          }

          // Check cache first
          if (profilePictureCache.has(userId)) {
            setProfilePicture(profilePictureCache.get(userId) || null);
            return;
          }

          // Load from Firestore
          const picture = await getProfilePicture(userId);
          if (picture) {
            profilePictureCache.set(userId, picture);
            setProfilePicture(picture);
          } else {
            setProfilePicture(null);
          }
        } else {
          // Regular URL
          setProfilePicture(photoURL);
        }
      } catch (err) {
        console.error('Error loading profile picture:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile picture');
        setProfilePicture(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfilePicture();
  }, [photoURL]);

  return { profilePicture, loading, error };
}

// Helper function to clear the cache when needed (e.g., after uploading a new picture)
export const clearProfilePictureCache = (userId?: string) => {
  if (userId) {
    profilePictureCache.delete(userId);
  } else {
    profilePictureCache.clear();
  }
};
