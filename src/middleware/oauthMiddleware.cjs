require("dotenv").config();
const passport = require("passport");
const crypto = require("crypto");
const TwitterStrategy = require("passport-twitter-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const InstagramStrategy = require("passport-instagram").Strategy;
const admin = require("firebase-admin");
const db = require("../../firebaseConfig.cjs");

const CLIENT_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";

// Configure Twitter Strategy
if (
  process.env.VITE_TWITTER_CLIENT_ID &&
  process.env.VITE_TWITTER_CLIENT_SECRET
) {
  passport.use(
    "twitter",
    new TwitterStrategy(
      {
        authorizationURL: "https://twitter.com/i/oauth2/authorize",
        tokenURL: "https://api.twitter.com/2/oauth2/token",
        clientID: process.env.VITE_TWITTER_CLIENT_ID,
        clientSecret: process.env.VITE_TWITTER_CLIENT_SECRET,
        callbackURL:
          process.env.VITE_TWITTER_CALLBACK_URL ||
          "http://localhost:5000/social/twitter/callback",
        scope: ["users.read"],
        passReqToCallback: true,
        pkce: true,
        state: true,
        sessionKey: "oauth2:twitter",
        store: true,
        userProfileURL: "https://api.twitter.com/2/users/me",
        authorizationParams: {
          response_type: "code",
          code_challenge_method: "S256",
        },
        tokenParams: {
          grant_type: "authorization_code",
        },
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const userId = req.session?.userId;
          if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const idToken = authHeader.split("Bearer ")[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
              } catch (error) {
                return done(
                  new Error("User must be logged in to connect Twitter"),
                  null
                );
              }
            } else {
              return done(
                new Error("User must be logged in to connect Twitter"),
                null
              );
            }
          }
          // Extract profile data for Twitter
          const profileData = {
            id: profile.id,
            username: profile.username || profile.id,
            displayName: profile.displayName || profile.username,
            photos: profile.photos || [],
            accessToken,
            refreshToken,
          };
          return done(null, profileData);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Configure Facebook Strategy
if (process.env.VITE_FACEBOOK_APP_ID && process.env.VITE_FACEBOOK_APP_SECRET) {
  passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: process.env.VITE_FACEBOOK_APP_ID,
        clientSecret: process.env.VITE_FACEBOOK_APP_SECRET,
        callbackURL:
          process.env.VITE_FACEBOOK_CALLBACK_URL ||
          "http://localhost:5000/social/facebook/callback",
        profileFields: [
          "id",
          "displayName",
          "name",
          "picture.type(large)",
          "email",
        ],
        passReqToCallback: true,
        enableProof: true,
        state: true,
        scope: ["public_profile"],
        display: "popup",
        version: "v18.0",
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const userId = req.session?.userId;
          if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const idToken = authHeader.split("Bearer ")[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
              } catch (error) {
                return done(
                  new Error("User must be logged in to connect Facebook"),
                  null
                );
              }
            } else {
              return done(
                new Error("User must be logged in to connect Facebook"),
                null
              );
            }
          }
          // Extract profile data
          const profileData = {
            id: profile.id,
            displayName: profile.displayName || profile.name?.givenName,
            photos:
              profile.photos ||
              (profile.picture ? [{ value: profile.picture.data.url }] : []),
            accessToken,
            refreshToken,
            _json: profile._json,
          };

          // Ensure we have a username for the profile URL
          if (!profileData.username) {
            profileData.username = profile.id;
          }

          return done(null, profileData);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Configure LinkedIn Strategy
if (
  process.env.VITE_LINKEDIN_CLIENT_ID &&
  process.env.VITE_LINKEDIN_CLIENT_SECRET
) {
  passport.use(
    "linkedin",
    new LinkedInStrategy(
      {
        clientID: process.env.VITE_LINKEDIN_CLIENT_ID,
        clientSecret: process.env.VITE_LINKEDIN_CLIENT_SECRET,
        callbackURL:
          process.env.VITE_LINKEDIN_CALLBACK_URL ||
          "http://localhost:5000/social/linkedin/callback",
        scope: ["profile", "email"],
        passReqToCallback: true,
        state: true,
        authorizationParams: {
          response_type: "code",
        },
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const userId = req.session?.userId;
          if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const idToken = authHeader.split("Bearer ")[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
              } catch (error) {
                return done(
                  new Error("User must be logged in to connect LinkedIn"),
                  null
                );
              }
            } else {
              return done(
                new Error("User must be logged in to connect LinkedIn"),
                null
              );
            }
          }
          // Extract profile data for LinkedIn
          const profileData = {
            id: profile.id,
            username: profile.id,
            displayName: profile.displayName || profile.formattedName,
            photos: profile.photos || [],
            accessToken,
            refreshToken,
          };
          return done(null, profileData);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const userRef = await db.collection("users").doc(id).get();
    if (!userRef.exists) {
      return done(new Error("User not found"), null);
    }
    done(null, { id, ...userRef.data() });
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
