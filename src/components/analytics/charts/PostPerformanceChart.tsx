import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '../../../contexts/ThemeContext';

interface PostPerformanceData {
  id: string;
  content: string;
  engagement: number;
  reach: number;
  clicks: number;
  createdAt: string;
}

interface PostPerformanceChartProps {
  data: PostPerformanceData[];
}

export function PostPerformanceChart({ data }: PostPerformanceChartProps) {
  const { isDark } = useTheme();
  
  const chartData = data.map(post => ({
    date: format(new Date(post.createdAt), 'MMM d'),
    engagement: post.engagement,
    reach: post.reach,
    clicks: post.clicks,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? '#9CA3AF' : '#4B5563'}
          tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }}
        />
        <YAxis 
          stroke={isDark ? '#9CA3AF' : '#4B5563'}
          tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            color: isDark ? '#FFFFFF' : '#000000'
          }}
        />
        <Legend 
          wrapperStyle={{
            color: isDark ? '#FFFFFF' : '#000000'
          }}
        />
        <Line type="monotone" dataKey="engagement" stroke={isDark ? '#60A5FA' : '#3B82F6'} name="Engagement" />
        <Line type="monotone" dataKey="reach" stroke={isDark ? '#34D399' : '#10B981'} name="Reach" />
        <Line type="monotone" dataKey="clicks" stroke={isDark ? '#FBBF24' : '#F59E0B'} name="Clicks" />
      </LineChart>
    </ResponsiveContainer>
  );
}