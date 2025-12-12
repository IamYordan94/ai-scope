import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';
import { POST_DETAIL_FIELDS } from '@/lib/query-fields';
import { categorizePostByDate } from '@/lib/date-utils';
import { Post } from '@/types/post';
import { PostsListResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // Get all posts (including drafts and scheduled) - use * to ensure we get all fields
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Categorize posts using utility function
    const allPosts = (posts || []) as Post[];
    const categorized = {
      published: allPosts.filter(p => categorizePostByDate(p.published_at) === 'published'),
      scheduled: allPosts.filter(p => categorizePostByDate(p.published_at) === 'scheduled'),
      drafts: allPosts.filter(p => categorizePostByDate(p.published_at) === 'draft'),
    };

    const response: PostsListResponse = {
      success: true,
      posts: allPosts,
      stats: {
        total: allPosts.length,
        published: categorized.published.length,
        scheduled: categorized.scheduled.length,
        drafts: categorized.drafts.length,
      },
      categorized,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch posts';
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}

