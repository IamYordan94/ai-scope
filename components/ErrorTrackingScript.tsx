'use client';

import { useEffect } from 'react';
import { setupErrorTracking } from '@/lib/error-logging';
import { trackPageLoad } from '@/lib/analytics';

/**
 * Initialize error tracking and performance monitoring
 */
export default function ErrorTrackingScript() {
  useEffect(() => {
    // Setup error tracking
    setupErrorTracking();
    
    // Track page load performance
    trackPageLoad();
  }, []);

  return null;
}

