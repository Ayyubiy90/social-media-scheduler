const express = require("express");
const router = express.Router();
const passport = require("passport");
const { verifyToken, verifySession } = require("./src/middleware/authMiddleware.cjs");
const admin = require("firebase-admin");

// Logout route
router.post("/logout", verifyToken, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user
router.get("/user", verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const db = await require("./firebaseConfig.cjs");
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({
      uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      connectedAccounts: userData.connectedAccounts || {},
      createdAt: userData.createdAt,
      lastLogin: userData.lastLogin,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

// Other routes...

module.exports = router;
