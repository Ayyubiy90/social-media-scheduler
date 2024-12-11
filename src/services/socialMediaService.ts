import axios from "axios";

export interface SocialMediaAccount {
  platform: "facebook" | "twitter" | "linkedin" | "instagram";
  connected: boolean;
  accountName?: string;
  profileUrl?: string;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

interface PlatformLimits {
  characterLimit: number;
  mediaLimit: number;
  mediaTypes: string[];
  rateLimit: {
    posts: number;
    timeWindow: string;
  };
}

interface PostValidation {
  valid: boolean;
  errors?: string[];
}

interface PostPreview {
  preview: string;
}

interface ApiError {
  error: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const socialMediaService = {
  // Get connected accounts
  async getConnectedAccounts(): Promise<SocialMediaAccount[]> {
    const token = localStorage.getItem("token");
    const response = await axios.get<SocialMediaAccount[]>(
      `${API_URL}/auth/connected-accounts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Connect account
  async connectAccount(platform: string): Promise<void> {
    const token = localStorage.getItem("token");
    window.location.href = `${API_URL}/auth/${platform}?token=${token}`;
  },

  // Disconnect account
  async disconnectAccount(platform: string): Promise<void> {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/auth/disconnect/${platform}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Publish post to platform
  async publishPost(
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PostResult> {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post<PostResult>(
        `${API_URL}/social/${platform}/publish`,
        {
          content,
          mediaUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: ApiError } };
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw error;
    }
  },

  // Get platform-specific post preview
  async getPostPreview(platform: string, content: string): Promise<string> {
    const token = localStorage.getItem("token");
    const response = await axios.post<PostPreview>(
      `${API_URL}/social/${platform}/preview`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.preview;
  },

  // Validate post content for platform
  async validatePost(
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PostValidation> {
    const token = localStorage.getItem("token");
    const response = await axios.post<PostValidation>(
      `${API_URL}/social/${platform}/validate`,
      {
        content,
        mediaUrls,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get platform posting limits and guidelines
  async getPlatformLimits(platform: string): Promise<PlatformLimits> {
    const token = localStorage.getItem("token");
    const response = await axios.post<PlatformLimits>(
      `${API_URL}/social/${platform}/limits`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
