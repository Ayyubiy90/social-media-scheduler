const express = require("express");
const router = express.Router();
const PostService = require("./src/services/postService.cjs");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");
const { validatePostMedia } = require("./src/middleware/postValidation.cjs");
const { PLATFORM_LIMITS } = require("./src/utils/mediaUtils.cjs");

// Get supported platforms
const VALID_PLATFORMS = Object.keys(PLATFORM_LIMITS);

// Create a new post
router.post(
  "/",
  verifyToken,
  verifySession,
  validatePostMedia,
  async (req, res) => {
    try {
      const { content, platforms, scheduledFor, media } = req.body;
      const { uid } = req.user;

      if (!content || !platforms || !Array.isArray(platforms)) {
        return res.status(400).json({ error: "Invalid post data" });
      }

      // Validate platforms
      const invalidPlatforms = platforms.filter(
        (p) => !VALID_PLATFORMS.includes(p)
      );
      if (invalidPlatforms.length > 0) {
        return res
          .status(400)
          .json({ error: `Invalid platforms: ${invalidPlatforms.join(", ")}` });
      }

      // Create post with media
      const post = await PostService.createPost(uid, {
        content,
        platforms,
        scheduledFor,
        media,
        mediaType: media ? media.split(";")[0].split("/")[0] : null, // Store media type for future reference
        createdAt: new Date(),
        status: scheduledFor ? "scheduled" : "draft",
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all posts for user
router.get("/", verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const { platform } = req.query;

    if (platform && !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: "Invalid platform filter" });
    }

    const posts = await PostService.getPosts(uid, platform);
    res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
router.get("/:id", verifyToken, verifySession, async (req, res) => {
  try {
    const post = await PostService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error getting post:", error.message);
    if (error.message === "Post not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update post
router.put(
  "/:id",
  verifyToken,
  verifySession,
  validatePostMedia,
  async (req, res) => {
    try {
      // If platforms are being updated, validate them
      if (req.body.platforms) {
        const invalidPlatforms = req.body.platforms.filter(
          (p) => !VALID_PLATFORMS.includes(p)
        );
        if (invalidPlatforms.length > 0) {
          return res
            .status(400)
            .json({
              error: `Invalid platforms: ${invalidPlatforms.join(", ")}`,
            });
        }
      }

      // If media is being updated, store the media type
      if (req.body.media) {
        req.body.mediaType = req.body.media.split(";")[0].split("/")[0];
      }

      const post = await PostService.updatePost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error.message);
      if (error.message === "Post not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

// Delete post
router.delete("/:id", verifyToken, verifySession, async (req, res) => {
  try {
    await PostService.deletePost(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    if (error.message === "Post not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Schedule post
router.post("/:id/schedule", verifyToken, verifySession, async (req, res) => {
  try {
    const { scheduledFor, platforms } = req.body;

    if (!scheduledFor || !Date.parse(scheduledFor)) {
      return res.status(400).json({ error: "Invalid schedule time" });
    }

    // Validate platforms if provided
    if (platforms) {
      const invalidPlatforms = platforms.filter(
        (p) => !VALID_PLATFORMS.includes(p)
      );
      if (invalidPlatforms.length > 0) {
        return res
          .status(400)
          .json({ error: `Invalid platforms: ${invalidPlatforms.join(", ")}` });
      }
    }

    const post = await PostService.schedulePost(req.params.id, {
      scheduledFor,
      platforms,
      status: "scheduled",
    });
    res.json(post);
  } catch (error) {
    console.error("Error scheduling post:", error.message);
    if (error.message === "Post not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get platform limits and tips
router.get("/platforms/limits", (req, res) => {
  res.json(PLATFORM_LIMITS);
});

module.exports = router;
