import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";

// Initialize providers with custom parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");

export const twitterProvider = new TwitterAuthProvider();

// Add custom parameters for each provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

facebookProvider.setCustomParameters({
  display: "popup",
});
