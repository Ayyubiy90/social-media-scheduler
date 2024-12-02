import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { EngagementAreaChart } from './charts/EngagementAreaChart';

export function EngagementChart() {
  const { engagementData } = useAnalytics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow w-full">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Engagement Over Time</h3>
        <div className="h-64 w-full">
          <EngagementAreaChart data={engagementData} />
        </div>
      </div>
    </div>
  );
}