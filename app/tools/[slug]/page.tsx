import { getToolBySlug, getAllTools } from '@/lib/supabase';
import { getRelatedTools, formatPricing, getCategoryColor } from '@/lib/tools';
import AdSense from '@/components/AdSense';
import ToolLogo from '@/components/ToolLogo';
import ToolDetailsEnhanced from '@/components/ToolDetailsEnhanced';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { generateMetadata } from './metadata';
import { ToolStructuredData } from './structured-data';

export { generateMetadata };

interface ToolPageProps {
  params: {
    slug: string;
  };
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Link>

        {/* Hero Section with Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl overflow-hidden">
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl font-bold hover:scale-105 transform"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5 bg-green-100 rounded-full p-1" />
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {tool.use_cases.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  Use Cases
                </h2>
                <div className="space-y-4">
                  {tool.use_cases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                        {idx + 1}
                      </div>
                      <span className="text-gray-800 font-medium text-lg pt-1">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {tool.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all cursor-default"
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Tools</h3>
                <div className="space-y-4">
                  {relatedTools.map((relatedTool) => (
                    <Link
                      key={relatedTool.id}
                      href={`/tools/${relatedTool.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{relatedTool.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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
