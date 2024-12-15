import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  BarChart2,
} from "lucide-react";
import type { PostAnalytics } from "../../types/analytics";

interface PostPerformanceProps {
  data: PostAnalytics[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    fill: string;
  }[];
  label?: string;
}

interface LegendPayloadItem {
  value: string;
  type: string;
  id: string;
  color: string;
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          {label}
        </p>
        {payload.map((entry, index) => {
          const platform = entry.name.split(" ")[0].toLowerCase();
          const Icon = platformIcons[platform as keyof typeof platformIcons];

          return (
            <div key={index} className="flex items-center gap-2 mb-2">
              {Icon && (
                <Icon className="w-4 h-4" style={{ color: entry.fill }} />
              )}
              {!Icon && entry.name === "Total Engagement" && (
                <BarChart2 className="w-4 h-4 text-indigo-500" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {entry.name}: {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      {payload.map((entry, index) => {
        const platform = entry.value.split(" ")[0].toLowerCase();
        const Icon = platformIcons[platform as keyof typeof platformIcons];

        return (
          <div key={index} className="flex items-center gap-2">
            {Icon && (
              <Icon className="w-4 h-4" style={{ color: entry.color }} />
            )}
            {!Icon && entry.value === "Total Engagement" && (
              <BarChart2 className="w-4 h-4 text-indigo-500" />
            )}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const PostPerformance: React.FC<PostPerformanceProps> = ({ data }) => {
  const formatData = (posts: PostAnalytics[]) => {
    return posts.map((post) => ({
      content: post.content.substring(0, 30) + "...",
      totalEngagement: post.totalEngagement,
      ...Object.entries(post.metrics).reduce(
        (acc, [platform, metrics]) => ({
          ...acc,
          [`${platform}_likes`]: metrics.likes,
          [`${platform}_shares`]: metrics.shares,
          [`${platform}_comments`]: metrics.comments,
        }),
        {}
      ),
    }));
  };

  const formattedData = formatData(data);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}>
          <defs>
            <linearGradient id="totalEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
            vertical={false}
          />
          <XAxis
            dataKey="content"
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-sm text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-sm text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="totalEngagement"
            fill="url(#totalEngagement)"
            name="Total Engagement"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="facebook_likes"
            stackId="a"
            fill="#1877F2"
            name="Facebook Likes"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="twitter_likes"
            stackId="a"
            fill="#1DA1F2"
            name="Twitter Likes"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="linkedin_likes"
            stackId="a"
            fill="#0A66C2"
            name="LinkedIn Likes"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="instagram_likes"
            stackId="a"
            fill="#E4405F"
            name="Instagram Likes"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
