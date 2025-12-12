'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AdSenseProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
}

export default function AdSense({ 
  slot = '1234567890', 
  style = { display: 'block' },
  format = 'auto',
  responsive = true 
}: AdSenseProps) {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  // Hide ad spaces completely until AdSense ID is configured
  if (!adsenseId) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      <Script id={`adsense-${slot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </>
  );
}
