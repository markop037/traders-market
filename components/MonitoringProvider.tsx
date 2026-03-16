"use client";

import { useEffect } from 'react';
import { initializePerformanceMonitoring } from '@/lib/performance';
import { initializeErrorTracking } from '@/lib/errorTracking';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes all monitoring services
 * - Firebase Performance Monitoring for performance metrics
 * - Error Tracking for crash reporting (web alternative to Crashlytics)
 */
export function MonitoringProvider({ children }: MonitoringProviderProps) {
  // Initialize monitoring services once on mount
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();

    // Initialize error tracking
    initializeErrorTracking();
  }, []);

  return <>{children}</>;
}
