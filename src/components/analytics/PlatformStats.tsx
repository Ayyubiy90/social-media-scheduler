import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PlatformBarChart } from './charts/PlatformBarChart';
import { PlatformStatsList } from './PlatformStatsList';

export function PlatformStats() {
  const { platformStats } = useAnalytics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow w-full">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Platform Performance</h3>
        
        <div className="space-y-6">
          <div className="h-64 w-full">
            <PlatformBarChart data={platformStats} />
          </div>
          <PlatformStatsList stats={platformStats} />
        </div>
      </div>
    </div>
  );
}