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

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
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
        analyticsService.getEngagementMetrics(
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
        ),
        analyticsService.getPlatformStats(),
        analyticsService.getPostAnalytics([]) // Pass actual post IDs here
      ]);

      setEngagementMetrics(metrics);
      setPlatformStats(stats);
      setPostAnalytics(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
      console.error("Analytics fetch error:", err);
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
    throw new Error("useAnalyticsContext must be used within an AnalyticsProvider");
  }
  return context;
}
