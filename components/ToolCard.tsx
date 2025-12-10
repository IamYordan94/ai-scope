'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tool } from '@/types/tool';
import { getCategoryColor, formatPricing } from '@/lib/tools';
import { getLogoUrl } from '@/lib/logo-utils';
import { ExternalLink } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
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

  return (
    <Link href={`/tools/${tool.slug}`} className="group" aria-label={`View details for ${tool.name}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {logoUrl && !imageError ? (
              <div className="relative w-12 h-12 flex-shrink-0">
                <img
                  src={logoUrl}
                  alt={`${tool.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain bg-gray-50 border border-gray-100 w-12 h-12"
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                {tool.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">{tool.name}</h3>
              {tool.category && (
                <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getCategoryColor(tool.category)}`}>
                  {tool.category}
                </span>
              )}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {tool.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            {formatPricing(tool.pricing_details)}
          </span>
          {tool.pricing_free && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              Free
            </span>
          )}
        </div>
        
        {tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tool.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
