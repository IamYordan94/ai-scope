import Link from 'next/link';
import { getAllPosts } from '@/lib/supabase';
import { Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import AdSense from '@/components/AdSense';

export const metadata: Metadata = {
  title: 'Blog - AI Tool Directory',
  description: 'Read articles about AI tools, reviews, comparisons, and guides to help you choose the best AI tools for your needs.',
  openGraph: {
    title: 'Blog - AI Tool Directory',
    description: 'Read articles about AI tools, reviews, comparisons, and guides.',
    type: 'website',
  },
};

// Disable caching for this page to ensure fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  let posts: any[] = [];
  let errorMessage: string | null = null;
  
  try {
    posts = await getAllPosts();
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Tool Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Discover the latest AI tools, read reviews, comparisons, and guides to help you choose the perfect AI tool for your needs.
          </p>
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdSense />
      </div>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {errorMessage && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              <p>Note: {errorMessage}</p>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Blog Posts Yet</h2>
                <p className="text-gray-600 mb-6">
                  Blog posts will appear here once they're published. Check back soon for articles about AI tools, reviews, and guides!
                </p>
                <Link
                  href="/tools"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Browse AI Tools →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                <p className="text-gray-600 mt-2">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 group"
                  >
                    {post.hero_image_url && (
                      <div className="mb-4 -mx-6 -mt-6 rounded-t-xl overflow-hidden">
                        <img
                          src={post.hero_image_url}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {post.published_at && (
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        )}
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {post.tags.length} {post.tags.length === 1 ? 'tag' : 'tags'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Ad Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdSense />
      </div>
    </div>
  );
}

