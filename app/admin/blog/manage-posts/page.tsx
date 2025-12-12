'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Lock, 
  Loader2, 
  Calendar, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/types/post';
import { categorizePostByDate, PostStatus } from '@/lib/date-utils';
import { DELAYS } from '@/lib/constants';
import { AdminErrorBoundary } from '@/components/AdminErrorBoundary';

function ManagePostsContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, published: 0, scheduled: 0, drafts: 0 });
  const [filter, setFilter] = useState<'all' | PostStatus>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const searchParams = useSearchParams();
  const secretKey = searchParams.get('secret') || '';

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!secretKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/posts?secret=${encodeURIComponent(secretKey)}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts || []);
        setStats(data.stats);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load posts' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load posts';
      setMessage({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  }, [secretKey]);

  useEffect(() => {
    loadPosts();
  }, [secretKey, loadPosts]);

  // Update post published_at
  const updatePost = useCallback(async (postId: string, action: 'publish' | 'unpublish' | 'delete') => {
    setUpdating(postId);
    setMessage(null);

    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/posts/${postId}?secret=${encodeURIComponent(secretKey)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
          },
        });

        const data = await response.json();
        
        if (data.success) {
          setMessage({ type: 'success', text: 'Post deleted successfully' });
          setTimeout(() => {
            loadPosts();
          }, DELAYS.REFRESH_AFTER_UPDATE);
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to delete post' });
        }
      } else {
        const published_at = action === 'publish' ? 'now' : null;
        
        const response = await fetch(`/api/admin/posts/${postId}?secret=${encodeURIComponent(secretKey)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secretKey}`,
          },
          body: JSON.stringify({ published_at }),
        });

        const data = await response.json();
        
        if (data.success) {
          setMessage({ type: 'success', text: data.message || 'Post updated successfully' });
          // Clear message after 2 seconds and refresh
          setTimeout(() => {
            loadPosts();
            setMessage(null);
          }, 800);
              } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update post' });
              }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update post';
      setMessage({ type: 'error', text: message });
    } finally {
      setUpdating(null);
    }
  }, [secretKey, loadPosts]);

  // Filter posts using utility function
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return categorizePostByDate(post.published_at) === filter;
  });


  // Check authorization
  if (!secretKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            Please provide your admin secret key in the URL: <code className="bg-gray-100 px-2 py-1 rounded">?secret=your-key</code>
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Blog Posts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View, publish, unpublish, and manage all your blog posts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  loadPosts();
                }}
                type="button"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <Link
                href={`/admin/blog/create-posts?secret=${encodeURIComponent(secretKey)}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Create New Post
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.scheduled}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.drafts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}

                 {/* Filters */}
                 <div className="flex gap-2 mb-6">
                   {(['all', 'published', 'scheduled', 'draft'] as const).map((f) => (
                     <button
                       key={f}
                       onClick={() => setFilter(f)}
                       className={`px-4 py-2 rounded-lg transition-colors ${
                         filter === f
                           ? 'bg-blue-600 text-white'
                           : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                       }`}
                     >
                       {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + (f === 'draft' ? 's' : '')}
                     </button>
                   ))}
                 </div>
        </div>

        {/* Posts List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No {filter === 'all' ? '' : filter} posts found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPosts.map((post) => {
                const status = categorizePostByDate(post.published_at);
                const isPublished = status === 'published';
                const isScheduled = status === 'scheduled';
                const isDraft = status === 'draft';

                return (
                  <div
                    key={post.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {post.title}
                          </h3>
                          {isPublished && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Published
                            </span>
                          )}
                          {isScheduled && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Scheduled
                            </span>
                          )}
                          {isDraft && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                        </div>

                        {post.excerpt && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.published_at ? (
                              <>
                                {isScheduled ? 'Scheduled for' : 'Published on'}{' '}
                                {new Date(post.published_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </>
                            ) : (
                              'Not scheduled'
                            )}
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>{post.tags.length} tags</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPublished && post.slug && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View post"
                            onClick={(e) => {
                              // Check if post actually exists before navigating
                              if (!post.slug || !post.published_at) {
                                e.preventDefault();
                                setMessage({ type: 'error', text: 'Post is not properly published. Cannot view post.' });
                              }
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {isScheduled && (
                          <button
                            onClick={() => updatePost(post.id, 'publish')}
                            disabled={updating === post.id}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                            title="Publish now"
                          >
                            {updating === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            Publish Now
                          </button>
                        )}
                        {isPublished && (
                          <button
                            onClick={() => updatePost(post.id, 'unpublish')}
                            disabled={updating === post.id}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                            title="Unpublish"
                          >
                            {updating === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                            Unpublish
                          </button>
                        )}
                        {isDraft && (
                          <button
                            onClick={() => updatePost(post.id, 'publish')}
                            disabled={updating === post.id}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                            title="Publish now"
                          >
                            {updating === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            Publish Now
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                              updatePost(post.id, 'delete');
                            }
                          }}
                          disabled={updating === post.id}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          {updating === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManagePostsPage() {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <ManagePostsContent />
      </Suspense>
    </AdminErrorBoundary>
  );
}

