import { useMemo } from 'react';
import { usePosts } from '../contexts/PostContext';
import { format, subDays } from 'date-fns';

export function useAnalytics() {
  const { posts } = usePosts();

  const engagementData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM d'),
        engagement: Math.floor(Math.random() * 100),
      };
    }).reverse();
  }, []);

  const platformStats = useMemo(() => {
    console.log("Fetching platform stats...");
    const stats = [
      { name: 'Twitter', followers: 8200, engagement: 3.2 },
      { name: 'Instagram', followers: 12400, engagement: 4.8 },
      { name: 'LinkedIn', followers: 5600, engagement: 2.9 },
      { name: 'Facebook', followers: 1800, engagement: 70 },
    ];
    console.log("Platform Stats:", stats);
    return stats;
  }, []);

  const postPerformance = useMemo(() => {
    console.log("Fetching post performance...");
    const performance = posts.map(post => ({
      ...post,
      engagement: Math.floor(Math.random() * 1000),
      reach: Math.floor(Math.random() * 10000),
      clicks: Math.floor(Math.random() * 100),
    }));
    console.log("Post Performance:", performance);
    return performance;
  }, [posts]);

  return {
    engagementData,
    platformStats,
    postPerformance,
  };
}
