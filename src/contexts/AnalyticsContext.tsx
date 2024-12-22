import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { analyticsService } from "../services/analyticsService";
import { format, subDays } from "date-fns";
import type {
  EngagementMetrics,
  PlatformStats,
  PostAnalytics,
  AnalyticsContextType,
} from "../types/analytics";

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

const defaultPlatformStats: PlatformStats[] = [
  {
    platform: "facebook",
    followers: 0,
    engagement: 0,
    posts: 0,
    averageLikes: 0,
    averageComments: 0,
    averageShares: 0,
  },
  {
    platform: "twitter",
    followers: 0,
    engagement: 0,
    posts: 0,
    averageLikes: 0,
    averageComments: 0,
    averageShares: 0,
  },
  {
    platform: "linkedin",
    followers: 0,
    engagement: 0,
    posts: 0,
    averageLikes: 0,
    averageComments: 0,
    averageShares: 0,
  },
  {
    platform: "instagram",
    followers: 0,
    engagement: 0,
    posts: 0,
    averageLikes: 0,
    averageComments: 0,
    averageShares: 0,
  },
];

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [engagementMetrics, setEngagementMetrics] = useState<
    EngagementMetrics[]
  >([]);
  const [platformStats, setPlatformStats] =
    useState<PlatformStats[]>(defaultPlatformStats);
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = (() => {
        switch (timeframe) {
          case "week":
            return subDays(endDate, 7);
          case "month":
            return subDays(endDate, 30);
          case "year":
            return subDays(endDate, 365);
        }
      })();

      const [metrics, stats, posts] = await Promise.all([
        analyticsService
          .getEngagementMetrics(
            format(startDate, "yyyy-MM-dd"),
            format(endDate, "yyyy-MM-dd")
          )
          .catch((err) => {
            console.error("Error fetching engagement metrics:", err);
            return [];
          }),
        analyticsService.getPlatformStats().catch((err) => {
          console.error("Error fetching platform stats:", err);
          return defaultPlatformStats;
        }),
        analyticsService.getPostAnalytics([]).catch((err) => {
          console.error("Error fetching post analytics:", err);
          return [];
        }),
      ]);

      setEngagementMetrics(metrics || []);
      setPlatformStats(stats || defaultPlatformStats);
      setPostAnalytics(posts || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
      // Set default values on error
      setEngagementMetrics([]);
      setPlatformStats(defaultPlatformStats);
      setPostAnalytics([]);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const value: AnalyticsContextType = {
    engagementMetrics,
    platformStats,
    postAnalytics,
    loading,
    error,
    timeframe,
    setTimeframe,
    refreshAnalytics: fetchAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error(
      "useAnalyticsContext must be used within an AnalyticsProvider"
    );
  }
  return context;
}
