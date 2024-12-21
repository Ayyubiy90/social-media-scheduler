export interface SocialAuthProvider {
  name: string;
  scopes: string[];
  redirectUri: string;
  display?: string;
  authUrl?: string;
  responseType?: string;
  authorizationParams?: {
    access_type?: string;
    response_type?: string;
    code_challenge_method?: string;
  };
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socialAuthProviders: Record<string, SocialAuthProvider> = {
  twitter: {
    name: "Twitter",
    scopes: ["users.read"],
    redirectUri: `${BASE_URL}/social/twitter/callback`,
    responseType: "code",
    display: "popup",
  },
  facebook: {
    name: "Facebook",
    scopes: ["public_profile"],
    redirectUri: `${BASE_URL}/social/facebook/callback`,
    display: "popup",
    responseType: "code",
  },
  linkedin: {
    name: "LinkedIn",
    scopes: ["openid", "profile", "email", "r_basicprofile"],
    redirectUri: `${BASE_URL}/social/linkedin/callback`,
    responseType: "code",
    display: "popup"
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

// PKCE helper functions
const generateCodeVerifier = (): string => {
  const length = 64;
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const getAuthUrl = async (
  platform: string,
  token?: string
): Promise<string> => {
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
  } else if (platform === "linkedin") {
    url.searchParams.set("client_id", import.meta.env.VITE_LINKEDIN_CLIENT_ID);
    url.searchParams.set("redirect_uri", provider.redirectUri);
    url.searchParams.set("response_type", provider.responseType || "code");
    url.searchParams.set("scope", provider.scopes.join(" "));
  } else if (platform === "twitter") {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Pass code verifier through the URL
    url.searchParams.set("client_id", import.meta.env.VITE_TWITTER_CLIENT_ID);
    url.searchParams.set("code_verifier", codeVerifier);
    url.searchParams.set("redirect_uri", provider.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", provider.scopes.join(" "));
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", state);
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
