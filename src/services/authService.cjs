const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

class AuthService {
  constructor() {
    this.auth = getAuth();
    this.db = getFirestore();
  }

  async registerUser(userData) {
    try {
      const { email, password, displayName } = userData;
      const userRecord = await this.auth.createUser({
        email,
        password,
        displayName
      });
      
      await this.db.collection('users').doc(userRecord.uid).set({
        email,
        displayName,
        createdAt: new Date().toISOString(),
        settings: {
          emailNotifications: true,
          pushNotifications: false
        }
      });

      return userRecord;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async loginUser(credentials) {
    try {
      const { email, password } = credentials;
      const userRecord = await this.auth.getUserByEmail(email);
      // In a real implementation, you would verify the password here
      // For now, we'll just return the user record with a token
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        token: 'test-token' // In production, generate a real token
      };
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }

  async getUserById(uid) {
    try {
      const userRecord = await this.auth.getUser(uid);
      const userDoc = await this.db.collection('users').doc(uid).get();
      return {
        ...userRecord,
        ...userDoc.data()
      };
    } catch (error) {
      throw new Error(`Error getting user: ${error.message}`);
    }
  }

  async updateUser(uid, updateData) {
    try {
      const { email, password, displayName, ...customClaims } = updateData;
      
      // Update auth profile
      const authUpdate = {};
      if (email) authUpdate.email = email;
      if (password) authUpdate.password = password;
      if (displayName) authUpdate.displayName = displayName;
      
      if (Object.keys(authUpdate).length > 0) {
        await this.auth.updateUser(uid, authUpdate);
      }

      // Update custom claims if any
      if (Object.keys(customClaims).length > 0) {
        await this.auth.setCustomUserClaims(uid, customClaims);
      }

      // Update Firestore document
      const userDocRef = this.db.collection('users').doc(uid);
      await userDocRef.update({
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      return await this.getUserById(uid);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async deleteUser(uid) {
    try {
      await this.auth.deleteUser(uid);
      await this.db.collection('users').doc(uid).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async verifyToken(token) {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      throw new Error(`Error verifying token: ${error.message}`);
    }
  }

  async listUsers(maxResults = 1000) {
    try {
      const listUsersResult = await this.auth.listUsers(maxResults);
      return listUsersResult.users;
    } catch (error) {
      throw new Error(`Error listing users: ${error.message}`);
    }
  }

  async getUserByEmail(email) {
    try {
      return await this.auth.getUserByEmail(email);
    } catch (error) {
      throw new Error(`Error getting user by email: ${error.message}`);
    }
  }

  async logoutUser(uid) {
    try {
      // In a real implementation, you might want to:
      // 1. Revoke refresh tokens
      // 2. Clear any server-side sessions
      // 3. Update user's last logout timestamp
      await this.db.collection('users').doc(uid).update({
        lastLogout: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw new Error(`Error logging out user: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
