import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import type { RealTimeMetric } from "../../types/analytics";

interface RealTimeMetricsProps {
  metrics: RealTimeMetric[];
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  metrics,
}) => {
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
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {metric.name}
          </h3>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </p>
            <div className="flex items-center">
              {getTrendIcon(metric.trend)}
              <span
                className={`ml-2 text-sm font-medium ${getTrendColor(
                  metric.trend
                )}`}>
                {metric.change}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
