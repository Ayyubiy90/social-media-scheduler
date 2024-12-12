const request = require('supertest');
const express = require('express');
const { mockAdmin } = require('./setup/firebase.mock');

// Mock Auth Middleware
jest.mock('../src/middleware/authMiddleware.cjs', () => ({
  verifyToken: (req, res, next) => {
    req.user = { uid: 'test-user-id' };
    next();
  },
  verifySession: (req, res, next) => next()
}));

// Mock Post Service
const mockPostService = {
  createPost: jest.fn().mockImplementation((userId, postData) => {
    return Promise.resolve({
      id: 'test-post-id',
      ...postData,
      userId
    });
  }),
  getPosts: jest.fn().mockImplementation((userId, platform) => {
    const posts = [
      {
        id: '1',
        content: 'Test post 1',
        platforms: ['twitter'],
        scheduledFor: '2024-03-15T10:00:00Z'
      },
      {
        id: '2',
        content: 'Test post 2',
        platforms: ['facebook'],
        scheduledFor: '2024-03-16T10:00:00Z'
      }
    ];
    if (platform) {
      return Promise.resolve(posts.filter(post => post.platforms.includes(platform)));
    }
    return Promise.resolve(posts);
  }),
  getPostById: jest.fn().mockResolvedValue({
    id: 'test-post-id',
    content: 'Test post content',
    platforms: ['twitter'],
    scheduledFor: '2024-03-15T10:00:00Z'
  }),
  updatePost: jest.fn().mockResolvedValue({
    id: 'test-post-id',
    content: 'Updated content',
    platforms: ['twitter', 'linkedin']
  }),
  deletePost: jest.fn().mockResolvedValue(true),
  schedulePost: jest.fn().mockResolvedValue({
    id: 'test-post-id',
    scheduledFor: '2024-03-15T10:00:00Z'
  }),
  publishPost: jest.fn().mockResolvedValue({
    id: 'test-post-id',
    status: 'published'
  })
};

jest.mock('../src/services/postService.cjs', () => mockPostService);

const app = express();
const postRoutes = require('../postRoutes.cjs');

// Setup middleware and routes
app.use(express.json());
app.use('/posts', postRoutes);

describe('Post Routes', () => {
  let mockToken;
  
  beforeEach(() => {
    mockToken = 'mock-token-123';
    jest.clearAllMocks();
  });

  describe('POST /posts', () => {
    const mockPost = {
      content: 'Test post content',
      platforms: ['twitter', 'facebook'],
      scheduledFor: '2024-03-15T10:00:00Z',
      media: ['image1.jpg']
    };

    it('should create a new post with valid data', async () => {
      const response = await request(app)
        .post('/posts')
        .send(mockPost)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(mockPost.content);
      expect(response.body.platforms).toEqual(mockPost.platforms);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          platforms: ['invalid-platform']
        })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /posts', () => {
    it('should return all posts for user', async () => {
      const response = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter posts by platform', async () => {
      const response = await request(app)
        .get('/posts?platform=twitter')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(post => {
        expect(post.platforms).toContain('twitter');
      });
    });
  });

  describe('GET /posts/:id', () => {
    it('should return post by id', async () => {
      const response = await request(app)
        .get('/posts/test-post-id')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('test-post-id');
    });

    it('should return 404 for non-existent post', async () => {
      mockPostService.getPostById.mockRejectedValueOnce(new Error('Post not found'));

      const response = await request(app)
        .get('/posts/non-existent-id')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /posts/:id', () => {
    const updateData = {
      content: 'Updated content',
      platforms: ['twitter', 'linkedin']
    };

    it('should update post with valid data', async () => {
      const response = await request(app)
        .put('/posts/test-post-id')
        .send(updateData)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(updateData.content);
      expect(response.body.platforms).toEqual(updateData.platforms);
    });

    it('should return 404 for non-existent post', async () => {
      mockPostService.updatePost.mockRejectedValueOnce(new Error('Post not found'));

      const response = await request(app)
        .put('/posts/non-existent-id')
        .send(updateData)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete existing post', async () => {
      const response = await request(app)
        .delete('/posts/test-post-id')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post deleted successfully');
    });

    it('should return 404 for non-existent post', async () => {
      mockPostService.deletePost.mockRejectedValueOnce(new Error('Post not found'));

      const response = await request(app)
        .delete('/posts/non-existent-id')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /posts/:id/schedule', () => {
    const scheduleData = {
      scheduledFor: '2024-03-15T10:00:00Z',
      platforms: ['twitter', 'facebook']
    };

    it('should schedule a post', async () => {
      const response = await request(app)
        .post('/posts/test-post-id/schedule')
        .send(scheduleData)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.scheduledFor).toBe(scheduleData.scheduledFor);
    });

    it('should return 400 for invalid schedule time', async () => {
      const response = await request(app)
        .post('/posts/test-post-id/schedule')
        .send({
          scheduledFor: 'invalid-date',
          platforms: ['twitter']
        })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /posts/:id/publish', () => {
    it('should publish a post immediately', async () => {
      const response = await request(app)
        .post('/posts/test-post-id/publish')
        .send({ platforms: ['twitter', 'facebook'] })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('published');
    });

    it('should return 400 for invalid platforms', async () => {
      const response = await request(app)
        .post('/posts/test-post-id/publish')
        .send({ platforms: ['invalid-platform'] })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
