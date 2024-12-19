require("dotenv").config();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const InstagramStrategy = require("passport-instagram").Strategy;
const admin = require("firebase-admin");
const db = require("../../firebaseConfig.cjs");

const CLIENT_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";

// Debug log to check environment variables
console.log("OAuth Configuration:", {
  twitter: {
    apiKeyExists: !!process.env.VITE_TWITTER_API_KEY,
    apiSecretExists: !!process.env.VITE_TWITTER_API_SECRET,
    callbackUrlExists: !!process.env.VITE_TWITTER_CALLBACK_URL,
  },
  facebook: {
    appIdExists: !!process.env.VITE_FACEBOOK_APP_ID,
    appSecretExists: !!process.env.VITE_FACEBOOK_APP_SECRET,
    callbackUrlExists: !!process.env.VITE_FACEBOOK_CALLBACK_URL,
  },
  linkedin: {
    clientIdExists: !!process.env.VITE_LINKEDIN_CLIENT_ID,
    clientSecretExists: !!process.env.VITE_LINKEDIN_CLIENT_SECRET,
    callbackUrlExists: !!process.env.VITE_LINKEDIN_CALLBACK_URL,
  },
});

// Configure Twitter Strategy
if (process.env.VITE_TWITTER_API_KEY && process.env.VITE_TWITTER_API_SECRET) {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.VITE_TWITTER_API_KEY,
        consumerSecret: process.env.VITE_TWITTER_API_SECRET,
        callbackURL: process.env.VITE_TWITTER_CALLBACK_URL || "http://localhost:5000/social/twitter/callback",
        includeEmail: true,
        passReqToCallback: true,
        userAuthorizationURL: "https://api.twitter.com/oauth/authorize",
        proxy: true
      },
      async (req, token, tokenSecret, profile, done) => {
        try {
          console.log("Twitter Auth Response:", {
            token,
            tokenSecret,
            profile: {
              id: profile.id,
              displayName: profile.displayName,
              username: profile.username,
              _json: profile._json,
            },
          });

          const userId = req.session?.userId;
          if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const idToken = authHeader.split("Bearer ")[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
                console.log("Retrieved user ID from token:", decodedToken.uid);
              } catch (error) {
                console.error("Error verifying ID token:", error);
                return done(new Error("User must be logged in to connect Twitter"), null);
              }
            } else {
              return done(new Error("User must be logged in to connect Twitter"), null);
            }
          }

          return done(null, {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            photos: profile.photos,
            token,
            tokenSecret,
          });
        } catch (error) {
          console.error("Twitter Strategy Error:", error);
          return done(error, null);
        }
      }
    )
  );
}

// Configure Facebook Strategy
if (process.env.VITE_FACEBOOK_APP_ID && process.env.VITE_FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.VITE_FACEBOOK_APP_ID,
        clientSecret: process.env.VITE_FACEBOOK_APP_SECRET,
        callbackURL: process.env.VITE_FACEBOOK_CALLBACK_URL || "http://localhost:5000/social/facebook/callback",
        profileFields: ["id", "displayName", "name", "email", "photos"],
        passReqToCallback: true,
        enableProof: true,
        state: false,
        scope: ["public_profile", "email"],
        display: "popup",
        version: "17.0",
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("Facebook Auth Response:", {
            accessToken,
            refreshToken,
            profile: {
              id: profile.id,
              displayName: profile.displayName,
              name: profile.name,
              _json: profile._json,
            },
          });

          const userId = req.session?.userId;
          if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const idToken = authHeader.split("Bearer ")[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
              } catch (error) {
                return done(new Error("User must be logged in to connect Facebook"), null);
              }
            } else {
              return done(new Error("User must be logged in to connect Facebook"), null);
            }
          }

          return done(null, {
            id: profile.id,
            displayName: profile.displayName,
            photos: profile.photos,
            accessToken,
            refreshToken,
            _json: profile._json,
          });
        } catch (error) {
          console.error("Facebook Strategy Error:", error);
          return done(error, null);
        }
      }
    )
  );
}

// Configure LinkedIn Strategy
if (process.env.VITE_LINKEDIN_CLIENT_ID && process.env.VITE_LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.VITE_LINKEDIN_CLIENT_ID,
        clientSecret: process.env.VITE_LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.VITE_LINKEDIN_CALLBACK_URL || "http://localhost:5000/social/linkedin/callback",
        passReqToCallback: true,
        scope: ["r_liteprofile", "r_emailaddress", "w_member_social"],
        state: true,
        proxy: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("LinkedIn Auth Response:", {
            accessToken,
            refreshToken,
            profile: {
              id: profile.id,
              displayName: profile.displayName,
              _json: profile._json,
            },
          });

          const userId = req.session?.userId;
          if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const idToken = authHeader.split("Bearer ")[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
              } catch (error) {
                return done(new Error("User must be logged in to connect LinkedIn"), null);
              }
            } else {
              return done(new Error("User must be logged in to connect LinkedIn"), null);
            }
          }

          return done(null, {
            id: profile.id,
            displayName: profile.displayName,
            photos: profile.photos,
            accessToken,
            refreshToken,
          });
        } catch (error) {
          console.error("LinkedIn Strategy Error:", error);
          return done(error, null);
        }
      }
    )
  );
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user:", id);
    const userRef = await db.collection("users").doc(id).get();
    if (!userRef.exists) {
      console.error("User not found during deserialization:", id);
      return done(new Error("User not found"), null);
    }
    done(null, { id, ...userRef.data() });
  } catch (error) {
    console.error("Deserialize User Error:", error);
    done(error, null);
  }
});

module.exports = passport;
