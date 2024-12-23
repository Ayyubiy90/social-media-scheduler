import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { EngagementChart } from "../components/analytics/EngagementChart";
import { PlatformStats } from "../components/analytics/PlatformStats";
import { PostPerformance } from "../components/analytics/PostPerformance";
import { RealTimeMetrics } from "../components/analytics/RealTimeMetrics";
import {
  BarChart2,
  Clock,
  TrendingUp,
  Activity,
  FileText,
  Download,
} from "lucide-react";
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300 flex items-center gap-3">
          <Activity className="w-5 h-5 animate-pulse" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <BarChart2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white pr-2">
                  Analytics
                </h1>
              </div>
              <select
                value={timeframe}
                onChange={(e) =>
                  setTimeframe(e.target.value as "week" | "month" | "year")
                }
                className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 w-full sm:w-64">
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </div>

          {/* Real-Time & Platform Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 transform transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Real-Time Performance
                </h2>
              </div>
              <RealTimeMetrics metrics={defaultRealTimeMetrics} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 transform transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Platform Statistics
                </h2>
              </div>
              <PlatformStats stats={platformStats} />
            </div>
          </div>

          {/* Engagement Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Engagement Overview
              </h2>
            </div>
            <EngagementChart data={engagementMetrics} />
          </div>

          {/* Post Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Post Performance
              </h2>
            </div>
            <PostPerformance data={postAnalytics} />

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 shadow-lg hover:shadow-xl">
                <Download className="w-5 h-5" />
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
