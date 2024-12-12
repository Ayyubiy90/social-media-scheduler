const request = require('supertest');
const express = require('express');
const { mockAdmin, mockFirestore } = require('./setup/firebase.mock');

// Mock Auth Middleware
jest.mock('../src/middleware/authMiddleware.cjs', () => ({
  verifyToken: (req, res, next) => {
    req.user = { uid: 'test-user-id' };
    next();
  },
  verifySession: (req, res, next) => next()
}));

// Mock AnalyticsService
jest.mock('../src/services/analyticsService.cjs', () => ({
  getEngagementMetrics: jest.fn().mockResolvedValue([
    {
      date: '2024-03-01',
      likes: 100,
      comments: 50,
      shares: 25
    }
  ]),
  getPlatformStats: jest.fn().mockResolvedValue({
    platform: 'twitter',
    totalPosts: 10,
    averageLikes: 50,
    averageComments: 25,
    averageShares: 10
  }),
  getPostAnalytics: jest.fn().mockResolvedValue({
    postId: '123',
    metrics: {
      twitter: {
        likes: 100,
        comments: 50,
        shares: 25
      }
    }
  }),
  getEngagementHeatmap: jest.fn().mockResolvedValue(
    Array.from({ length: 7 * 24 }, (_, i) => ({
      day: Math.floor(i / 24),
      hour: i % 24,
      value: Math.floor(Math.random() * 100)
    }))
  )
}));

const app = express();
const analyticsRoutes = require('../analyticsRoutes.cjs');

// Setup middleware and routes
app.use(express.json());
app.use('/analytics', analyticsRoutes);

describe('Analytics Routes', () => {
  let mockToken;
  
  beforeEach(() => {
    mockToken = 'mock-token-123';
    jest.clearAllMocks();
  });

  describe('GET /analytics/engagement', () => {
    it('should return engagement metrics for valid date range', async () => {
      const response = await request(app)
        .get('/analytics/engagement')
        .query({
          startDate: '2024-03-01',
          endDate: '2024-03-07'
        })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('likes');
      expect(response.body[0]).toHaveProperty('comments');
      expect(response.body[0]).toHaveProperty('shares');
    });

    it('should return 400 if date range is missing', async () => {
      const response = await request(app)
        .get('/analytics/engagement')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('startDate and endDate are required');
    });
  });

  describe('GET /analytics/platforms/:platform', () => {
    it('should return platform statistics', async () => {
      const response = await request(app)
        .get('/analytics/platforms/twitter')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('platform', 'twitter');
      expect(response.body).toHaveProperty('totalPosts');
      expect(response.body).toHaveProperty('averageLikes');
    });
  });

  describe('POST /analytics/posts', () => {
    it('should return analytics for specified posts', async () => {
      const response = await request(app)
        .post('/analytics/posts')
        .send({ postIds: ['123'] })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('metrics');
      }
    });

    it('should return 400 if postIds is not an array', async () => {
      const response = await request(app)
        .post('/analytics/posts')
        .send({ postIds: '123' })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('postIds must be an array');
    });
  });

  describe('GET /analytics/heatmap/:platform', () => {
    it('should return heatmap data for platform', async () => {
      const response = await request(app)
        .get('/analytics/heatmap/twitter')
        .query({ timeframe: 'week' })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('day');
        expect(response.body[0]).toHaveProperty('hour');
        expect(response.body[0]).toHaveProperty('value');
      }
    });
  });
});
