// Mock Passport
const mockPassport = {
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn((strategy, options) => (req, res, next) => next()),
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn()
};

// Mock Auth Service
const mockAuthService = {
  registerUser: jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    token: 'test-token'
  }),
  loginUser: jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    token: 'test-token'
  }),
  verifyToken: jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com'
  }),
  logoutUser: jest.fn().mockResolvedValue(true)
};

// Mock Express Session
const mockSession = jest.fn(() => (req, res, next) => {
  req.session = {
    save: jest.fn(cb => cb && cb()),
    destroy: jest.fn(cb => cb && cb())
  };
  next();
});

// Setup mocks
jest.mock('passport', () => mockPassport);
jest.mock('../../src/services/authService.cjs', () => mockAuthService);
jest.mock('express-session', () => mockSession);

module.exports = {
  mockPassport,
  mockAuthService,
  mockSession
};
