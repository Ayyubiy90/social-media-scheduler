require("dotenv").config({ path: "../../.env" });
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const admin = require("firebase-admin");
const db = require("../../firebaseConfig.cjs");

// Debug log to check environment variables
console.log(
  "Environment check - Google Client ID exists:",
  !!process.env.GOOGLE_CLIENT_ID
);

// Configure Google Strategy if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userRef = await db
            .collection("users")
            .where("googleId", "==", profile.id)
            .get();

          if (!userRef.empty) {
            const user = userRef.docs[0].data();
            const updateData = {
              accessToken,
              lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            };
            if (refreshToken) {
              updateData.refreshToken = refreshToken;
            }
            await userRef.docs[0].ref.update(updateData);
            return done(null, { id: userRef.docs[0].id, ...user });
          }

          const newUser = {
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            accessToken,
            provider: "google",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (refreshToken) {
            newUser.refreshToken = refreshToken;
          }

          const docRef = await db.collection("users").add(newUser);
          return done(null, { id: docRef.id, ...newUser });
        } catch (error) {
          console.error("Error in Google Strategy:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials are missing");
}

// Configure Facebook Strategy if credentials exist
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userRef = await db
            .collection("users")
            .where("facebookId", "==", profile.id)
            .get();

          if (!userRef.empty) {
            const user = userRef.docs[0].data();
            const updateData = {
              accessToken,
              lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            };
            if (refreshToken) {
              updateData.refreshToken = refreshToken;
            }
            await userRef.docs[0].ref.update(updateData);
            return done(null, { id: userRef.docs[0].id, ...user });
          }

          const newUser = {
            facebookId: profile.id,
            email: profile.emails[0].value,
            displayName: `${profile.name.givenName} ${profile.name.familyName}`,
            accessToken,
            provider: "facebook",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (refreshToken) {
            newUser.refreshToken = refreshToken;
          }

          const docRef = await db.collection("users").add(newUser);
          return done(null, { id: docRef.id, ...newUser });
        } catch (error) {
          console.error("Error in Facebook Strategy:", error);
          return done(error, null);
        }
      }
    )
  );
}

// Configure Twitter Strategy if credentials exist
if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_API_KEY,
        consumerSecret: process.env.TWITTER_API_SECRET,
        callbackURL: "/auth/twitter/callback",
      },
      async (token, tokenSecret, profile, done) => {
        try {
          const userRef = await db
            .collection("users")
            .where("twitterId", "==", profile.id)
            .get();

          if (!userRef.empty) {
            const user = userRef.docs[0].data();
            await userRef.docs[0].ref.update({
              token,
              tokenSecret,
              lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            });
            return done(null, { id: userRef.docs[0].id, ...user });
          }

          const newUser = {
            twitterId: profile.id,
            displayName: profile.displayName,
            token,
            tokenSecret,
            provider: "twitter",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          };

          const docRef = await db.collection("users").add(newUser);
          return done(null, { id: docRef.id, ...newUser });
        } catch (error) {
          console.error("Error in Twitter Strategy:", error);
          return done(error, null);
        }
      }
    )
  );
}

// Configure LinkedIn Strategy if credentials exist
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/auth/linkedin/callback",
        scope: ["r_emailaddress", "r_liteprofile", "w_member_social"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userRef = await db
            .collection("users")
            .where("linkedinId", "==", profile.id)
            .get();

          if (!userRef.empty) {
            const user = userRef.docs[0].data();
            const updateData = {
              accessToken,
              lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            };
            if (refreshToken) {
              updateData.refreshToken = refreshToken;
            }
            await userRef.docs[0].ref.update(updateData);
            return done(null, { id: userRef.docs[0].id, ...user });
          }

          const newUser = {
            linkedinId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            accessToken,
            provider: "linkedin",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (refreshToken) {
            newUser.refreshToken = refreshToken;
          }

          const docRef = await db.collection("users").add(newUser);
          return done(null, { id: docRef.id, ...newUser });
        } catch (error) {
          console.error("Error in LinkedIn Strategy:", error);
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
