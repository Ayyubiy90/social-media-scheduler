const admin = require("firebase-admin");

// Mock Firestore functionality
const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn((id) => ({
      get: jest.fn(() =>
        Promise.resolve({
          exists: id === "test-post-id", // Only return true for the test post ID
          data: () =>
            id === "test-post-id"
              ? {
                  id: "test-post-id",
                  content: "Test post content",
                  platforms: ["twitter"],
                  scheduledFor: "2024-03-15T10:00:00Z",
                }
              : {},
        })
      ),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
    })),
    where: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: "1",
              data: () => ({
                id: "1",
                content: "Test post 1",
                platforms: ["twitter"],
                scheduledFor: "2024-03-15T10:00:00Z",
              }),
            },
            {
              id: "2",
              data: () => ({
                id: "2",
                content: "Test post 2",
                platforms: ["facebook"],
                scheduledFor: "2024-03-16T10:00:00Z",
              }),
            },
          ],
          forEach: jest.fn(),
        })
      ),
    })),
  })),
};

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: () => mockFirestore,
  auth: () => ({
    verifyIdToken: jest.fn(() => Promise.resolve({ uid: "test-uid" })),
  }),
}));

// Export mock firestore for use in tests
module.exports = {
  mockFirestore,
  admin,
};
