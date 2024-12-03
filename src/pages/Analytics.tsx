import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useRealTimeMetrics } from '../hooks/useRealTimeMetrics';
import { EngagementChart } from '../components/analytics/EngagementChart';
import { PlatformStats } from '../components/analytics/PlatformStats';
import { PostPerformance } from '../components/analytics/PostPerformance';
import { RealTimeMetrics } from '../components/analytics/RealTimeMetrics';
import { PostPerformanceChart } from '../components/analytics/charts/PostPerformanceChart';

export function Analytics() {
  const { postPerformance, platformStats } = useAnalytics();
  const realTimeMetrics = useRealTimeMetrics();

  console.log("Post Performance:", postPerformance);
  console.log("Platform Stats:", platformStats);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h1>
      
      <div className="space-y-6">
        <RealTimeMetrics metrics={realTimeMetrics} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="w-full">
            <EngagementChart />
          </div>
          <div className="w-full">
            <PlatformStats />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Post Performance Trends</h3>
          <div className="h-80">
            <PostPerformanceChart data={postPerformance} />
          </div>
        </div>

        <div>
          <PostPerformance />
        </div>
      </div>
    </div>
  );
}
