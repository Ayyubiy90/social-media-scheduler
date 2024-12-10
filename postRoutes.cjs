const express = require("express");
const admin = require("firebase-admin");
const { verifyToken } = require("./src/middleware/authMiddleware.cjs");
const router = express.Router();
const morgan = require('morgan');

// Use morgan for logging requests
router.use(morgan('combined'));

// Middleware for post validation
const validatePostContent = (req, res, next) => {
  const { content } = req.body;
  if (!content || content.length > 280) {
    return res.status(400).send({ error: "Post content is required and must be under 280 characters." });
  }
  next();
};

// Create Post
router.post("/posts", verifyToken, validatePostContent, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.uid;

  try {
    const newPost = {
      userId,
      content,
      status: "draft",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const postRef = await admin.firestore().collection("posts").add(newPost);
    res.status(201).send({ id: postRef.id, ...newPost });
  } catch (error) {
    res.status(500).send({ error: "Failed to create post." });
  }
});

// Read Posts
router.get("/posts", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const postsSnapshot = await admin.firestore().collection("posts").where("userId", "==", userId).get();
    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve posts." });
  }
});

// Update Post
router.put("/posts/:id", verifyToken, validatePostContent, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    await admin.firestore().collection("posts").doc(id).update({
      content,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(200).send({ message: "Post updated successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to update post." });
  }
});

// Delete Post
router.delete("/posts/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    await admin.firestore().collection("posts").doc(id).delete();
    res.status(200).send({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete post." });
  }
});

// Create Notification Settings
router.post("/notifications/settings", verifyToken, async (req, res) => {
  const { userId, preferences } = req.body;

  try {
    await admin.firestore().collection("users").doc(userId).set({
      notificationSettings: preferences,
    }, { merge: true });
    res.status(201).send({ message: "Notification settings created successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to create notification settings." });
  }
});

// Get Notification Settings
router.get("/notifications/settings", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const userRef = await admin.firestore().collection("users").doc(userId).get();
    if (!userRef.exists) {
      return res.status(404).send({ error: "User not found." });
    }
    const userData = userRef.data();
    res.status(200).send(userData.notificationSettings || {});
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve notification settings." });
  }
});

// Update Notification Settings
router.put("/notifications/settings", verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { preferences } = req.body;

  try {
    await admin.firestore().collection("users").doc(userId).set({
      notificationSettings: preferences,
    }, { merge: true });
    res.status(200).send({ message: "Notification settings updated successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to update notification settings." });
  }
});

// Delete Notification Settings
router.delete("/notifications/settings", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    await admin.firestore().collection("users").doc(userId).update({
      notificationSettings: admin.firestore.FieldValue.delete(),
    });
    res.status(200).send({ message: "Notification settings deleted successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete notification settings." });
  }
});

module.exports = router;
