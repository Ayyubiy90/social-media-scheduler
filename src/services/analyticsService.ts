import axiosInstance from "../config/axios";
import type {
  EngagementMetrics,
  PlatformStats,
  PostAnalytics,
  PostMetrics,
} from "../types/analytics";

const API_URL = import.meta.env.VITE_API_URL;

export const analyticsService = {
  // Get engagement metrics for a specific time range
  async getEngagementMetrics(
    startDate: string,
    endDate: string
  ): Promise<EngagementMetrics[]> {
    const response = await axiosInstance.get<EngagementMetrics[]>(
      `${API_URL}/analytics/engagement?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Get platform-specific statistics
  async getPlatformStats(): Promise<PlatformStats[]> {
    // Get stats for all supported platforms
    const platforms = ["facebook", "twitter", "linkedin", "instagram"];
    const stats = await Promise.all(
      platforms.map(async (platform) => {
        try {
          const response = await axiosInstance.get<PlatformStats>(
            `${API_URL}/analytics/platforms/${platform}`
          );
          return response.data;
        } catch (error) {
          console.error(`Error fetching stats for ${platform}:`, error);
          // Return default stats matching PlatformStats interface
          return {
            platform,
            followers: 0,
            engagement: 0,
            posts: 0,
            averageLikes: 0,
            averageComments: 0,
            averageShares: 0,
          };
        }
      })
    );
    return stats;
  },

  // Get analytics for specific posts
  async getPostAnalytics(postIds: string[]): Promise<PostAnalytics[]> {
    const response = await axiosInstance.post<PostAnalytics[]>(
      `${API_URL}/analytics/posts`,
      { postIds }
    );
    return response.data.map((post) => ({
      ...post,
      metrics: post.metrics as { [platform: string]: PostMetrics },
    }));
  },

  // Get real-time metrics for active posts
  async getRealTimeMetrics(postIds: string[]): Promise<PostAnalytics[]> {
    const response = await axiosInstance.post<PostAnalytics[]>(
      `${API_URL}/analytics/realtime`,
      { postIds }
    );
    return response.data;
  },

  // Get engagement heatmap data
  async getEngagementHeatmap(
    platform: string,
    timeframe: "week" | "month" | "year"
  ): Promise<{ day: string; hour: number; value: number }[]> {
    const response = await axiosInstance.get<
      { day: string; hour: number; value: number }[]
    >(`${API_URL}/analytics/heatmap/${platform}?timeframe=${timeframe}`);
    return response.data;
  },

  // Get performance comparison between platforms
  async getPlatformComparison(
    startDate: string,
    endDate: string
  ): Promise<{ platform: string; metrics: EngagementMetrics }[]> {
    const response = await axiosInstance.get<
      { platform: string; metrics: EngagementMetrics }[]
    >(
      `${API_URL}/analytics/comparison?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Export analytics data
  async exportAnalytics(
    startDate: string,
    endDate: string,
    format: "csv" | "json"
  ): Promise<Blob> {
    const response = await axiosInstance.get<Blob>(
      `${API_URL}/analytics/export?startDate=${startDate}&endDate=${endDate}&format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
