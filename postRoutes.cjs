const express = require('express');
const router = express.Router();
const PostService = require('./src/services/postService.cjs');
const { verifyToken, verifySession } = require('./src/middleware/authMiddleware.cjs');

// Create a new post
router.post('/', verifyToken, verifySession, async (req, res) => {
  try {
    const { content, platforms, scheduledFor, media } = req.body;
    const { uid } = req.user;

    const validPlatforms = ['twitter', 'facebook', 'linkedin'];
    if (!content || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Invalid post data' });
    }
    
    // Validate platforms
    const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return res.status(400).json({ error: `Invalid platforms: ${invalidPlatforms.join(', ')}` });
    }

    const post = await PostService.createPost(uid, {
      content,
      platforms,
      scheduledFor,
      media
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all posts for user
router.get('/', verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const { platform } = req.query;
    const validPlatforms = ['twitter', 'facebook', 'linkedin'];
    
    if (platform && !validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform filter' });
    }

    const posts = await PostService.getPosts(uid, platform);
    res.json(posts);
  } catch (error) {
    console.error('Error getting posts:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
router.get('/:id', verifyToken, verifySession, async (req, res) => {
  try {
    const post = await PostService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error getting post:', error.message);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update post
router.put('/:id', verifyToken, verifySession, async (req, res) => {
  try {
    const post = await PostService.updatePost(req.params.id, req.body);
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error.message);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete post
router.delete('/:id', verifyToken, verifySession, async (req, res) => {
  try {
    await PostService.deletePost(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error.message);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Schedule post
router.post('/:id/schedule', verifyToken, verifySession, async (req, res) => {
  try {
    const { scheduledFor, platforms } = req.body;

    if (!scheduledFor || !Date.parse(scheduledFor)) {
      return res.status(400).json({ error: 'Invalid schedule time' });
    }

    const post = await PostService.schedulePost(req.params.id, {
      scheduledFor,
      platforms
    });
    res.json(post);
  } catch (error) {
    console.error('Error scheduling post:', error.message);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Publish post
router.post('/:id/publish', verifyToken, verifySession, async (req, res) => {
  try {
    const { platforms } = req.body;

    const validPlatforms = ['twitter', 'facebook', 'linkedin'];
    if (!platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Invalid platforms' });
    }

    // Validate platforms
    const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return res.status(400).json({ error: `Invalid platforms: ${invalidPlatforms.join(', ')}` });
    }

    const post = await PostService.publishPost(req.params.id, platforms);
    res.json(post);
  } catch (error) {
    console.error('Error publishing post:', error.message);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
