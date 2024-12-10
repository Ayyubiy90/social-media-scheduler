const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://social-media-scheduler-9a3ad.firebaseio.com" // Updated with your actual database URL
});

// Mock Firestore
const firestoreMock = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(() => ({
        exists: true,
        data: jest.fn(() => ({ notificationSettings: {} })),
      })),
      update: jest.fn(),
    })),
  })),
};

admin.firestore = jest.fn(() => firestoreMock);
module.exports = admin;
