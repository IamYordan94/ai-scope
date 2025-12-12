import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Tool, Category } from '@/types/tool';
import { Post } from '@/types/post';

// Lazy initialization function
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Missing'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Found' : 'Missing'}\n` +
      'Make sure you have restarted your dev server after creating .env.local'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export a getter function instead of direct client
export function getSupabase() {
  return getSupabaseClient();
}

// Server-side client with service role key for admin operations
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
  }
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in environment variables');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database helper functions
export const getAllTools = async (): Promise<Tool[]> => {
  try {
    const client = getSupabaseClient();
    
    // Simple query - just get all tools
    const { data, error } = await client
      .from('tools')
      .select('*');
    
    if (error) {
      console.error('Error in getAllTools:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
    
    const tools = (data || []) as Tool[];
    
    // Sort by popularity_score if available, otherwise by created_at
    if (tools.length > 0) {
      tools.sort((a, b) => {
        // First try popularity_score
        const scoreA = a.popularity_score || 0;
        const scoreB = b.popularity_score || 0;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        // If scores are equal, sort by created_at
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }
    
    console.log(`getAllTools: Found ${tools.length} tools`);
    return tools;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getAllTools failed:', message);
    throw error;
  }
};

export const getToolBySlug = async (slug: string): Promise<Tool | null> => {
  const { data, error } = await getSupabaseClient()
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data;
};

export const searchTools = async (query: string): Promise<Tool[]> => {
  const { data, error } = await getSupabaseClient()
    .from('tools')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .order('popularity_score', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getToolsByCategory = async (category: string): Promise<Tool[]> => {
  const { data, error } = await getSupabaseClient()
    .from('tools')
    .select('*')
    .eq('category', category)
    .order('popularity_score', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

// Blog post helper functions
/**
 * Get all published blog posts
 * Uses anon client which respects RLS policy: published_at IS NOT NULL AND published_at <= NOW()
 * RLS policy automatically filters, so we don't need manual filtering
 */
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const client = getSupabaseClient(); // Anon client respects RLS
    
    // RLS policy automatically filters: published_at IS NOT NULL AND published_at <= NOW()
    // So we can just query and order - RLS handles the filtering
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('[getAllPosts] Error fetching posts:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    
    // RLS should have already filtered, but double-check in case RLS is disabled
    const now = new Date().toISOString();
    const publishedPosts = (data || []).filter(post => 
      post.published_at && new Date(post.published_at) <= new Date(now)
    ) as Post[];
    
    console.log(`[getAllPosts] Found ${publishedPosts.length} published posts (RLS filtered)`);
    return publishedPosts;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getAllPosts] Failed:', message);
    throw error;
  }
};

/**
 * Get a blog post by slug
 * Uses anon client which respects RLS policy: published_at IS NOT NULL AND published_at <= NOW()
 * RLS policy automatically filters, so we rely on it for published posts
 */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.error('[getPostBySlug] Invalid slug provided');
      return null;
    }

    const client = getSupabaseClient(); // Anon client respects RLS
    const trimmedSlug = slug.trim();
    
    console.log(`[getPostBySlug] Searching for post with slug: "${trimmedSlug}"`);
    
    // RLS policy automatically filters: published_at IS NOT NULL AND published_at <= NOW()
    // So we can just query by slug - RLS handles the filtering
    const { data, error } = await client
      .from('posts')
      .select('*')
      .eq('slug', trimmedSlug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - post not found or not published (RLS filtered it out)
        console.log(`[getPostBySlug] Post with slug "${trimmedSlug}" not found or not published (RLS filtered)`);
        return null;
      }
      console.error('[getPostBySlug] Error fetching post:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        slug: trimmedSlug,
      });
      return null;
    }
    
    if (!data) {
      console.log(`[getPostBySlug] Post with slug "${trimmedSlug}" returned null data`);
      return null;
    }

    // Validate required fields
    if (!data.id || !data.title || !data.slug) {
      console.error('[getPostBySlug] Post data missing required fields:', {
        hasId: !!data.id,
        hasTitle: !!data.title,
        hasSlug: !!data.slug,
        slug: trimmedSlug,
      });
      return null;
    }

    // Ensure content_html exists (can be empty string but not null/undefined)
    if (data.content_html === null || data.content_html === undefined) {
      console.warn(`[getPostBySlug] Post "${trimmedSlug}" has null/undefined content_html, setting to empty string`);
      data.content_html = '';
    }

    // Double-check published_at (RLS should have filtered, but verify)
    if (data.published_at) {
      const publishedDate = new Date(data.published_at);
      const now = new Date();
      if (publishedDate > now) {
        console.warn(`[getPostBySlug] Post "${trimmedSlug}" has future published_at, but RLS allowed it. This shouldn't happen.`);
      }
    } else {
      console.warn(`[getPostBySlug] Post "${trimmedSlug}" has null published_at, but RLS allowed it. This shouldn't happen.`);
    }

    console.log(`[getPostBySlug] Successfully fetched post: "${data.title}"`);
    return data as Post;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[getPostBySlug] Exception:', {
      message,
      stack,
      slug,
    });
    return null;
  }
};

/**
 * Get published blog posts by tag
 * Uses anon client which respects RLS policy: published_at IS NOT NULL AND published_at <= NOW()
 * RLS policy automatically filters, so we don't need manual filtering
 */
export const getPostsByTag = async (tag: string): Promise<Post[]> => {
  try {
    const client = getSupabaseClient(); // Anon client respects RLS
    
    // RLS policy automatically filters: published_at IS NOT NULL AND published_at <= NOW()
    // So we can just query by tag - RLS handles the filtering
    const { data, error } = await client
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('[getPostsByTag] Error fetching posts by tag:', {
        code: error.code,
        message: error.message,
        tag,
      });
      throw error;
    }
    
    // RLS should have already filtered, but double-check in case RLS is disabled
    const now = new Date().toISOString();
    const publishedPosts = (data || []).filter(post => 
      post.published_at && new Date(post.published_at) <= new Date(now)
    ) as Post[];
    
    console.log(`[getPostsByTag] Found ${publishedPosts.length} published posts with tag "${tag}" (RLS filtered)`);
    return publishedPosts;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getPostsByTag] Failed:', message);
    throw error;
  }
};

// Get ALL posts (including drafts and scheduled) - for admin use
export const getAllPostsAdmin = async (): Promise<Post[]> => {
  try {
    // Use admin client to ensure we can read all posts (including drafts)
    const client = getSupabaseAdmin();
    
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all posts:', error);
      throw error;
    }
    
    return (data || []) as Post[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getAllPostsAdmin failed:', message);
    throw error;
  }
};
