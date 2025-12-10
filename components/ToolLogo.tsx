'use client';

import { useState } from 'react';
import { Tool } from '@/types/tool';
import { getLogoUrl } from '@/lib/logo-utils';

export default function ToolLogo({ tool }: { tool: Tool }) {
  const [imageError, setImageError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    // Prefer existing logo_url (if not Clearbit), then generate from website_url
    if (tool.logo_url && tool.logo_url.startsWith('http') && !tool.logo_url.includes('clearbit.com')) {
      return tool.logo_url;
    }
    // Always generate from website_url - more reliable
    return getLogoUrl(tool.website_url, tool.logo_url);
  });
  const [retryCount, setRetryCount] = useState(0);

  // Handle image errors - try fallbacks before giving up
  const handleImageError = () => {
    if (retryCount < 2 && tool.website_url) {
      // Try alternative logo sources
      const domain = tool.website_url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      const fallbacks = [
        `https://logo.clearbit.com/${domain}`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      ];
      
      if (retryCount < fallbacks.length) {
        setLogoUrl(fallbacks[retryCount]);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    // All fallbacks failed, show initial
    setImageError(true);
  };

  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={`${tool.name} logo`}
        width={120}
        height={120}
        className="rounded-lg object-contain bg-gray-50 w-[120px] h-[120px]"
        onError={handleImageError}
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-[120px] h-[120px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-4xl shadow-md">
      {tool.name.charAt(0)}
    </div>
  );
}
