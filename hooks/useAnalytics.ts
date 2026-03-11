"use client";

import { usePathname } from 'next/navigation';
import {
  logAnalyticsEvent,
  logCtaClick,
  logNavigationClick,
  logPdfGuideRequest,
  logBotDownload,
  logBotDownloadAll,
  logExternalLinkClick,
  logCheckoutEvent,
  logBlogView,
  logBotPickerComplete,
  type TraderMarketEvent,
} from '@/lib/analytics';

/**
 * Hook to provide analytics functions in components.
 * Page views are handled globally by MonitoringProvider — do not duplicate.
 */
export const useAnalytics = () => {
  const pathname = usePathname();

  return {
    currentPath: pathname,
    logEvent: logAnalyticsEvent,
    logCtaClick,
    logNavigationClick,
    logPdfGuideRequest,
    logBotDownload,
    logBotDownloadAll,
    logExternalLinkClick,
    logCheckoutEvent,
    logBlogView,
    logBotPickerComplete,
  };
};
