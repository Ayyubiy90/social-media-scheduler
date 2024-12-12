import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import type { AnalyticsContextType } from '../types/analytics';

/**
 * Hook to access analytics data and functionality
 * @returns Analytics context containing metrics, stats, and controls
 */
export function useAnalytics(): AnalyticsContextType {
  return useAnalyticsContext();
}

// Re-export types for convenience
export type { AnalyticsContextType };
