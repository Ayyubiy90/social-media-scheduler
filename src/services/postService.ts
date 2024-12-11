import axios from "axios";
import { Post } from "../types/database";

const API_URL = import.meta.env.VITE_API_URL;

interface CreatePostData {
  content: string;
  media?: string[];
  platforms: string[];
  scheduledFor?: Date;
  draft?: boolean;
}

interface UpdatePostData {
  content?: string;
  media?: string[];
  platforms?: string[];
  scheduledFor?: Date;
  draft?: boolean;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const postService = {
  // Create a new post
  async createPost(postData: CreatePostData): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>("/posts", postData);
    return response.data.data;
  },

  // Get all posts for the current user
  async getPosts(filters?: {
    status?: string;
    platform?: string;
  }): Promise<Post[]> {
    const response = await api.get<ApiResponse<Post[]>>("/posts", {
      params: filters,
    });
    return response.data.data;
  },

  // Get a single post by ID
  async getPost(postId: string): Promise<Post> {
    const response = await api.get<ApiResponse<Post>>(`/posts/${postId}`);
    return response.data.data;
  },

  // Update an existing post
  async updatePost(postId: string, updateData: UpdatePostData): Promise<Post> {
    const response = await api.put<ApiResponse<Post>>(
      `/posts/${postId}`,
      updateData
    );
    return response.data.data;
  },

  // Delete a post
  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  // Schedule a post
  async schedulePost(postId: string, scheduledFor: Date): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>(
      `/posts/${postId}/schedule`,
      { scheduledFor }
    );
    return response.data.data;
  },

  // Cancel a scheduled post
  async cancelScheduledPost(postId: string): Promise<Post> {
    const response = await api.post<ApiResponse<Post>>(
      `/posts/${postId}/cancel`,
      {}
    );
    return response.data.data;
  },

  // Validate post content for specific platforms
  validatePostContent(
    content: string,
    platform: string
  ): { valid: boolean; message?: string } {
    const platformLimits: Record<string, number> = {
      twitter: 280,
      facebook: 63206,
      linkedin: 3000,
      instagram: 2200,
    };

    const contentLength = content.length;
    const limit = platformLimits[platform];

    if (!limit) {
      return { valid: false, message: "Unsupported platform" };
    }

    if (contentLength > limit) {
      return {
        valid: false,
        message: `Content exceeds ${platform} limit of ${limit} characters`,
      };
    }

    return { valid: true };
  },
};
