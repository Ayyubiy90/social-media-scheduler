import { useState, useEffect } from 'react';

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    currentEngagement: 0,
    activeUsers: 0,
    clickRate: 0,
    shareCount: 0,
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics({
        currentEngagement: Math.random() * 5 + 2,
        activeUsers: Math.floor(Math.random() * 100 + 50),
        clickRate: Math.random() * 3 + 1,
        shareCount: Math.floor(Math.random() * 50 + 20),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}