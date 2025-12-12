import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateETag, checkETag, getCacheControl } from '@/lib/cache-utils';
import { TOOL_DETAIL_FIELDS } from '@/lib/query-fields';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Edge Runtime for faster cold starts
export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tools')
      .select(TOOL_DETAIL_FIELDS)
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { 
          status: 404, 
          headers: { 
            'Cache-Control': 'no-cache',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          } 
        }
      );
    }

    // Generate ETag for caching
    const etag = generateETag(data);
    
    // Check if client has cached version (304 Not Modified)
    if (checkETag(request, etag)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': `"${etag}"`,
          'Cache-Control': getCacheControl(3600, 86400),
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        },
      });
    }

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
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { 
        status: 500, 
        headers: { 
          'Cache-Control': 'no-cache',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        } 
      }
    );
  }
}
