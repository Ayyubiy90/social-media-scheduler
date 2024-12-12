const request = require('supertest');
const express = require('express');
const { mockPassport, mockAuthService } = require('./setup/auth.mock');
require('./setup/firebase.mock');

const app = express();
const authRoutes = require('../authRoutes.cjs');

// Setup middleware and routes
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  let mockToken;
  
  beforeEach(() => {
    mockToken = 'mock-token-123';
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const validUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      displayName: 'New User'
    };

    it('should create new user with valid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 400 with invalid data', async () => {
      mockAuthService.registerUser.mockRejectedValueOnce(new Error('Invalid data'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should authenticate user with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 with invalid credentials', async () => {
      mockAuthService.loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 with invalid token', async () => {
      mockAuthService.verifyToken.mockRejectedValueOnce(new Error('Invalid token'));

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.valid).toBe(false);
    });
  });

  describe('GET /auth/logout', () => {
    it('should successfully logout user', async () => {
      const response = await request(app)
        .get('/auth/logout')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('OAuth Routes', () => {
    const platforms = ['google', 'facebook', 'twitter', 'linkedin'];

    platforms.forEach(platform => {
      describe(`${platform} OAuth`, () => {
        it(`should initiate ${platform} OAuth flow`, async () => {
          const response = await request(app)
            .get(`/auth/${platform}`);

          expect(response.status).toBe(302); // Redirect status
          expect(mockPassport.authenticate).toHaveBeenCalledWith(
            platform,
            expect.any(Object)
          );
        });

        it(`should handle ${platform} OAuth callback`, async () => {
          const response = await request(app)
            .get(`/auth/${platform}/callback`)
            .query({ code: 'mock-auth-code' });

          expect(response.status).toBe(302); // Redirect status
          expect(mockPassport.authenticate).toHaveBeenCalledWith(
            platform,
            expect.any(Object)
          );
        });
      });
    });
  });
});
