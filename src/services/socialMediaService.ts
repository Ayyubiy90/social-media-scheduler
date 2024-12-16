import axiosInstance from "../config/axios";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socialMediaService = {
  // Get connected accounts
  async getConnectedAccounts(): Promise<SocialMediaAccount[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axiosInstance.get<SocialMediaAccount[]>(
        `${API_URL}/social/connected-accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting connected accounts:", error);
      // Return a default structure with all platforms disconnected
      return [
        { platform: 'twitter', connected: false },
        { platform: 'facebook', connected: false },
        { platform: 'linkedin', connected: false },
        { platform: 'instagram', connected: false }
      ];
    }
  },

  // Connect account
  async connectAccount(platform: string): Promise<void> {
    try {
      // For Twitter, use a direct redirect in the same window
      if (platform === 'twitter') {
        const currentUrl = window.location.href;
        localStorage.setItem('returnUrl', currentUrl);
        // Add state parameter to track the connection attempt
        localStorage.setItem('twitterConnecting', 'true');
        window.location.href = `${API_URL}/social/twitter/connect`;
        return;
      }

      // For other platforms, we need the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to connect social accounts');
      }

      // For other platforms, use popup
      const width = 600;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        `${API_URL}/social/${platform}/connect`,
        `Connect ${platform}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      return new Promise((resolve, reject) => {
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            // Verify connection status
            this.getConnectedAccounts()
              .then((accounts) => {
                const isConnected = accounts.some(
                  (acc) => acc.platform === platform && acc.connected
                );
                if (isConnected) {
                  resolve();
                } else {
                  reject(new Error(`Failed to connect ${platform}`));
                }
              })
              .catch(reject);
          }
        }, 500);

        // Handle OAuth callback through window message
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== API_URL) return;

          try {
            const data = JSON.parse(event.data);
            if (data.type === "oauth_callback") {
              window.removeEventListener("message", handleMessage);
              if (data.error) {
                reject(new Error(data.error));
              } else {
                resolve();
              }
              popup.close();
            }
          } catch (error) {
            console.error("Error handling OAuth callback:", error);
          }
        };

        window.addEventListener("message", handleMessage);

        // Timeout after 5 minutes
        setTimeout(() => {
          window.removeEventListener("message", handleMessage);
          clearInterval(checkPopup);
          popup.close();
          reject(new Error("Connection timeout"));
        }, 5 * 60 * 1000);
      });
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      throw error;
    }
  },

  // Disconnect account
  async disconnectAccount(platform: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      await axiosInstance.delete(`${API_URL}/social/${platform}/disconnect`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      throw error;
    }
  },

  // Publish post to platform
  async publishPost(
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PostResult> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axiosInstance.post<PostResult>(
        `${API_URL}/social/${platform}/publish`,
        {
          content,
          mediaUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axiosInstance.post<PostPreview>(
        `${API_URL}/social/${platform}/preview`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.preview;
    } catch (error) {
      console.error("Error getting post preview:", error);
      return content;
    }
  },

  // Validate post content for platform
  async validatePost(
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PostValidation> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axiosInstance.post<PostValidation>(
        `${API_URL}/social/${platform}/validate`,
        {
          content,
          mediaUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error validating post:", error);
      return { valid: false, errors: ["Validation failed"] };
    }
  },

  // Get platform posting limits and guidelines
  async getPlatformLimits(platform: string): Promise<PlatformLimits> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axiosInstance.get<PlatformLimits>(
        `${API_URL}/social/${platform}/limits`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting platform limits:", error);
      throw error;
    }
  },
};
