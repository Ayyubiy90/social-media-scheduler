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

  const refreshAccounts = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const accounts = await socialMediaService.getConnectedAccounts();
      setConnectedAccounts(accounts);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch connected accounts"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const connectAccount = async (platform: string) => {
    try {
      await socialMediaService.connectAccount(platform);
      await refreshAccounts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect account"
      );
      throw err;
    }
  };

  const disconnectAccount = async (platform: string) => {
    try {
      await socialMediaService.disconnectAccount(platform);
      await refreshAccounts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect account"
      );
      throw err;
    }
  };

  const publishPost = async (
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PostResult> => {
    setLoading(true);
    try {
      const result = await socialMediaService.publishPost(
        platform,
        content,
        mediaUrls
      );
      setError(null);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to publish post";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validatePost = async (
    platform: string,
    content: string,
    mediaUrls?: string[]
  ) => {
    try {
      const result = await socialMediaService.validatePost(
        platform,
        content,
        mediaUrls
      );
      setError(null);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to validate post";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getPostPreview = async (platform: string, content: string) => {
    try {
      const preview = await socialMediaService.getPostPreview(
        platform,
        content
      );
      setError(null);
      return preview;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get post preview";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getPlatformLimits = async (platform: string) => {
    try {
      const limits = await socialMediaService.getPlatformLimits(platform);
      setError(null);
      return limits;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get platform limits";
      setError(errorMessage);
      throw new Error(errorMessage);
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
