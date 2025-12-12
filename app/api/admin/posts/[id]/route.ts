import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { published_at } = body;

    const supabase = getSupabaseAdmin();

    // Update the post
    const updateData: {
      updated_at: string;
      published_at?: string | null;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (published_at !== undefined) {
      // If published_at is null, it's a draft
      // If published_at is a date string, use it
      // If published_at is "now", set to current time
      if (published_at === null) {
        updateData.published_at = null;
      } else if (published_at === 'now') {
        updateData.published_at = new Date().toISOString();
      } else {
        updateData.published_at = new Date(published_at).toISOString();
      }
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
      message: published_at === 'now' 
        ? 'Post published immediately!' 
        : published_at === null
        ? 'Post saved as draft'
        : 'Post updated successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update post';
    console.error('Error updating post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete post';
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}

