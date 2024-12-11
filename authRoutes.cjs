const express = require("express");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const passport = require("./src/middleware/oauthMiddleware.cjs");

const router = express.Router();
const { verifyToken } = require("./src/middleware/authMiddleware.cjs");

// Initialize passport middleware
router.use(passport.initialize());
router.use(passport.session());

// User Registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
    });

    // Generate a session cookie
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(userRecord.uid, {
        expiresIn: 60 * 60 * 24 * 5 * 1000,
      }); // 5 days

    res.cookie("session", sessionCookie, {
      maxAge: 5 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });
    res.status(201).send({
      uid: userRecord.uid,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await getAuth().getUserByEmail(email);

    // Generate a session cookie
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(userRecord.uid, {
        expiresIn: 60 * 60 * 24 * 5 * 1000,
      }); // 5 days

    res.cookie("session", sessionCookie, {
      maxAge: 5 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({
      uid: userRecord.uid,
      message: "Login successful",
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// User Logout
router.post("/logout", verifyToken, async (req, res) => {
  const { uid } = req.user;
  try {
    await getAuth().revokeRefreshTokens(uid);
    res.clearCookie("session");
    res.status(200).send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to logout user" });
  }
});

// OAuth Routes
// ... (rest of the OAuth routes remain unchanged)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(req.user.uid, {
          expiresIn: 60 * 60 * 24 * 5 * 1000,
        }); // 5 days
      res.cookie("session", sessionCookie, {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error creating session:", error);
      res.redirect("/login");
    }
  }
);

// Facebook OAuth
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(req.user.uid, {
          expiresIn: 60 * 60 * 24 * 5 * 1000,
        }); // 5 days
      res.cookie("session", sessionCookie, {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error creating session:", error);
      res.redirect("/login");
    }
  }
);

// Twitter OAuth
router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(req.user.uid, {
          expiresIn: 60 * 60 * 24 * 5 * 1000,
        }); // 5 days
      res.cookie("session", sessionCookie, {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error creating session:", error);
      res.redirect("/login");
    }
  }
);

// LinkedIn OAuth
router.get("/linkedin", passport.authenticate("linkedin"));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(req.user.uid, {
          expiresIn: 60 * 60 * 24 * 5 * 1000,
        }); // 5 days
      res.cookie("session", sessionCookie, {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error creating session:", error);
      res.redirect("/login");
    }
  }
);

// Social Media Account Management
// Get connected social media accounts
router.get("/connected-accounts", verifyToken, async (req, res) => {
  try {
    const userRef = await admin
      .firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();
    if (!userRef.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userRef.data();
    const connectedAccounts = {
      google: !!userData.googleId,
      facebook: !!userData.facebookId,
      twitter: !!userData.twitterId,
      linkedin: !!userData.linkedinId,
    };

    res.json(connectedAccounts);
  } catch (error) {
    console.error("Error fetching connected accounts:", error);
    res.status(500).json({ error: "Failed to fetch connected accounts" });
  }
});

// Disconnect social media account
router.delete("/disconnect/:platform", verifyToken, async (req, res) => {
  const { platform } = req.params;
  const validPlatforms = ["google", "facebook", "twitter", "linkedin"];

  if (!validPlatforms.includes(platform)) {
    return res.status(400).json({ error: "Invalid platform" });
  }

  try {
    const userRef = admin.firestore().collection("users").doc(req.user.uid);
    const update = {};
    update[`${platform}Id`] = admin.firestore.FieldValue.delete();
    update[`${platform}AccessToken`] = admin.firestore.FieldValue.delete();
    update[`${platform}RefreshToken`] = admin.firestore.FieldValue.delete();

    await userRef.update(update);
    res.json({ message: `Successfully disconnected ${platform} account` });
  } catch (error) {
    console.error(`Error disconnecting ${platform} account:`, error);
    res.status(500).json({ error: `Failed to disconnect ${platform} account` });
  }
});

module.exports = router;
