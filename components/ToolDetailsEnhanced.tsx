'use client';

import { useState, useEffect } from 'react';
import { Tool } from '@/types/tool';
import { scrapeWebsiteInfo } from '@/lib/website-scraper';
import { Loader2, ExternalLink, Info } from 'lucide-react';

interface ToolDetailsEnhancedProps {
  tool: Tool;
}

export default function ToolDetailsEnhanced({ tool }: ToolDetailsEnhancedProps) {
  const [websiteInfo, setWebsiteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch website info when component mounts
    if (tool.website_url) {
      setLoading(true);
      scrapeWebsiteInfo(tool.website_url)
        .then((info) => {
          if (info) {
            setWebsiteInfo(info);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError('Could not fetch additional information');
          setLoading(false);
        });
    }
  }, [tool.website_url]);

  if (!tool.website_url) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-blue-200 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Information</h3>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching latest information from website...
            </div>
          )}
          {error && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          )}
          {websiteInfo && !loading && (
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {websiteInfo.description && websiteInfo.description !== tool.description && (
                <p className="leading-relaxed">{websiteInfo.description}</p>
              )}
              {websiteInfo.keywords && websiteInfo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {websiteInfo.keywords.slice(0, 5).map((keyword: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Visit official website for more details
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

