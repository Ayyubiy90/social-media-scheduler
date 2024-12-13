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
  getPostById: jest.fn().mockImplementation((postId) => {
    if (postId === 'non-existent-id') {
      return Promise.reject(new Error('Post not found'));
    }
    return Promise.resolve({
      id: 'test-post-id',
      content: 'Test post content',
      platforms: ['twitter'],
      scheduledFor: '2024-03-15T10:00:00Z'
    });
  }),
  updatePost: jest.fn().mockImplementation((postId, updateData) => {
    if (postId === 'non-existent-id') {
      return Promise.reject(new Error('Post not found'));
    }
    return Promise.resolve({
      id: 'test-post-id',
      ...updateData
    });
  }),
  deletePost: jest.fn().mockImplementation((postId) => {
    if (postId === 'non-existent-id') {
      return Promise.reject(new Error('Post not found'));
    }
    return Promise.resolve(true);
  }),
  schedulePost: jest.fn().mockResolvedValue({
    id: 'test-post-id',
    scheduledFor: '2024-03-15T10:00:00Z'
  }),
  publishPost: jest.fn().mockResolvedValue({
    id: 'test-post-id',
    status: 'published'
  })
};

// Mock the post service module
jest.mock('../../src/services/postService.cjs', () => mockPostService);

module.exports = {
  mockPostService
};
