'use client';

import { useEffect } from 'react';

export default function AdSenseHead() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="adsbygoogle"]');
    if (existingScript) {
      return;
    }

    // Create and inject the AdSense script into head
    // This ensures it's in the <head> tag as required by Google AdSense
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9007185070437670';
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-ad-client', 'ca-pub-9007185070437670');
    
    // Insert at the beginning of head for better loading
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head.firstChild) {
      head.insertBefore(script, head.firstChild);
    } else {
      head.appendChild(script);
    }
  }, []);

  return null;
}

