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
      "pages_manage_metadata",
      "business_management"
    ],
    redirectUri: `${BASE_URL}/social/facebook/callback`,
    display: "popup",
    responseType: "code",
  },
  linkedin: {
    name: "LinkedIn",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social", "w_organization_social"],
    redirectUri: `${BASE_URL}/social/linkedin/callback`,
    responseType: "code",
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
  if (platform === 'facebook') {
    baseUrl = 'https://www.facebook.com/v16.0/dialog/oauth';
  } else if (platform === 'linkedin') {
    baseUrl = 'https://www.linkedin.com/oauth/v2/authorization';
  } else {
    baseUrl = `${BASE_URL}/social/${platform}/connect`;
  }

  const url = new URL(baseUrl);
  
  // Add common OAuth parameters
  if (platform === 'facebook' || platform === 'linkedin') {
    url.searchParams.set('client_id', platform === 'facebook' ? 
      import.meta.env.VITE_FACEBOOK_APP_ID : 
      import.meta.env.VITE_LINKEDIN_CLIENT_ID
    );
    url.searchParams.set('redirect_uri', provider.redirectUri);
    url.searchParams.set('response_type', provider.responseType || 'code');
    url.searchParams.set('scope', provider.scopes.join(' '));
  }

  // Add token and state
  if (token) {
    url.searchParams.set('token', token);
  }
  url.searchParams.set('state', state);

  // Platform specific parameters
  if (platform === 'facebook') {
    url.searchParams.set('display', 'popup');
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

// Clean up old states periodically (every 5 minutes)
setInterval(() => {
  stateStore.clear();
}, 5 * 60 * 1000);
