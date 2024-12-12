const express = require('express');
const cors = require('cors');

// Create mock server
const createMockServer = () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Mock session
  app.use((req, res, next) => {
    req.session = {
      save: jest.fn(cb => cb && cb()),
      destroy: jest.fn(cb => cb && cb())
    };
    next();
  });

  // Mock user authentication
  app.use((req, res, next) => {
    if (req.headers.authorization) {
      req.user = {
        uid: 'test-user-id',
        email: 'test@example.com'
      };
    }
    next();
  });

  return app;
};

// Create mock database
const createMockDb = () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          content: 'Test content',
          platforms: ['twitter'],
          scheduledFor: '2024-03-15T10:00:00Z'
        }),
        id: 'test-doc-id'
      }),
      set: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(true)
    })),
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: 'test-doc-id',
          data: () => ({
            content: 'Test content',
            platforms: ['twitter'],
            scheduledFor: '2024-03-15T10:00:00Z'
          })
        }
      ],
      forEach: jest.fn()
    }),
    add: jest.fn().mockResolvedValue({ id: 'new-doc-id' })
  }))
});

// Mock Firebase Admin
const createMockAdmin = () => ({
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn()
  },
  initializeApp: jest.fn(),
  firestore: () => createMockDb(),
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-id' }),
    createCustomToken: jest.fn().mockResolvedValue('test-token'),
    getUserByEmail: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com'
    })
  }),
  Timestamp: {
    fromDate: jest.fn(date => ({
      toDate: () => date
    }))
  }
});

// Mock Passport
const createMockPassport = () => ({
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn((strategy, options) => (req, res, next) => next()),
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn()
});

module.exports = {
  createMockServer,
  createMockDb,
  createMockAdmin,
  createMockPassport
};
