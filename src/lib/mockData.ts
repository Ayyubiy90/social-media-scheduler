import { Platform, Post, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  connectedPlatforms: ['twitter', 'instagram']
};

export const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Excited to announce our new features! #ProductUpdate',
    platforms: ['twitter', 'linkedin'],
    scheduledFor: '2024-03-20T10:00:00Z',
    status: 'scheduled',
    mediaUrls: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'],
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z'
  },
  {
    id: '2',
    content: 'Check out our latest blog post on social media strategies!',
    platforms: ['twitter', 'instagram', 'linkedin'],
    scheduledFor: null,
    status: 'draft',
    mediaUrls: [],
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-14T15:30:00Z'
  }
];