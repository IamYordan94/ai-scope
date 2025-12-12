import { NextRequest, NextResponse } from 'next/server';
import { fetchAndAddNewTools, validateToolLink } from '@/lib/scraper';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Allow Vercel Cron (has special header) or authorized requests
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  
  if (!isVercelCron && !isAuthorized(request)) {
    return getUnauthorizedResponse();
  }
  
  try {
    console.log('Starting weekly tool update...');
    
    // Fetch and add new tools from various sources
    const results = await fetchAndAddNewTools();

    // Validate some existing tool links (sample check)
    try {
      const supabase = getSupabaseAdmin();
      const { data: sampleTools } = await supabase
        .from('tools')
        .select('id, website_url')
        .limit(10); // Check 10 random tools each time
      
      if (sampleTools) {
        for (const tool of sampleTools) {
          if (tool.website_url) {
            const isValid = await validateToolLink(tool.website_url);
            if (!isValid) {
              console.warn(`Invalid link for tool ${tool.id}: ${tool.website_url}`);
            }
          }
        }
      }
    } catch (validationError) {
      console.error('Error validating links:', validationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly tool update completed',
      results: {
        newTools: results.newTools,
        updatedTools: results.updatedTools,
        errors: results.errors,
      },
      timestamp: new Date().toISOString(),
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
