/**
 * Error logging and tracking
 * Centralized error handling and reporting
 */

export interface ErrorLog {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  severity: 'error' | 'warning' | 'info';
  metadata?: Record<string, any>;
}

/**
 * Log error to console and optionally send to error tracking service
 */
export function logError(
  error: Error | string,
  severity: ErrorLog['severity'] = 'error',
  metadata?: Record<string, any>
) {
  const errorLog: ErrorLog = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' && error.stack ? error.stack : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: Date.now(),
    severity,
    metadata,
  };

  // Log to console
  if (severity === 'error') {
    console.error('[Error]', errorLog);
  } else if (severity === 'warning') {
    console.warn('[Warning]', errorLog);
  } else {
    console.info('[Info]', errorLog);
  }

  // In production, send to error tracking service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to custom endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // }).catch(() => {
    //   // Silently fail if error reporting fails
    // });
  }
}

/**
 * Track unhandled errors
 */
export function setupErrorTracking() {
  if (typeof window === 'undefined') return;

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, 'error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      'error',
      { type: 'unhandledrejection' }
    );
  });
}

/**
 * Wrapper for async functions with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        'error',
        { context, args: args.length }
      );
      throw error;
    }
  }) as T;
}

