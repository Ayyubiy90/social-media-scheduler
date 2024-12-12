const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

class AuthService {
  static async registerUser(userData) {
    try {
      const { email, password, displayName } = userData;
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName
      });

      const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        token
      };
    } catch (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  static async loginUser(credentials) {
    try {
      const { email, password } = credentials;
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // In a real implementation, you would verify the password here
      // For testing purposes, we're just checking if the user exists
      
      const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        token
      };
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRecord = await admin.auth().getUser(decoded.uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async logoutUser(token) {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return true to indicate successful logout
      return true;
    } catch (error) {
      throw new Error('Failed to logout');
    }
  }
}

module.exports = AuthService;
