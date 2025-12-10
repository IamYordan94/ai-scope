'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tool } from '@/types/tool';
import { getCategoryColor, formatPricing } from '@/lib/tools';
import { getLogoUrl, getLogoUrlOptions, extractDomain } from '@/lib/logo-utils';
import { ExternalLink, Star, TrendingUp } from 'lucide-react';

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
    if (retryCount < 3 && tool.website_url) {
      // Try alternative logo sources
      const domain = extractDomain(tool.website_url);
      if (domain) {
        const fallbacks = getLogoUrlOptions(domain);
        if (retryCount < fallbacks.length) {
          setLogoUrl(fallbacks[retryCount]);
          setRetryCount(prev => prev + 1);
          return;
        }
      }
    }
    // All fallbacks failed, show initial
    setImageError(true);
  };

  const isNew = tool.created_at && new Date(tool.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isPopular = (tool.popularity_score || 0) > 10;

  return (
    <Link href={`/tools/${tool.slug}`} className="group block" aria-label={`View details for ${tool.name}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-2 relative overflow-hidden">
        {/* Badge for new/popular tools */}
        {(isNew || isPopular) && (
          <div className="absolute top-4 right-4 z-10">
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                <TrendingUp className="w-3 h-3" />
                New
              </span>
            )}
            {isPopular && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-lg ml-2">
                <Star className="w-3 h-3 fill-current" />
                Popular
              </span>
            )}
          </div>
        )}

        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 dark:from-blue-900/0 dark:via-purple-900/0 dark:to-pink-900/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/50 dark:group-hover:from-blue-900/20 dark:group-hover:via-purple-900/20 dark:group-hover:to-pink-900/20 transition-all duration-300 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {logoUrl && !imageError ? (
                <div className="relative w-14 h-14 flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all rounded-xl overflow-hidden bg-white p-1">
                  <img
                    src={logoUrl}
                    alt={`${tool.name} logo`}
                    width={56}
                    height={56}
                    className="rounded-lg object-contain w-full h-full"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  {tool.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate mb-1">
                  {tool.name}
                </h3>
                {tool.category && (
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryColor(tool.category)}`}>
                    {tool.category}
                  </span>
                )}
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 flex-shrink-0 transition-all" />
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
            {tool.description || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatPricing(tool.pricing_details)}
              </span>
              {tool.pricing_free && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                  Free
                </span>
              )}
            </div>
          </div>
          
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
              {tool.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 font-medium">
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 px-2.5 py-1">
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
