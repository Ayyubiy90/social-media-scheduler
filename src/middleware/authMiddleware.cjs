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

    // Get user from token
    const decodedToken = await admin.auth().verifySessionCookie(token, true);

    // If session cookie verification fails, try custom token
    if (!decodedToken) {
      const userRecord = await admin.auth().getUser(token.split(".")[0]); // Get UID from token
      if (!userRecord) {
        throw new Error("Invalid token");
      }
      decodedToken = {
        uid: userRecord.uid,
        email: userRecord.email,
      };
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    console.error("Error verifying token:", error);

    // Try to get user directly if token verification fails
    try {
      const userRecord = await admin.auth().getUser(token.split(".")[0]);
      if (userRecord) {
        req.user = {
          uid: userRecord.uid,
          email: userRecord.email,
        };
        return next();
      }
    } catch (fallbackError) {
      console.error("Fallback authentication failed:", fallbackError);
    }

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
