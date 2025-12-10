import { getToolBySlug, getAllTools } from '@/lib/supabase';
import { getRelatedTools, formatPricing, getCategoryColor } from '@/lib/tools';
import AdSense from '@/components/AdSense';
import ToolLogo from '@/components/ToolLogo';
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

        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <ToolLogo tool={tool} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                  {tool.category && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tool.category)}`}>
                      {tool.category}
                    </span>
                  )}
                </div>
                {tool.website_url && (
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                    aria-label={`Visit ${tool.name} website`}
                  >
                    Try Tool <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">{tool.description}</p>
              <div className="flex flex-wrap gap-6">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Pricing</span>
                  <p className="font-semibold text-gray-900 text-lg">{formatPricing(tool.pricing_details)}</p>
                </div>
                {tool.pricing_free && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Free Tier</span>
                    <p className="font-semibold text-green-600 text-lg">Available</p>
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <ul className="space-y-3">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use Cases */}
            {tool.use_cases.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use Cases</h2>
                <ul className="space-y-3">
                  {tool.use_cases.map((useCase, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-xl">•</span>
                      <span className="text-gray-700">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
