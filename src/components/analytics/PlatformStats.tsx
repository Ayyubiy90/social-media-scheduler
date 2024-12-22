import React from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Users,
  Heart,
  MessageCircle,
  Percent,
} from "lucide-react";
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
  facebook: {
    text: "text-[#1877F2]",
    bg: "bg-[#1877F2]/10",
    hover: "hover:bg-[#1877F2]/20",
  },
  twitter: {
    text: "text-[#1DA1F2]",
    bg: "bg-[#1DA1F2]/10",
    hover: "hover:bg-[#1DA1F2]/20",
  },
  linkedin: {
    text: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]/10",
    hover: "hover:bg-[#0A66C2]/20",
  },
  instagram: {
    text: "text-[#E4405F]",
    bg: "bg-[#E4405F]/10",
    hover: "hover:bg-[#E4405F]/20",
  },
};

export const PlatformStats: React.FC<PlatformStatsProps> = ({ stats = [] }) => {
  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "0";

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const metrics = [
    { name: "Followers", icon: Users },
    { name: "Engagement Rate", icon: Percent },
    { name: "Avg. Likes", icon: Heart },
    { name: "Avg. Comments", icon: MessageCircle },
  ];

  const getValue = (stat: PlatformStat, metricName: string) => {
    if (!stat) return "0";

    switch (metricName) {
      case "Followers":
        return formatNumber(stat.followers ?? 0);
      case "Engagement Rate":
        return `${(stat.engagement ?? 0).toFixed(1)}%`;
      case "Avg. Likes":
        return formatNumber(stat.averageLikes ?? 0);
      case "Avg. Comments":
        return formatNumber(stat.averageComments ?? 0);
      default:
        return "0";
    }
  };

  // If no stats are provided, show default platforms with zero values
  const defaultPlatforms = ["facebook", "twitter", "linkedin", "instagram"];
  const displayStats =
    stats.length > 0
      ? stats
      : defaultPlatforms.map((platform) => ({
          platform,
          followers: 0,
          engagement: 0,
          posts: 0,
          averageLikes: 0,
          averageComments: 0,
          averageShares: 0,
        }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {displayStats.map((stat) => {
        const Icon = platformIcons[stat.platform as keyof typeof platformIcons];
        const colors =
          platformColors[stat.platform as keyof typeof platformColors];

        if (!Icon || !colors) return null;

        return (
          <div
            key={stat.platform}
            className={`rounded-lg p-6 transition-all duration-200 ${colors.bg} ${colors.hover}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {stat.platform}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <div
                  key={metric.name}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {metric.name}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {getValue(stat, metric.name)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
