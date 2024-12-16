import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import {
  socialMediaService,
  SocialMediaAccount,
  PostResult,
} from "../services/socialMediaService";

interface SocialMediaContextType {
  connectedAccounts: SocialMediaAccount[];
  loading: boolean;
  error: string | null;
  connectAccount: (platform: string) => Promise<void>;
  disconnectAccount: (platform: string) => Promise<void>;
  publishPost: (
    platform: string,
    content: string,
    mediaUrls?: string[]
  ) => Promise<PostResult>;
  validatePost: (
    platform: string,
    content: string,
    mediaUrls?: string[]
  ) => Promise<{ valid: boolean; errors?: string[] }>;
  getPostPreview: (platform: string, content: string) => Promise<string>;
  refreshAccounts: () => Promise<void>;
  getPlatformLimits: (platform: string) => Promise<{
    characterLimit: number;
    mediaLimit: number;
    mediaTypes: string[];
    rateLimit: {
      posts: number;
      timeWindow: string;
    };
  }>;
}

const SocialMediaContext = createContext<SocialMediaContextType | undefined>(
  undefined
);

export function SocialMediaProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [connectedAccounts, setConnectedAccounts] = useState<
    SocialMediaAccount[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if URL contains OAuth error
  const checkForOAuthError = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError).replace(/_/g, " "));
      // Remove error from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const accounts = await socialMediaService.getConnectedAccounts();
      setConnectedAccounts(accounts);
      setError(null);
    } catch (err) {
      // Don't show error for auth-related issues during Twitter flow
      if (localStorage.getItem("twitterConnecting") === "true") {
        return;
      }
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch connected accounts";
      console.error("Error fetching connected accounts:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callbacks and user changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasCallback = urlParams.has("oauth_token") || urlParams.has("code");
    const wasConnectingTwitter =
      localStorage.getItem("twitterConnecting") === "true";

    if (hasCallback && wasConnectingTwitter) {
      // This is a Twitter OAuth callback
      localStorage.removeItem("twitterConnecting");
      setTimeout(() => {
        refreshAccounts();
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      }, 1000);
    } else if (wasConnectingTwitter) {
      // Twitter connection was attempted but failed
      localStorage.removeItem("twitterConnecting");
      setError("Twitter connection failed or was cancelled");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      // Normal mount or user change
      checkForOAuthError();
      if (user?.uid) {
        refreshAccounts();
      }
    }
  }, [user?.uid, checkForOAuthError, refreshAccounts]);

  const connectAccount = async (platform: string) => {
    setLoading(true);
    setError(null);
    try {
      // For Twitter, we don't need to check auth token as it uses OAuth
      if (platform === "twitter") {
        await socialMediaService.connectAccount(platform);
        return;
      }

      // For other platforms, ensure user is authenticated
      if (!user?.uid) {
        throw new Error("You must be logged in to connect social accounts");
      }

      await socialMediaService.connectAccount(platform);
      await refreshAccounts();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to connect ${platform}`;
      console.error(`Error connecting ${platform}:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (platform: string) => {
    setLoading(true);
    setError(null);
    try {
      await socialMediaService.disconnectAccount(platform);
      await refreshAccounts();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to disconnect ${platform}`;
      console.error(`Error disconnecting ${platform}:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async (
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PostResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await socialMediaService.publishPost(
        platform,
        content,
        mediaUrls
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to publish post";
      console.error("Error publishing post:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validatePost = async (
    platform: string,
    content: string,
    mediaUrls?: string[]
  ) => {
    setError(null);
    try {
      const result = await socialMediaService.validatePost(
        platform,
        content,
        mediaUrls
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to validate post";
      console.error("Error validating post:", err);
      setError(errorMessage);
      throw err;
    }
  };

  const getPostPreview = async (platform: string, content: string) => {
    setError(null);
    try {
      const preview = await socialMediaService.getPostPreview(
        platform,
        content
      );
      return preview;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get post preview";
      console.error("Error getting post preview:", err);
      setError(errorMessage);
      throw err;
    }
  };

  const getPlatformLimits = async (platform: string) => {
    setError(null);
    try {
      const limits = await socialMediaService.getPlatformLimits(platform);
      return limits;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get platform limits";
      console.error("Error getting platform limits:", err);
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <SocialMediaContext.Provider
      value={{
        connectedAccounts,
        loading,
        error,
        connectAccount,
        disconnectAccount,
        publishPost,
        validatePost,
        getPostPreview,
        refreshAccounts,
        getPlatformLimits,
      }}>
      {children}
    </SocialMediaContext.Provider>
  );
}

export function useSocialMedia() {
  const context = useContext(SocialMediaContext);
  if (context === undefined) {
    throw new Error("useSocialMedia must be used within a SocialMediaProvider");
  }
  return context;
}
