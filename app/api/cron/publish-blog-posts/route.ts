import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron job to auto-publish scheduled blog posts
 * Runs daily at midnight UTC
 * 
 * Note: Posts are already "published" when published_at is set.
 * This cron job is mainly for logging/monitoring purposes.
 * The blog page query automatically shows posts where published_at <= NOW()
 */
export async function GET(request: NextRequest) {
  // Verify this is a cron request (Vercel Cron sends special header)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  
  // Allow manual trigger with secret key for testing
  const secretKey = request.nextUrl.searchParams.get('secret');
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  
  if (!isVercelCron && (!secretKey || secretKey !== adminSecret)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Find posts that should be published today
    // (published_at is set and <= now, but this is just for logging)
    const { data: postsToPublish, error } = await supabase
      .from('posts')
      .select('id, title, slug, published_at')
      .not('published_at', 'is', null)
      .lte('published_at', now)
      .order('published_at', { ascending: true });

    if (error) {
      console.error('Error fetching posts to publish:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Posts are already "published" (published_at is set)
    // The blog page query automatically shows them
    // This cron job just logs which posts are now visible

    return NextResponse.json({
      success: true,
      message: 'Blog posts checked',
      posts_visible: postsToPublish?.length || 0,
      posts: postsToPublish?.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        published_at: p.published_at,
      })) || [],
      timestamp: now,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

