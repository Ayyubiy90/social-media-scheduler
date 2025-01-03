import React from 'react';
import { Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

interface PlatformStatsListProps {
  stats: Array<{
    name: string;
    followers: number;
    engagement: number;
  }>;
}

export function PlatformStatsList({ stats }: PlatformStatsListProps) {
  console.log("Platform Stats List Data:", stats); // Log the received stats

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'Twitter':
        return <Twitter className="h-5 w-5 text-gray-400" />;
      case 'Instagram':
        return <Instagram className="h-5 w-5 text-gray-400" />;
      case 'LinkedIn':
        return <Linkedin className="h-5 w-5 text-gray-400" />;
      case 'Facebook':
        return <Facebook className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {stats.map((platform) => (
        <div key={platform.name} className="flex items-center justify-between">
          <div className="flex items-center">
            {getPlatformIcon(platform.name)}
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{platform.name}</span>
          </div>
          <div className="flex space-x-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-300">Followers:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">{platform.followers}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-300">Engagement:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">{platform.engagement}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
