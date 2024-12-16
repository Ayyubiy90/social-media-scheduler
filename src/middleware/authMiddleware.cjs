const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  try {
    // First check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Mock token verification for testing
      if (process.env.NODE_ENV === "test") {
        req.user = { uid: "testUser", email: "test@example.com" };
        return next();
      }

      try {
        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Check token expiration
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
          return res.status(401).json({ error: "Token has expired" });
        }

        // Set user info in request
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          token: token // Store the token for later use
        };

        // Store user ID in session if it doesn't exist
        if (!req.session.userId) {
          req.session.userId = decodedToken.uid;
          await new Promise((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error("Session save error:", err);
                reject(err);
              } else {
                console.log("User ID stored in session:", decodedToken.uid);
                resolve();
              }
            });
          });
        }

        return next();
      } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    // If no Authorization header but user ID exists in session
    if (req.session.userId) {
      try {
        const userRecord = await admin.auth().getUser(req.session.userId);
        req.user = {
          uid: userRecord.uid,
          email: userRecord.email
        };
        return next();
      } catch (error) {
        console.error("Session user verification error:", error);
      }
    }

    // No valid authentication found
    return res.status(401).json({ error: "No valid authentication provided" });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifySession = async (req, res, next) => {
  try {
    // If we have a user from token verification, proceed
    if (req.user) {
      const userRecord = await admin.auth().getUser(req.user.uid);
      if (userRecord.disabled) {
        return res.status(401).json({ error: "User account is disabled" });
      }
      return next();
    }

    // No user found
    return res.status(401).json({ error: "Invalid session" });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(401).json({ error: "Invalid session" });
  }
};

module.exports = { verifyToken, verifySession };
