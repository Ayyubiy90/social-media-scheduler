import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { PostAnalytics } from "../../types/analytics";

interface PostPerformanceProps {
  data: PostAnalytics[];
}

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
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="content"
            angle={-45}
            textAnchor="end"
            height={60}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-gray-600 dark:text-gray-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar
            dataKey="totalEngagement"
            fill="#3B82F6"
            name="Total Engagement"
          />
          <Bar
            dataKey="facebook_likes"
            stackId="a"
            fill="#1877F2"
            name="Facebook Likes"
          />
          <Bar
            dataKey="twitter_likes"
            stackId="a"
            fill="#1DA1F2"
            name="Twitter Likes"
          />
          <Bar
            dataKey="linkedin_likes"
            stackId="a"
            fill="#0A66C2"
            name="LinkedIn Likes"
          />
          <Bar
            dataKey="instagram_likes"
            stackId="a"
            fill="#E4405F"
            name="Instagram Likes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
