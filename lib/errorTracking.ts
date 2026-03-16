import { trackErrorEvent } from './posthog';

export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  lastError?: ErrorInfo;
}

// In-memory error storage for the current session
class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private maxErrors = 100; // Maximum errors to keep in memory

  trackError(error: ErrorInfo): void {
    const errorWithTimestamp = {
      ...error,
      timestamp: error.timestamp || Date.now(),
    };

    this.errors.push(errorWithTimestamp);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    trackErrorEvent(
      errorWithTimestamp.message,
      errorWithTimestamp.severity || 'medium',
      errorWithTimestamp.context,
    );

    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorWithTimestamp);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  getErrorStats(): ErrorStats {
    const errorsByType: Record<string, number> = {};

    this.errors.forEach((error) => {
      const errorType = error.code || 'unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorsByType,
      lastError: this.errors[this.errors.length - 1],
    };
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Track a JavaScript error
 */
export const trackError = (
  error: Error | string,
  context?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void => {
  const errorInfo: ErrorInfo = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    severity,
    context,
  };

  errorTracker.trackError(errorInfo);
};

/**
 * Track a network error
 */
export const trackNetworkError = (
  url: string,
  method: string,
  statusCode: number,
  errorMessage: string
): void => {
  errorTracker.trackError({
    message: `Network Error: ${method} ${url}`,
    code: `HTTP_${statusCode}`,
    severity: statusCode >= 500 ? 'high' : 'medium',
    context: {
      url,
      method,
      statusCode,
      errorMessage,
    },
  });
};

/**
 * Track an authentication error
 */
export const trackAuthError = (
  errorMessage: string,
  errorCode?: string
): void => {
  errorTracker.trackError({
    message: `Auth Error: ${errorMessage}`,
    code: errorCode || 'AUTH_ERROR',
    severity: 'high',
    context: {
      type: 'authentication',
    },
  });
};

/**
 * Track a payment error
 */
export const trackPaymentError = (
  errorMessage: string,
  amount?: number,
  errorCode?: string
): void => {
  errorTracker.trackError({
    message: `Payment Error: ${errorMessage}`,
    code: errorCode || 'PAYMENT_ERROR',
    severity: 'critical',
    context: {
      type: 'payment',
      amount,
    },
  });
};

/**
 * Track a Firestore error
 */
export const trackFirestoreError = (
  operation: string,
  errorMessage: string,
  errorCode?: string
): void => {
  errorTracker.trackError({
    message: `Firestore Error: ${operation} - ${errorMessage}`,
    code: errorCode || 'FIRESTORE_ERROR',
    severity: 'medium',
    context: {
      type: 'firestore',
      operation,
    },
  });
};

/**
 * Initialize global error handlers
 */
export const initializeErrorTracking = (): void => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      { type: 'unhandled_promise_rejection' },
      'high'
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    trackError(
      event.error || event.message,
      {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      'high'
    );
  });

  // Log when the app loads
  if (process.env.NODE_ENV === 'development') {
    console.log('Error tracking initialized');
  }
};

/**
 * Get error statistics for monitoring dashboard
 */
export const getErrorStats = (): ErrorStats => {
  return errorTracker.getErrorStats();
};

/**
 * Clear all tracked errors
 */
export const clearErrors = (): void => {
  errorTracker.clearErrors();
};
