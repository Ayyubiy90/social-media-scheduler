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

    // Create a custom token
    const token = await getAuth().createCustomToken(userRecord.uid);

    res.status(201).send({
      uid: userRecord.uid,
      token,
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

    // Create a custom token
    const token = await getAuth().createCustomToken(userRecord.uid);

    res.status(200).send({
      uid: userRecord.uid,
      token,
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
    res.status(200).send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to logout user" });
  }
});

// OAuth Routes

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const token = await getAuth().createCustomToken(req.user.uid);
      res.redirect(`/dashboard?token=${token}`);
    } catch (error) {
      console.error("Error creating token:", error);
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
      const token = await getAuth().createCustomToken(req.user.uid);
      res.redirect(`/dashboard?token=${token}`);
    } catch (error) {
      console.error("Error creating token:", error);
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
      const token = await getAuth().createCustomToken(req.user.uid);
      res.redirect(`/dashboard?token=${token}`);
    } catch (error) {
      console.error("Error creating token:", error);
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
      const token = await getAuth().createCustomToken(req.user.uid);
      res.redirect(`/dashboard?token=${token}`);
    } catch (error) {
      console.error("Error creating token:", error);
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
