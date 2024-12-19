import axiosInstance from "../config/axios";
import { getAuth } from "firebase/auth";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken(true);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.uid);
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    throw new Error("Failed to get authentication token");
  }
};

export const socialMediaService = {
  async getConnectedAccounts(): Promise<SocialMediaAccount[]> {
    try {
      const headers = await getAuthHeaders();
      console.log('Request headers:', headers); // Add this debug log
      const response = await axiosInstance.get<SocialMediaAccount[]>(
        `${API_URL}/social/connected-accounts`,
        headers
      );
      console.log('Connected accounts response:', response.data); // Add this debug log
      return response.data;
    } catch (error) {
      console.error("Error getting connected accounts:", error);
      throw error;
    }
  },  

  async connectAccount(platform: string): Promise<void> {
    try {
      console.log(`[${platform}] Starting connection process...`);
      const headers = await getAuthHeaders();
      const token = headers.headers.Authorization.split(" ")[1];

      if (!token) {
        throw new Error("No valid authentication provided");
      }

      // Use popup with token for all platforms
      const width = 600;
      const height = 800; // Increased height for better visibility
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Store token for OAuth flow
      localStorage.setItem("token", token);
      localStorage.setItem(`${platform}Connecting`, "true");

      // Get auth URL from provider configuration
      const { getAuthUrl } = await import("../config/socialAuthProviders");
      const authUrl = getAuthUrl(platform, token);

      console.log(`[${platform}] Opening popup with URL:`, authUrl);

      // Create a centered popup window
      const popup = window.open(
        authUrl,
        `Connect ${platform}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      return new Promise((resolve, reject) => {
        let popupClosed = false;
        let messageHandler: ((event: MessageEvent) => void) | null = null;
        let checkInterval: NodeJS.Timeout | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        const cleanup = () => {
          if (messageHandler) {
            window.removeEventListener("message", messageHandler);
          }
          if (checkInterval) {
            clearInterval(checkInterval);
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          if (popup && !popup.closed) {
            popup.close();
          }
          // Clean up platform-specific connection state
          localStorage.removeItem(`${platform}Connecting`);
        };

        // Listen for messages from the popup
        messageHandler = (event: MessageEvent) => {
          console.log(
            `[${platform}] Received event from origin:`,
            event.origin,
            "Expected:",
            API_URL
          );
          console.log(`[${platform}] Event data:`, event.data);

          if (event.origin !== API_URL) {
            console.log(
              `[${platform}] Ignoring message from unknown origin:`,
              event.origin
            );
            return;
          }

          try {
            let data;
            if (typeof event.data === "string") {
              data = JSON.parse(event.data);
            } else {
              data = event.data;
            }

            console.log(`[${platform}] Parsed message data:`, data);

            if (data.type === "oauth_callback") {
              cleanup();
              popupClosed = true;

              if (data.status === "success") {
                console.log(`[${platform}] OAuth successful`);
                resolve();
              } else {
                console.error(`[${platform}] OAuth failed:`, data.error);
                reject(
                  new Error(data.error || `Failed to connect ${platform}`)
                );
              }
            }
          } catch (err) {
            console.error(
              `[${platform}] Error processing OAuth callback:`,
              err
            );
            console.error(`[${platform}] Raw event data:`, event.data);
          }
        };

        // Add error event listener to popup
        if (popup) {
          popup.onerror = (error) => {
            console.error(`[${platform}] Popup error:`, error);
          };
        }

        window.addEventListener("message", messageHandler);

        // Check if popup is closed
        checkInterval = setInterval(() => {
          if (!popup || popup.closed) {
            console.log(
              `[${platform}] Popup closed, verifying connection status`
            );
            cleanup();
            popupClosed = true;

            // Verify connection status after popup closes
            this.getConnectedAccounts()
              .then((accounts) => {
                const isConnected = accounts.some(
                  (acc) => acc.platform === platform && acc.connected
                );
                if (isConnected) {
                  console.log(`[${platform}] Connection verified`);
                  localStorage.removeItem(`${platform}Connecting`);
                  resolve();
                } else {
                  console.error(`[${platform}] Connection verification failed`);
                  localStorage.removeItem(`${platform}Connecting`);
                  reject(
                    new Error(
                      `Failed to connect ${platform}. Please check your app permissions and try again.`
                    )
                  );
                }
              })
              .catch((error) => {
                console.error(
                  `[${platform}] Error verifying connection:`,
                  error
                );
                reject(error);
              });
          }
        }, 500);

        // Timeout after 2 minutes
        timeoutId = setTimeout(() => {
          if (!popupClosed) {
            console.error(`[${platform}] Connection timeout`);
            cleanup();
            reject(new Error("Connection timeout"));
          }
        }, 2 * 60 * 1000);
      });
    } catch (error) {
      console.error(`[${platform}] Error connecting:`, error);
      throw error;
    }
  },

  // Disconnect account
  async disconnectAccount(platform: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      await axiosInstance.delete(
        `${API_URL}/social/${platform}/disconnect`,
        headers
      );
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
      const headers = await getAuthHeaders();
      const response = await axiosInstance.post<PostResult>(
        `${API_URL}/social/${platform}/publish`,
        {
          content,
          mediaUrls,
        },
        headers
      );
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { error: string } } };
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw error;
    }
  },

  // Get platform-specific post preview
  async getPostPreview(platform: string, content: string): Promise<string> {
    try {
      const headers = await getAuthHeaders();
      const response = await axiosInstance.post<{ preview: string }>(
        `${API_URL}/social/${platform}/preview`,
        { content },
        headers
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
  ): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const headers = await getAuthHeaders();
      const response = await axiosInstance.post<{
        valid: boolean;
        errors?: string[];
      }>(
        `${API_URL}/social/${platform}/validate`,
        {
          content,
          mediaUrls,
        },
        headers
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
      const headers = await getAuthHeaders();
      const response = await axiosInstance.get<PlatformLimits>(
        `${API_URL}/social/${platform}/limits`,
        headers
      );
      return response.data;
    } catch (error) {
      console.error("Error getting platform limits:", error);
      throw error;
    }
  },
};
