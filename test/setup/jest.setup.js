const { createMockAdmin, createMockPassport } = require('./server.mock');

// Mock Firebase Admin
jest.mock('firebase-admin', () => createMockAdmin());

// Mock Passport
jest.mock('passport', () => createMockPassport());

// Mock Express Session
jest.mock('express-session', () => {
  return jest.fn(() => (req, res, next) => {
    req.session = {
      save: jest.fn(cb => cb && cb()),
      destroy: jest.fn(cb => cb && cb())
    };
    next();
  });
});

// Mock Bull queue
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({}),
    process: jest.fn(),
    on: jest.fn()
  }));
});

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(undefined)
  })
}));

// Mock environment variables
process.env = {
  ...process.env,
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_CLIENT_EMAIL: 'test@test.com',
  FIREBASE_PRIVATE_KEY: 'test-key',
  SESSION_SECRET: 'test-secret',
  REDIS_URL: 'redis://localhost:6379',
  NODE_ENV: 'test'
};

// Global test setup
beforeAll(() => {
  // Any global setup needed before all tests
});

afterAll(() => {
  // Any global cleanup needed after all tests
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});
