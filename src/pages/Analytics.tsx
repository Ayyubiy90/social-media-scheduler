import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { EngagementChart } from "../components/analytics/EngagementChart";
import { PlatformStats } from "../components/analytics/PlatformStats";
import { PostPerformance } from "../components/analytics/PostPerformance";
import { RealTimeMetrics } from "../components/analytics/RealTimeMetrics";
import { BarChart2 } from "lucide-react";
import type { RealTimeMetric } from "../types/analytics";

const defaultRealTimeMetrics: RealTimeMetric[] = [
  { name: "Active Users", value: 127, change: 12, trend: "up" },
  { name: "Page Views", value: 892, change: 3.2, trend: "up" },
  { name: "Engagement Rate", value: 4.5, change: -0.8, trend: "down" },
  { name: "Avg. Session", value: 2.4, change: 0, trend: "neutral" },
];

function Analytics() {
  const {
    engagementMetrics,
    platformStats,
    postAnalytics,
    loading,
    error,
    timeframe,
    setTimeframe,
  } = useAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-6 h-6" />
                Analytics
              </h1>
              <select
                value={timeframe}
                onChange={(e) =>
                  setTimeframe(e.target.value as "week" | "month" | "year")
                }
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Real-Time Performance
                </h2>
                <RealTimeMetrics metrics={defaultRealTimeMetrics} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Platform Statistics
                </h2>
                <PlatformStats stats={platformStats} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Engagement Overview
                </h2>
                <EngagementChart data={engagementMetrics} />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Post Performance
              </h2>
              <PostPerformance data={postAnalytics} />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
