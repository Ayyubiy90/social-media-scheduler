export interface SocialAuthProvider {
  name: string;
  scopes: string[];
  redirectUri: string;
  display?: string;
  authUrl?: string;
  responseType?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socialAuthProviders: Record<string, SocialAuthProvider> = {
  twitter: {
    name: "Twitter",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    redirectUri: `${BASE_URL}/social/twitter/callback`,
    responseType: "code",
  },
  facebook: {
    name: "Facebook",
    scopes: [
      "email",
      "public_profile",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
    ],
    redirectUri: `${BASE_URL}/social/facebook/callback`,
    display: "popup",
    responseType: "code",
    authUrl: `${BASE_URL}/social/facebook/connect`,
  },
  linkedin: {
    name: "LinkedIn",
    scopes: ["r_emailaddress", "r_liteprofile", "w_member_social"],
    redirectUri: `${BASE_URL}/social/linkedin/callback`,
    responseType: "code",
    authUrl: `${BASE_URL}/social/linkedin/connect`,
  },
  instagram: {
    name: "Instagram",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    redirectUri: `${BASE_URL}/social/instagram/callback`,
    display: "popup",
    responseType: "code",
  },
};

// Store generated states in memory for validation
const stateStore = new Set<string>();

export const getAuthUrl = (platform: string, token?: string): string => {
  const provider = socialAuthProviders[platform];
  if (!provider) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  const state = generateState();
  stateStore.add(state);

  // Use provider's authUrl if available, otherwise construct default URL
  const baseUrl = provider.authUrl || `${BASE_URL}/social/${platform}/connect`;
  
  // Add token to URL if provided
  const url = new URL(baseUrl);
  if (token) {
    url.searchParams.set('token', token);
  }
  url.searchParams.set('state', state);

  return url.toString();
};

const generateState = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const validateState = (state: string): boolean => {
  const isValid = stateStore.has(state);
  if (isValid) {
    stateStore.delete(state);
  }
  return isValid;
};

// Clean up old states periodically (every 5 minutes)
setInterval(() => {
  stateStore.clear();
}, 5 * 60 * 1000);
