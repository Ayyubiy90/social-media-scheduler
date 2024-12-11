const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Mock token verification for testing
    if (process.env.NODE_ENV === "test") {
      req.user = { uid: "testUser", email: "test@example.com" }; // Mock user info
      return next();
    }

    let decodedToken;
    try {
      // First try to verify as an ID token
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      try {
        // If ID token verification fails, try verifying as a custom token
        const userCredential = await admin.auth().verifyCustomToken(token);
        if (!userCredential) {
          throw new Error("Invalid custom token");
        }
        // Get user details from the custom token
        const user = await admin.auth().getUser(userCredential.uid);
        decodedToken = {
          uid: user.uid,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        };
      } catch (customTokenError) {
        console.error("Token verification failed:", {
          idTokenError,
          customTokenError,
        });
        throw new Error("Invalid token");
      }
    }

    // Check token expiration
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      return res.status(401).json({ error: "Token has expired" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const verifySession = async (req, res, next) => {
  const { uid } = req.user;
  try {
    const userRecord = await admin.auth().getUser(uid);
    if (userRecord.disabled) {
      return res.status(401).json({ error: "User account is disabled" });
    }
    next();
  } catch (error) {
    console.error("Error verifying session:", error);
    res.status(401).json({ error: "Invalid session" });
  }
};

module.exports = { verifyToken, verifySession };
