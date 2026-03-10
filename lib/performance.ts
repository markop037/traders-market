import { trace, PerformanceTrace } from 'firebase/performance';
import { performance as firebasePerformance } from './firebase';

// Active traces map to prevent duplicate traces
const activeTraces = new Map<string, PerformanceTrace>();

/**
 * Start a custom trace to measure specific operations
 * @param traceName - Unique name for the trace
 * @returns The trace object or null if performance is not initialized
 */
export const startTrace = (traceName: string): PerformanceTrace | null => {
  if (!firebasePerformance) {
    console.warn('Performance monitoring not initialized');
    return null;
  }

  try {
    // Stop any existing trace with the same name before starting a new one
    // (handles React Strict Mode's double-invocation of effects in development)
    if (activeTraces.has(traceName)) {
      try {
        activeTraces.get(traceName)!.stop();
      } catch {
        // ignore stop errors on the stale trace
      }
      activeTraces.delete(traceName);
    }

    const customTrace = trace(firebasePerformance, traceName);
    customTrace.start();
    activeTraces.set(traceName, customTrace);
    return customTrace;
  } catch (error) {
    console.error(`Error starting trace "${traceName}":`, error);
    return null;
  }
};

/**
 * Stop a custom trace
 * @param traceName - Name of the trace to stop
 */
export const stopTrace = (traceName: string): void => {
  const customTrace = activeTraces.get(traceName);
  
  if (!customTrace) {
    return;
  }

  try {
    customTrace.stop();
    activeTraces.delete(traceName);
  } catch (error) {
    console.error(`Error stopping trace "${traceName}":`, error);
  }
};

/**
 * Add custom metric to a trace
 * @param traceName - Name of the trace
 * @param metricName - Name of the metric
 * @param value - Metric value
 */
export const putTraceMetric = (
  traceName: string,
  metricName: string,
  value: number
): void => {
  const customTrace = activeTraces.get(traceName);
  
  if (!customTrace) {
    console.warn(`No active trace found with name "${traceName}"`);
    return;
  }

  try {
    customTrace.putMetric(metricName, value);
  } catch (error) {
    console.error(`Error adding metric to trace "${traceName}":`, error);
  }
};

/**
 * Add custom attribute to a trace
 * @param traceName - Name of the trace
 * @param attributeName - Name of the attribute
 * @param value - Attribute value
 */
export const putTraceAttribute = (
  traceName: string,
  attributeName: string,
  value: string
): void => {
  const customTrace = activeTraces.get(traceName);
  
  if (!customTrace) {
    console.warn(`No active trace found with name "${traceName}"`);
    return;
  }

  try {
    customTrace.putAttribute(attributeName, value);
  } catch (error) {
    console.error(`Error adding attribute to trace "${traceName}":`, error);
  }
};

/**
 * Measure an async operation
 * @param traceName - Name for the trace
 * @param operation - The async operation to measure
 * @param attributes - Optional attributes to add to the trace
 * @returns The result of the operation
 */
export const measureOperation = async <T>(
  traceName: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string>
): Promise<T> => {
  const customTrace = startTrace(traceName);

  // Add attributes if provided
  if (customTrace && attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      putTraceAttribute(traceName, key, value);
    });
  }

  try {
    const result = await operation();
    stopTrace(traceName);
    return result;
  } catch (error) {
    // Add error attribute
    if (customTrace) {
      putTraceAttribute(traceName, 'error', 'true');
      putTraceAttribute(traceName, 'error_message', String(error));
    }
    stopTrace(traceName);
    throw error;
  }
};

/**
 * Measure a synchronous operation
 * @param traceName - Name for the trace
 * @param operation - The operation to measure
 * @param attributes - Optional attributes to add to the trace
 * @returns The result of the operation
 */
export const measureSync = <T>(
  traceName: string,
  operation: () => T,
  attributes?: Record<string, string>
): T => {
  const customTrace = startTrace(traceName);

  // Add attributes if provided
  if (customTrace && attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      putTraceAttribute(traceName, key, value);
    });
  }

  try {
    const result = operation();
    stopTrace(traceName);
    return result;
  } catch (error) {
    // Add error attribute
    if (customTrace) {
      putTraceAttribute(traceName, 'error', 'true');
      putTraceAttribute(traceName, 'error_message', String(error));
    }
    stopTrace(traceName);
    throw error;
  }
};

/**
 * Common traces for Traders Market workflows
 */
export const TraderMarketTraces = {
  // Authentication traces
  LOGIN_FLOW: 'login_flow',
  SIGNUP_FLOW: 'signup_flow',
  LOGOUT_FLOW: 'logout_flow',
  
  // Data loading traces
  LOAD_USER_DATA: 'load_user_data',
  LOAD_BOTS_DATA: 'load_bots_data',
  LOAD_SUBSCRIPTION_STATUS: 'load_subscription_status',
  
  // Payment traces
  CHECKOUT_FLOW: 'checkout_flow',
  PAYMENT_PROCESSING: 'payment_processing',
  
  // Page rendering traces
  DASHBOARD_RENDER: 'dashboard_render',
  BOTS_PAGE_RENDER: 'bots_page_render',
  HOME_PAGE_RENDER: 'home_page_render',
  
  // API calls
  API_PAYMENT_SUCCESS: 'api_payment_success',
  API_SEND_PDF: 'api_send_pdf',
  
  // Firestore operations
  FIRESTORE_READ: 'firestore_read',
  FIRESTORE_WRITE: 'firestore_write',
} as const;

/**
 * Measure page load time using Navigation Timing API
 */
export const measurePageLoad = (): void => {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  // Wait for page to fully load
  window.addEventListener('load', () => {
    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      const traceName = 'page_load';
      const customTrace = startTrace(traceName);
      
      if (customTrace) {
        // Add detailed timing metrics
        putTraceMetric(traceName, 'dns_time', perfData.domainLookupEnd - perfData.domainLookupStart);
        putTraceMetric(traceName, 'tcp_time', perfData.connectEnd - perfData.connectStart);
        putTraceMetric(traceName, 'request_time', perfData.responseStart - perfData.requestStart);
        putTraceMetric(traceName, 'response_time', perfData.responseEnd - perfData.responseStart);
        putTraceMetric(traceName, 'dom_processing', perfData.domComplete - perfData.domInteractive);
        putTraceMetric(traceName, 'load_complete', perfData.loadEventEnd - perfData.loadEventStart);
        
        // Add page path as attribute
        putTraceAttribute(traceName, 'page_path', window.location.pathname);
        
        stopTrace(traceName);
      }
    }
  });
};

/**
 * Measure First Contentful Paint (FCP)
 */
export const measureFCP = (): void => {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const traceName = 'first_contentful_paint';
          const customTrace = startTrace(traceName);
          
          if (customTrace) {
            putTraceMetric(traceName, 'fcp_time', entry.startTime);
            putTraceAttribute(traceName, 'page_path', window.location.pathname);
            stopTrace(traceName);
          }
          
          observer.disconnect();
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  } catch (error) {
    console.error('Error measuring FCP:', error);
  }
};

/**
 * Initialize performance monitoring
 * Call this once when the app starts
 */
export const initializePerformanceMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  measurePageLoad();
  measureFCP();
};
