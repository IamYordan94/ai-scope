import { NextRequest, NextResponse } from 'next/server';
import { fetchAndAddNewTools } from '@/lib/scraper';
import { getSupabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/tools';
import { comprehensiveTools } from '@/lib/comprehensive-tools';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';

/**
 * Populate database immediately with:
 * 1. All comprehensive tools (60+ tools)
 * 2. Run scraper to fetch latest tools from GitHub, Hugging Face, etc.
 * 
 * This ensures the site is fully populated on first deployment
 */
export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }
  try {
    const supabase = getSupabaseAdmin();
    const results = {
      seeded: 0,
      scraped: { newTools: 0, updatedTools: 0, errors: [] as string[] },
      total: 0,
    };

    // Step 1: Seed comprehensive tools
    console.log('Step 1: Seeding comprehensive tools...');
    for (const tool of comprehensiveTools) {
      try {
        const { error } = await supabase
          .from('tools')
          .upsert({
            name: tool.name,
            slug: slugify(tool.name),
            description: tool.description,
            category: tool.category,
            website_url: tool.website_url,
            logo_url: tool.logo_url || null,
            pricing_free: tool.pricing_free,
            pricing_tier: tool.pricing_tier,
            pricing_details: tool.pricing_details,
            features: tool.features,
            use_cases: tool.use_cases,
            tags: tool.tags,
          }, {
            onConflict: 'slug',
          });

        if (!error) {
          results.seeded++;
        }
      } catch (error: any) {
        console.error(`Error seeding ${tool.name}:`, error);
      }
    }

    // Step 2: Run scraper to fetch additional tools
    console.log('Step 2: Running scraper to fetch latest tools...');
    const scrapeResults = await fetchAndAddNewTools();
    results.scraped = scrapeResults;

    // Get total count
    const { count } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
    
    results.total = count || 0;

    return NextResponse.json({
      success: true,
      message: `Database populated successfully!`,
      results: {
        seeded: results.seeded,
        scrapedNew: results.scraped.newTools,
        scrapedUpdated: results.scraped.updatedTools,
        totalTools: results.total,
        errors: results.scraped.errors,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}

