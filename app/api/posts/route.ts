import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPostsByTag } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');

    let posts;
    if (tag) {
      posts = await getPostsByTag(tag);
    } else {
      posts = await getAllPosts();
    }

    // Ensure we always return an array
    return NextResponse.json(Array.isArray(posts) ? posts : []);
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}

