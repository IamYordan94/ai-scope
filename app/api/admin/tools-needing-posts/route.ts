import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, getAllPostsAdmin } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';
import { Post } from '@/types/post';
import { Tool } from '@/types/tool';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    // Get all tools and all posts (including drafts and scheduled)
    const [tools, posts] = await Promise.all([
      getAllTools(),
      getAllPostsAdmin(),
    ]);

    // Create a set of tool names that have posts (case-insensitive matching)
    const toolsWithPosts = new Set(
      posts.map((post: Post) => {
        // Try to match tool name in post title (case-insensitive)
        const postTitleLower = post.title.toLowerCase();
        return tools.find((tool: Tool) => 
          postTitleLower.includes(tool.name.toLowerCase()) ||
          tool.name.toLowerCase().includes(postTitleLower.split(' ')[0])
        )?.name;
      }).filter(Boolean)
    );

    // Find tools without posts
    const toolsNeedingPosts = tools
      .filter((tool: Tool) => !toolsWithPosts.has(tool.name))
      .map((tool: Tool) => ({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        category: tool.category,
        description: tool.description,
        website_url: tool.website_url,
        features: tool.features || [],
        pricing_details: tool.pricing_details,
        pricing_tier: tool.pricing_tier,
        pricing_free: tool.pricing_free,
      }));

    return NextResponse.json({
      success: true,
      tools: toolsNeedingPosts,
      count: toolsNeedingPosts.length,
      totalTools: tools.length,
      totalPosts: posts.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tools needing posts';
    console.error('Error fetching tools needing posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: message,
        tools: [],
        count: 0,
        totalTools: 0,
        totalPosts: 0,
      },
      { status: 500 }
    );
  }
}

