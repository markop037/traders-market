import { 
  logEvent, 
  setUserId, 
  setUserProperties,
  Analytics 
} from 'firebase/analytics';
import { analytics } from './firebase';

// Custom event types for type safety
export type TraderMarketEvent = 
  | 'page_view'
  | 'login'
  | 'signup'
  | 'logout'
  | 'bot_view'
  | 'bot_secret_reveal'
  | 'navigation_click'
  | 'checkout_initiated'
  | 'payment_success'
  | 'payment_failed'
  | 'blog_view'
  | 'bundle_view'
  | 'dashboard_access'
  | 'error_occurred'
  | 'custom_trace_complete'
  | 'bot_picker_complete'
  | 'cta_click'
  | 'pdf_guide_request'
  | 'bot_download'
  | 'bot_download_all'
  | 'external_link_click';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Log a custom event to Google Analytics
 */
export const logAnalyticsEvent = (
  eventName: TraderMarketEvent,
  params?: EventParams
) => {
  if (!analytics) return;

  try {
    // Firebase SDK types only include a subset of events; custom names (e.g. page_view, login) are valid at runtime
    logEvent(analytics, eventName as Parameters<typeof logEvent>[1], {
      ...params,
      timestamp: Date.now(),
      app_name: 'Traders Market',
    });
  } catch {
    // Silently ignore analytics logging errors
  }
};

function getPageCategory(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/bundle')) return 'product';
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/bot-picker') || path.startsWith('/tools')) return 'tool';
  if (path.startsWith('/login') || path.startsWith('/signup')) return 'auth';
  if (path.startsWith('/payment')) return 'payment';
  if (path.startsWith('/privacy') || path.startsWith('/terms')) return 'legal';
  return 'other';
}

/**
 * Track page views
 */
export const logPageView = (pagePath: string, pageTitle: string) => {
  logAnalyticsEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_category: getPageCategory(pagePath),
  });
};

/**
 * Track user authentication events
 */
export const logAuthEvent = (
  eventType: 'login' | 'signup' | 'logout',
  method?: string
) => {
  logAnalyticsEvent(eventType, {
    method: method || 'email',
  });
};

/**
 * Track bot-related events
 */
export const logBotEvent = (
  eventType: 'bot_view' | 'bot_secret_reveal',
  botId: string,
  botName: string
) => {
  logAnalyticsEvent(eventType, {
    bot_id: botId,
    bot_name: botName,
  });
};

/**
 * Track navigation clicks
 */
export const logNavigationClick = (
  destination: string,
  source: string
) => {
  logAnalyticsEvent('navigation_click', {
    destination,
    source,
  });
};

/**
 * Track checkout and payment events
 */
export const logCheckoutEvent = (
  eventType: 'checkout_initiated' | 'payment_success' | 'payment_failed',
  amount?: number,
  currency?: string,
  errorMessage?: string
) => {
  logAnalyticsEvent(eventType, {
    amount,
    currency: currency || 'USD',
    error_message: errorMessage,
  });
};

/**
 * Track blog views
 */
export const logBlogView = (
  blogTitle: string,
  blogSlug: string
) => {
  logAnalyticsEvent('blog_view', {
    blog_title: blogTitle,
    blog_slug: blogSlug,
  });
};

/**
 * Track errors
 */
export const logErrorEvent = (
  errorMessage: string,
  errorStack?: string,
  errorCode?: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
) => {
  logAnalyticsEvent('error_occurred', {
    error_message: errorMessage,
    error_stack: errorStack,
    error_code: errorCode,
    severity: severity || 'medium',
  });
};

/**
 * Set user ID for analytics (call when user logs in)
 */
export const setAnalyticsUserId = (userId: string | null) => {
  if (!analytics) return;

  try {
    if (userId) {
      setUserId(analytics, userId);
    }
  } catch {
    // Silently ignore analytics user ID errors
  }
};

/**
 * Set user properties (call when user data is available)
 */
export const setAnalyticsUserProperties = (properties: {
  subscription_status?: 'free' | 'premium';
  has_paid?: boolean;
  signup_date?: string;
  user_type?: string;
  [key: string]: string | boolean | undefined;
}) => {
  if (!analytics) return;

  try {
    setUserProperties(analytics, properties);
  } catch {
    // Silently ignore analytics user properties errors
  }
};

/**
 * Track custom business metrics
 */
export const logCustomMetric = (
  metricName: string,
  value: number,
  unit?: string
) => {
  logAnalyticsEvent('custom_trace_complete', {
    metric_name: metricName,
    value,
    unit: unit || 'ms',
  });
};

/**
 * Track bot picker quiz completion
 */
export const logBotPickerComplete = (
  preferences: { strategy?: string; timeframe?: string; frequency?: string },
  resultsCount: number
) => {
  logAnalyticsEvent('bot_picker_complete', {
    strategy: preferences.strategy || 'none',
    timeframe: preferences.timeframe || 'none',
    frequency: preferences.frequency || 'none',
    results_count: resultsCount,
  });
};

/**
 * Track CTA button clicks
 */
export const logCtaClick = (
  ctaText: string,
  ctaLocation: string,
  destination?: string
) => {
  logAnalyticsEvent('cta_click', {
    cta_text: ctaText,
    cta_location: ctaLocation,
    destination: destination || '',
  });
};

/**
 * Track PDF guide requests (lead capture)
 */
export const logPdfGuideRequest = (source: string) => {
  logAnalyticsEvent('pdf_guide_request', {
    source,
  });
};

/**
 * Track bot downloads
 */
export const logBotDownload = (
  botName: string,
  fileName: string
) => {
  logAnalyticsEvent('bot_download', {
    bot_name: botName,
    file_name: fileName,
  });
};

/**
 * Track download-all action
 */
export const logBotDownloadAll = (botCount: number) => {
  logAnalyticsEvent('bot_download_all', {
    bot_count: botCount,
  });
};

/**
 * Track external link clicks
 */
export const logExternalLinkClick = (url: string, label: string) => {
  logAnalyticsEvent('external_link_click', {
    url,
    label,
  });
};
