import React from "react";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

import type { PlatformStats as PlatformStat } from "../../types/analytics";

interface PlatformStatsProps {
  stats: PlatformStat[];
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
};

const platformColors = {
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  instagram: "#E4405F",
};

export const PlatformStats: React.FC<PlatformStatsProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat) => {
        const Icon = platformIcons[stat.platform as keyof typeof platformIcons];
        const color =
          platformColors[stat.platform as keyof typeof platformColors];

        return (
          <div
            key={stat.platform}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center space-x-3 mb-3">
              <Icon style={{ color }} className="w-5 h-5" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                {stat.platform}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Followers
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(stat.followers)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Engagement Rate
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stat.engagement.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg. Likes
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(stat.averageLikes)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg. Comments
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(stat.averageComments)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
