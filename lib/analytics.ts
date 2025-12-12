/**
 * Performance analytics and monitoring
 * Tracks Core Web Vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // In production, send to analytics service (e.g., Vercel Analytics, Google Analytics)
  if (process.env.NODE_ENV === 'production') {
    // Vercel Analytics automatically tracks Web Vitals
    // For custom analytics, you can send to your endpoint:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    // });
    
    // Log for debugging
    console.log('[Web Vitals]', metric);
  } else {
    // Development: log to console
    console.log('[Web Vitals]', metric);
  }
}

/**
 * Track custom performance metrics
 */
export function trackPerformance(name: string, duration: number, metadata?: Record<string, any>) {
  const metric = {
    name,
    value: duration,
    rating: duration < 1000 ? 'good' : duration < 2500 ? 'needs-improvement' : 'poor',
    metadata,
    timestamp: Date.now(),
  };
  
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    console.log('[Performance]', metric);
  } else {
    console.log('[Performance]', metric);
  }
}

/**
 * Track page load time
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      trackPerformance('page-load', loadTime, {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstByte: navigation.responseStart - navigation.fetchStart,
      });
    }
  });
}

/**
 * Track API response times
 */
export function trackAPIResponse(url: string, duration: number, status: number) {
  trackPerformance(`api-${url}`, duration, {
    url,
    status,
    success: status >= 200 && status < 300,
  });
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(query: string, duration: number) {
  trackPerformance(`db-query`, duration, {
    query,
    slow: duration > 1000,
  });
}

