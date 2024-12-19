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
    scopes: ["tweet.read", "tweet.write", "users.read"],
    redirectUri: `${BASE_URL}/social/twitter/callback`,
    responseType: "code",
    display: "popup",
  },
  facebook: {
    name: "Facebook",
    scopes: [
      "public_profile",
      "email"
    ],
    redirectUri: `${BASE_URL}/social/facebook/callback`,
    display: "popup",
    responseType: "code",
  },
  

  linkedin: {
    name: "LinkedIn",
    scopes: [
      "openid",
      "profile",
      "email",
      "w_member_social"
    ],
    redirectUri: `${BASE_URL}/social/linkedin/callback`,
    responseType: "code",
    display: "popup",
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

  // Construct OAuth URL based on platform
  let baseUrl;
  if (platform === "facebook") {
    baseUrl = "https://www.facebook.com/v18.0/dialog/oauth";
  } else if (platform === "linkedin") {
    baseUrl = "https://www.linkedin.com/oauth/v2/authorization";
  } else {
    baseUrl = `${BASE_URL}/social/${platform}/connect`;
  }

  const url = new URL(baseUrl);

  // Add common OAuth parameters
  if (platform === "facebook") {
    url.searchParams.set("client_id", import.meta.env.VITE_FACEBOOK_APP_ID);
    url.searchParams.set("redirect_uri", provider.redirectUri);
    url.searchParams.set("response_type", provider.responseType || "code");
    url.searchParams.set("scope", provider.scopes.join(" "));
    url.searchParams.set("auth_type", "rerequest");
    url.searchParams.set("return_scopes", "true");
    url.searchParams.set("enable_profile_selector", "true");
    url.searchParams.set("debug", "true");
  } else if (platform === "linkedin") {
    url.searchParams.set("client_id", import.meta.env.VITE_LINKEDIN_CLIENT_ID);
    url.searchParams.set("redirect_uri", provider.redirectUri);
    url.searchParams.set("response_type", provider.responseType || "code");
    url.searchParams.set("scope", provider.scopes.join(" "));
  } else if (platform === "twitter") {
    url.searchParams.set("oauth_callback", provider.redirectUri);
    url.searchParams.set("x_auth_access_type", "write");
    url.searchParams.set("force_login", "true");
  }

  // Add token and state
  if (token) {
    url.searchParams.set("token", token);
  }
  url.searchParams.set("state", state);

  // Set display parameter for all platforms that support it
  if (provider.display) {
    url.searchParams.set("display", provider.display);
  }

  console.log(`[${platform}] Generated OAuth URL:`, url.toString());
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

// Clean up old states periodically (every 15 minutes)
setInterval(() => {
  stateStore.clear();
}, 15 * 60 * 1000);
