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

    // Generate a custom token for the user
    const token = await admin.auth().createCustomToken(userRecord.uid);

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

    // Generate a custom token for the user
    const token = await admin.auth().createCustomToken(userRecord.uid);

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
    res.clearCookie("session");
    res.status(200).send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to logout user" });
  }
});

// OAuth Routes
// ... (rest of the OAuth routes remain unchanged)

module.exports = router;
