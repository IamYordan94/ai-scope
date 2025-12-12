import { getToolBySlug, getAllTools } from '@/lib/supabase';
import { getRelatedTools, formatPricing, getCategoryColor } from '@/lib/tools';
import AdSense from '@/components/AdSense';
import ToolLogo from '@/components/ToolLogo';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { generateMetadata } from './metadata';
import { ToolStructuredData } from './structured-data';

// Lazy load ToolDetailsEnhanced (code splitting)
const ToolDetailsEnhanced = dynamic(() => import('@/components/ToolDetailsEnhanced'), {
  loading: () => <div className="p-6 text-center text-gray-500">Loading additional information...</div>,
  ssr: false,
});

export { generateMetadata };

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

interface ToolPageProps {
  params: {
    slug: string;
  };
}

// Pre-generate popular tool pages at build time
export async function generateStaticParams() {
  try {
    const allTools = await getAllTools().catch(() => []);
    // Pre-generate top 50 most popular tools
    const popularTools = allTools
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
      .slice(0, 50);
    
    return popularTools.map((tool) => ({
      slug: tool.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const tool = await getToolBySlug(params.slug);
  
  if (!tool) {
    notFound();
  }

  const allTools = await getAllTools().catch(() => []);
  const relatedTools = getRelatedTools(tool, allTools);

  return (
    <>
      <ToolStructuredData tool={tool} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Link>

        {/* Hero Section with Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl overflow-hidden card-3d">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 ring-4 ring-white/20">
                <ToolLogo tool={tool} />
              </div>
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">{tool.name}</h1>
                  {tool.category && (
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 ${getCategoryColor(tool.category)}`}>
                      {tool.category}
                    </span>
                  )}
                </div>
                {tool.website_url && (
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-xl hover:shadow-2xl font-bold tilt-3d"
                    aria-label={`Visit ${tool.name} website`}
                  >
                    Try Tool <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="text-white/90 text-lg md:text-xl mb-6 leading-relaxed drop-shadow-md">
                {tool.description || 'Discover this powerful AI tool and see how it can transform your workflow.'}
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <span className="text-white/80 text-sm block mb-1">Pricing</span>
                  <p className="font-bold text-white text-xl">{formatPricing(tool.pricing_details)}</p>
                </div>
                {tool.pricing_free && (
                  <div className="bg-green-500/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-green-300/30">
                    <span className="text-white/80 text-sm block mb-1">Free Tier</span>
                    <p className="font-bold text-green-100 text-xl">Available</p>
                  </div>
                )}
                {tool.popularity_score && tool.popularity_score > 0 && (
                  <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-yellow-300/30">
                    <span className="text-white/80 text-sm block mb-1">Popularity</span>
                    <p className="font-bold text-yellow-100 text-xl">{tool.popularity_score} points</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            {tool.features.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-3d card-3d">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:border-blue-200 dark:hover:border-blue-700 transition-all tilt-3d">
                      <Check className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 bg-green-100 dark:bg-green-900/30 rounded-full p-1" />
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {tool.use_cases.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-3d card-3d">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-full"></div>
                  Use Cases
                </h2>
                <div className="space-y-4">
                  {tool.use_cases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-100 dark:border-purple-800/50 hover:border-purple-200 dark:hover:border-purple-700 transition-all tilt-3d">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                        {idx + 1}
                      </div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-lg pt-1">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-3d">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {tool.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all cursor-default tilt-3d"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Website Info Section with Scraping */}
            <ToolDetailsEnhanced tool={tool} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-3d card-3d">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Tools</h3>
                <div className="space-y-4">
                  {relatedTools.map((relatedTool) => (
                    <Link
                      key={relatedTool.id}
                      href={`/tools/${relatedTool.slug}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all tilt-3d bg-gray-50 dark:bg-gray-900/50"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{relatedTool.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {relatedTool.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ad Section */}
            <AdSense />
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}
