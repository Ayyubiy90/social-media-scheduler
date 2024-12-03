import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';

interface PlatformBarChartProps {
  data: Array<{
    name: string;
    followers: number;
    engagement: number;
  }>;
}

export function PlatformBarChart({ data }: PlatformBarChartProps) {
  const { isDark } = useTheme();

  // Adding Facebook data
  const facebookData = {
    name: 'facebook',
    followers: 1800,
    engagement: 70,
  };
  
  const combinedData = [...data, facebookData];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDark ? '#9CA3AF' : '#4B5563'}
          tick={{ fill: isDark ? '#FFFFFF' : '#4B5563' }}
        />
        <YAxis 
          stroke={isDark ? '#9CA3AF' : '#4B5563'}
          tick={{ fill: isDark ? '#FFFFFF' : '#4B5563' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            color: isDark ? '#FFFFFF' : '#000000'
          }}
        />
        <Bar dataKey="followers" fill={isDark ? '#60A5FA' : '#3B82F6'} />
        <Bar dataKey="engagement" fill={isDark ? '#34D399' : '#10B981'} />
      </BarChart>
    </ResponsiveContainer>
  );
}