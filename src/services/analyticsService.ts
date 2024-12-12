import axios from "axios";
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
    const response = await axios.get<EngagementMetrics[]>(
      `${API_URL}/analytics/engagement?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  // Get platform-specific statistics
  async getPlatformStats(): Promise<PlatformStats[]> {
    const response = await axios.get<PlatformStats[]>(
      `${API_URL}/analytics/platforms`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  // Get analytics for specific posts
  async getPostAnalytics(postIds: string[]): Promise<PostAnalytics[]> {
    const response = await axios.post<PostAnalytics[]>(
      `${API_URL}/analytics/posts`,
      { postIds },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  // Get real-time metrics for active posts
  async getRealTimeMetrics(postIds: string[]): Promise<PostAnalytics[]> {
    const response = await axios.post<PostAnalytics[]>(
      `${API_URL}/analytics/realtime`,
      { postIds },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  // Get engagement heatmap data
  async getEngagementHeatmap(
    platform: string,
    timeframe: "week" | "month" | "year"
  ): Promise<{ day: string; hour: number; value: number }[]> {
    const response = await axios.get<{ day: string; hour: number; value: number }[]>(
      `${API_URL}/analytics/heatmap/${platform}?timeframe=${timeframe}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  // Get performance comparison between platforms
  async getPlatformComparison(
    startDate: string,
    endDate: string
  ): Promise<{ platform: string; metrics: EngagementMetrics }[]> {
    const response = await axios.get<{ platform: string; metrics: EngagementMetrics }[]>(
      `${API_URL}/analytics/comparison?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  },

  // Export analytics data
  async exportAnalytics(
    startDate: string,
    endDate: string,
    format: "csv" | "json"
  ): Promise<Blob> {
    const response = await axios.get<Blob>(
      `${API_URL}/analytics/export?startDate=${startDate}&endDate=${endDate}&format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      }
    );
    return response.data;
  },
};
