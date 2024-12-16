require("dotenv").config();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const admin = require("firebase-admin");
const db = require("../../firebaseConfig.cjs");

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Debug log to check environment variables
console.log("OAuth Configuration:", {
  twitter: {
    apiKeyExists: !!process.env.TWITTER_API_KEY,
    apiSecretExists: !!process.env.TWITTER_API_SECRET,
    callbackUrlExists: !!process.env.TWITTER_CALLBACK_URL
  }
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
        passReqToCallback: true
      },
      async (req, token, tokenSecret, profile, done) => {
        try {
          console.log("Twitter Auth Response:", {
            token,
            tokenSecret,
            profile: {
              id: profile.id,
              displayName: profile.displayName,
              username: profile.username
            }
          });

          // Get the current user's ID from the session
          const userId = req.session?.userId;
          if (!userId) {
            // Try to get user ID from the Authorization header
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const idToken = authHeader.split('Bearer ')[1];
              try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                req.session.userId = decodedToken.uid;
                console.log("Retrieved user ID from token:", decodedToken.uid);
              } catch (error) {
                console.error("Error verifying ID token:", error);
                return done(new Error('User must be logged in to connect Twitter'), null);
              }
            } else {
              return done(new Error('User must be logged in to connect Twitter'), null);
            }
          }

          // Return the Twitter profile with tokens
          return done(null, {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            photos: profile.photos,
            token,
            tokenSecret
          });
        } catch (error) {
          console.error("Twitter Strategy Error:", error);
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
