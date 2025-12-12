'use client';

import { useEffect } from 'react';
import { trackPageLoad } from '@/lib/analytics';

/**
 * Web Vitals component
 * Tracks basic performance metrics
 * Note: For full Web Vitals tracking, enable Vercel Analytics or install web-vitals package
 */
export default function WebVitals() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Track page load performance
    trackPageLoad();

    // Track basic performance metrics using Performance API
    if ('PerformanceObserver' in window) {
      try {
        // Track Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            console.log('[Web Vitals] LCP:', lastEntry.renderTime || lastEntry.loadTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log('[Web Vitals] FID:', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('[Web Vitals] CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        // Performance Observer not supported or failed
        console.warn('Performance Observer not available');
      }
    }
  }, []);

  return null;
}

