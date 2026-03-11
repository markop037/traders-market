"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializePerformanceMonitoring } from '@/lib/performance';
import { initializeErrorTracking } from '@/lib/errorTracking';
import { logPageView } from '@/lib/analytics';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes all monitoring services
 * - Firebase Analytics for user behavior tracking
 * - Firebase Performance Monitoring for performance metrics
 * - Error Tracking for crash reporting (web alternative to Crashlytics)
 */
export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const pathname = usePathname();

  // Initialize monitoring services once on mount
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();

    // Initialize error tracking
    initializeErrorTracking();
  }, []);

  // Track page views on route changes (delayed to let Next.js update document.title)
  useEffect(() => {
    if (pathname) {
      const timer = requestAnimationFrame(() => {
        const pageTitle = document.title || pathname;
        logPageView(pathname, pageTitle);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [pathname]);

  return <>{children}</>;
}
