import { useMemo } from 'react';
import { usePosts } from '../contexts/PostContext';

export function useEngagementHeatmap() {
  const { posts } = usePosts();

  const heatmapData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];

    for (const day of days) {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          day,
          hour,
          value: Math.floor(Math.random() * 100), // Simulated engagement data
        });
      }
    }

    return data;
  }, [posts]);

  return heatmapData;
}