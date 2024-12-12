export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  reach: number;
  impressions: number;
  date: string;
}

export interface PlatformStats {
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
}

export interface PostMetrics {
  platform: string;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  reach: number;
  impressions: number;
}

export interface PostAnalytics {
  postId: string;
  content: string;
  metrics: {
    [platform: string]: PostMetrics;
  };
  totalEngagement: number;
}

export interface AnalyticsState {
  engagementMetrics: EngagementMetrics[];
  platformStats: PlatformStats[];
  postAnalytics: PostAnalytics[];
  loading: boolean;
  error: string | null;
  timeframe: 'week' | 'month' | 'year';
}

export interface AnalyticsContextType extends AnalyticsState {
  setTimeframe: (timeframe: 'week' | 'month' | 'year') => void;
  refreshAnalytics: () => Promise<void>;
}

export interface RealTimeMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
