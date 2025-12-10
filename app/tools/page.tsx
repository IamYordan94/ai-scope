import { getAllTools, getAllCategories, searchTools, getToolsByCategory } from '@/lib/supabase';
import ToolCard from '@/components/ToolCard';
import SearchBar from '@/components/SearchBar';
import AdSense from '@/components/AdSense';
import { Filter } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse AI Tools - AI Tool Directory',
  description: 'Browse and discover AI tools for text, image, video, code, and more. Filter by category and find the perfect tool for your needs.',
};

interface ToolsPageProps {
  searchParams: {
    search?: string;
    category?: string;
  };
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const { search, category } = searchParams;
  
  let tools: any[] = [];
  try {
    if (search) {
      tools = await searchTools(search);
    } else if (category) {
      tools = await getToolsByCategory(category);
    } else {
      tools = await getAllTools();
    }
  } catch (error) {
    console.error('Error fetching tools:', error);
    tools = [];
  }

  let categories: any[] = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Tools Directory</h1>
          <p className="text-gray-600 mb-6">
            Discover <span className="font-semibold text-blue-600">{tools.length}</span> AI tools across all categories
          </p>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Ad Section */}
        <div className="mb-8">
          <AdSense />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Categories</h2>
              </div>
              <div className="space-y-2">
                <a
                  href="/tools"
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    !category
                      ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Tools ({tools.length})
                </a>
                {categories.map((cat) => {
                  const toolCount = tools.filter(t => t.category === cat.name).length;
                  return (
                    <a
                      key={cat.id}
                      href={`/tools?category=${encodeURIComponent(cat.name)}`}
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        category === cat.name
                          ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name} ({toolCount})
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Tools Grid */}
          <main className="flex-1">
            {search && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Found {tools.length} results for &quot;{search}&quot;
                </p>
              </div>
            )}
            
            {tools.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm">
                {search ? (
                  <>
                    <p className="text-gray-600 text-lg font-semibold mb-2">No tools found for &quot;{search}&quot;</p>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                    <a 
                      href="/tools" 
                      className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Clear Search
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-lg font-semibold mb-2">Your database is empty</p>
                    <p className="text-gray-500 mb-6">Get started by seeding your database with 30+ popular AI tools</p>
                    <a 
                      href="/seed" 
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      Seed Database with Initial Tools →
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}

            {/* Ad Section */}
            {tools.length > 6 && (
              <div className="mt-8">
                <AdSense />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
