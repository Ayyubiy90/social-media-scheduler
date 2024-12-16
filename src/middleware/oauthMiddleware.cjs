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

          const userRef = await db
            .collection("users")
            .where("twitterId", "==", profile.id)
            .get();

          if (!userRef.empty) {
            const user = userRef.docs[0].data();
            const updateData = {
              lastLogin: admin.firestore.FieldValue.serverTimestamp(),
              twitterProfile: {
                id: profile.id,
                username: profile.username,
                name: profile.displayName,
                profile_image_url: profile.photos?.[0]?.value
              },
              twitterConnected: true,
              twitterConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
              twitterToken: token,
              twitterTokenSecret: tokenSecret
            };
            await userRef.docs[0].ref.update(updateData);
            return done(null, { id: userRef.docs[0].id, ...user, ...updateData });
          }

          const newUser = {
            twitterId: profile.id,
            displayName: profile.displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            twitterProfile: {
              id: profile.id,
              username: profile.username,
              name: profile.displayName,
              profile_image_url: profile.photos?.[0]?.value
            },
            twitterConnected: true,
            twitterConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
            twitterToken: token,
            twitterTokenSecret: tokenSecret
          };

          const docRef = await db.collection("users").add(newUser);
          return done(null, { id: docRef.id, ...newUser });
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
