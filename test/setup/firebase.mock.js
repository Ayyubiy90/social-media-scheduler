const mockServiceAccount = require("../mocks/serviceAccountKey.json");

// Mock Firestore functionality
const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          analytics: {
            twitter: {
              likes: 100,
              shares: 50,
              comments: 25,
            },
          },
          metadata: {
            publishedAt: new Date(),
          },
          notificationSettings: {
            prePostReminders: true,
            reminderTime: 30,
          },
        }),
      }),
      set: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(true),
    })),
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [],
      forEach: jest.fn(),
    }),
  })),
};

// Mock Firebase Admin
const mockAdmin = {
  credential: {
    cert: jest.fn().mockReturnValue(mockServiceAccount),
  },
  initializeApp: jest.fn(),
  firestore: () => mockFirestore,
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: "test-user-id" }),
    createCustomToken: jest.fn().mockResolvedValue("test-token"),
  }),
  Timestamp: {
    fromDate: jest.fn((date) => ({
      toDate: () => date,
    })),
  },
};

// Mock the entire firebase-admin module
jest.mock("firebase-admin", () => mockAdmin);

// Export mocks for use in tests
module.exports = {
  mockAdmin,
  mockFirestore,
  mockServiceAccount,
};
