import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';

interface EngagementAreaChartProps {
  data: Array<{
    date: string;
    engagement: number;
  }>;
}

export function EngagementAreaChart({ data }: EngagementAreaChartProps) {
  const { isDark } = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
        <Area 
          type="monotone" 
          dataKey="engagement" 
          stroke={isDark ? '#60A5FA' : '#3B82F6'} 
          fill={isDark ? '#1E40AF' : '#93C5FD'} 
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}