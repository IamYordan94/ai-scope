import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, searchTools, getToolsByCategory } from '@/lib/supabase';
import { generateETag, checkETag, getCacheControl } from '@/lib/cache-utils';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Edge Runtime for faster cold starts
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Rate limiting: 100 requests per minute per IP
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, 100, 60 * 1000);
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        },
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let tools;
    if (search) {
      tools = await searchTools(search);
    } else if (category) {
      tools = await getToolsByCategory(category);
    } else {
      tools = await getAllTools();
    }

    // Ensure we always return an array
    const data = Array.isArray(tools) ? tools : [];
    
    // Generate ETag for caching
    const etag = generateETag(data);
    
    // Check if client has cached version (304 Not Modified)
    if (checkETag(request, etag)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': `"${etag}"`,
          'Cache-Control': getCacheControl(3600, 86400),
        },
      });
    }

    // Return data with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': getCacheControl(3600, 86400),
        'ETag': `"${etag}"`,
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    // Return empty array instead of error object
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
