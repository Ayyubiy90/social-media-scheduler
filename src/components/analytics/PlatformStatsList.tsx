import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

interface PlatformStatsListProps {
  stats: Array<{
    name: string;
    followers: number;
    engagement: number;
  }>;
}

export function PlatformStatsList({ stats }: PlatformStatsListProps) {
  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'Twitter':
        return <Twitter className="h-5 w-5 text-gray-400" />;
      case 'Instagram':
        return <Instagram className="h-5 w-5 text-gray-400" />;
      case 'LinkedIn':
        return <Linkedin className="h-5 w-5 text-gray-400" />;
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
            <span className="ml-2 text-sm font-medium text-gray-900">{platform.name}</span>
          </div>
          <div className="flex space-x-4 text-sm">
            <div>
              <span className="text-gray-500">Followers:</span>
              <span className="ml-1 font-medium text-gray-900">{platform.followers}</span>
            </div>
            <div>
              <span className="text-gray-500">Engagement:</span>
              <span className="ml-1 font-medium text-gray-900">{platform.engagement}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}