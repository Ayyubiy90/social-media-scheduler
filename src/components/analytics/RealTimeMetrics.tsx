import React from 'react';
import { TrendingUp, Users, MousePointer, Share2 } from 'lucide-react';

interface RealTimeMetricsProps {
  metrics: {
    currentEngagement: number;
    activeUsers: number;
    clickRate: number;
    shareCount: number;
  };
}

export function RealTimeMetrics({ metrics }: RealTimeMetricsProps) {
  const stats = [
    { name: 'Current Engagement', value: `${metrics.currentEngagement}%`, icon: TrendingUp },
    { name: 'Active Users', value: metrics.activeUsers, icon: Users },
    { name: 'Click Rate', value: `${metrics.clickRate}%`, icon: MousePointer },
    { name: 'Share Count', value: metrics.shareCount, icon: Share2 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Real-Time Metrics</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <stat.icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-300">{stat.name}</span>
            </div>
            <div className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}