require("dotenv").config();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const InstagramStrategy = require("passport-instagram").Strategy;
const admin = require("firebase-admin");
const db = require("../../firebaseConfig.cjs");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Debug log to check environment variables
console.log("OAuth Configuration:", {
  twitter: {
    apiKeyExists: !!process.env.TWITTER_API_KEY,
    apiSecretExists: !!process.env.TWITTER_API_SECRET,
    callbackUrlExists: !!process.env.TWITTER_CALLBACK_URL,
  },
  facebook: {
    appIdExists: !!process.env.FACEBOOK_APP_ID,
    appSecretExists: !!process.env.FACEBOOK_APP_SECRET,
    callbackUrlExists: !!process.env.FACEBOOK_CALLBACK_URL,
  },
  linkedin: {
    clientIdExists: !!process.env.LINKEDIN_CLIENT_ID,
    clientSecretExists: !!process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrlExists: !!process.env.LINKEDIN_CALLBACK_URL,
  },
});

// Configure Twitter Strategy
if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_API_KEY,
        consumerSecret: process.env.TWITTER_API_SECRET,
        callbackURL: process.env.TWITTER_CALLBACK_URL,
        includeEmail: true,
        passReqToCallback: true,
        userProfileURL:
          "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
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
            headers: req.headers,
            session: req.session,
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
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "displayName", "name", "email", "photos"],
        passReqToCallback: true,
        enableProof: true,
        state: true,
        scope: [
          "email",
          "public_profile",
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_posts",
          "pages_manage_metadata"
        ],
        display: "popup",
        version: "16.0",
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
            headers: req.headers,
            session: req.session,
          });

          // Additional debug logging for Facebook
          console.log("Facebook Debug:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            profileComplete: !!profile.id && !!profile.displayName,
            sessionState: req.session,
            authHeader: req.headers.authorization,
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

          return done(null, {
            id: profile.id,
            displayName: profile.displayName,
            photos: profile.photos,
            accessToken,
            refreshToken,
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
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.LINKEDIN_CALLBACK_URL,
        passReqToCallback: true,
        state: true,
        scope: ["r_liteprofile", "r_emailaddress", "w_member_social"],
        profileFields: [
          "id",
          "first-name",
          "last-name",
          "email-address",
          "picture-url",
        ],
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
            headers: req.headers,
            session: req.session,
          });

          // Additional debug logging for LinkedIn
          console.log("LinkedIn Debug:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            profileComplete: !!profile.id && !!profile.displayName,
            sessionState: req.session,
            authHeader: req.headers.authorization,
            scopes: ["r_emailaddress", "r_liteprofile", "w_member_social"],
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
