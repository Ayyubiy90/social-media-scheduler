export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook';

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledFor: string | null;
  status: 'draft' | 'scheduled' | 'published';
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  connectedPlatforms: Platform[];
}