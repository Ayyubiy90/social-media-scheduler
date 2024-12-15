import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import { ThumbsUp, Share2, MessageCircle } from "lucide-react";
import type { EngagementMetrics } from "../../types/analytics";

interface EngagementChartProps {
  data: EngagementMetrics[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    stroke: string;
    fill: string;
    dataKey: string;
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

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            {entry.name === "Likes" && (
              <ThumbsUp className="w-4 h-4 text-blue-500" />
            )}
            {entry.name === "Shares" && (
              <Share2 className="w-4 h-4 text-green-500" />
            )}
            {entry.name === "Comments" && (
              <MessageCircle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          {entry.value === "Likes" && (
            <ThumbsUp className="w-4 h-4 text-blue-500" />
          )}
          {entry.value === "Shares" && (
            <Share2 className="w-4 h-4 text-green-500" />
          )}
          {entry.value === "Comments" && (
            <MessageCircle className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}>
            <defs>
              <linearGradient id="likes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="shares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="comments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
              vertical={false}
            />
            <XAxis
              dataKey="date"
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
            <Area
              type="monotone"
              dataKey="likes"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#likes)"
              name="Likes"
            />
            <Area
              type="monotone"
              dataKey="shares"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#shares)"
              name="Shares"
            />
            <Area
              type="monotone"
              dataKey="comments"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#comments)"
              name="Comments"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
