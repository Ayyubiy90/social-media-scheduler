const express = require("express");
const router = express.Router();
const AuthService = require('./src/services/authService.cjs');
const passport = require("./src/middleware/oauthMiddleware.cjs");

// Initialize passport middleware
router.use(passport.initialize());
router.use(passport.session());

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await AuthService.registerUser({ email, password, displayName });
    res.status(201).json({
      token: result.token,
      user: {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const result = await AuthService.loginUser({ email, password });
    res.status(200).json({
      token: result.token,
      user: {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Token Verification
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    const result = await AuthService.verifyToken(token);
    res.status(200).json({
      valid: true,
      user: {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false, error: error.message });
  }
});

// User Logout
router.get("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await AuthService.logoutUser(token);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth Routes
const platforms = ['google', 'facebook', 'twitter', 'linkedin'];

platforms.forEach(platform => {
  // OAuth initialization route
  router.get(`/${platform}`, (req, res, next) => {
    const scope = platform === 'google' ? ['profile', 'email'] : ['email'];
    const options = {
      scope,
      session: false,
      failureRedirect: '/login'
    };

    // Call passport.authenticate directly and handle the response
    passport.authenticate(platform, options)(req, res, () => {
      res.redirect('/dashboard');
    });
  });

  // OAuth callback route
  router.get(`/${platform}/callback`, (req, res, next) => {
    const options = {
      session: false,
      failureRedirect: '/login'
    };

    // Call passport.authenticate directly and handle the response
    passport.authenticate(platform, options)(req, res, () => {
      res.redirect('/dashboard');
    });
  });
});

module.exports = router;
