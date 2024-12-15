import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Eye,
  Activity,
  Clock,
} from "lucide-react";
import type { RealTimeMetric } from "../../types/analytics";

interface RealTimeMetricsProps {
  metrics: RealTimeMetric[];
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  metrics,
}) => {
  const getMetricIcon = (name: string) => {
    switch (name) {
      case "Active Users":
        return <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "Page Views":
        return <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case "Engagement Rate":
        return (
          <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      case "Avg. Session":
        return (
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        );
      default:
        return (
          <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-500 dark:text-green-400";
      case "down":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getMetricColor = (name: string) => {
    switch (name) {
      case "Active Users":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "Page Views":
        return "bg-purple-50 dark:bg-purple-900/20";
      case "Engagement Rate":
        return "bg-green-50 dark:bg-green-900/20";
      case "Avg. Session":
        return "bg-orange-50 dark:bg-orange-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className={`rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${getMetricColor(
            metric.name
          )}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {getMetricIcon(metric.name)}
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {metric.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm">
              {getTrendIcon(metric.trend)}
              <span
                className={`text-sm font-medium ${getTrendColor(
                  metric.trend
                )}`}>
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </span>
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metric.value}
              {metric.name === "Engagement Rate" && "%"}
              {metric.name === "Avg. Session" && "m"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
