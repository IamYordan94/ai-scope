import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/tools';
import { comprehensiveTools } from '@/lib/comprehensive-tools';

// Full seed with comprehensive tools (60+ popular AI tools)
const initialTools = comprehensiveTools;

export async function POST() {
  try {
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Missing environment variables',
          details: {
            supabaseUrl: supabaseUrl ? 'Found' : 'Missing',
            serviceRoleKey: serviceRoleKey ? 'Found' : 'Missing',
          },
          help: 'Please check your .env.local file and restart your dev server (npm run dev)'
        },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    const results = {
      success: 0,
      errors: [] as any[],
    };

    for (const tool of initialTools) {
      try {
        // Don't store Clearbit URLs - they often fail. Generate on-the-fly instead.
        // Only store logo_url if it's not a Clearbit URL
        const logoUrlToStore = tool.logo_url && !tool.logo_url.includes('clearbit.com') 
          ? tool.logo_url 
          : null;

        const { error } = await supabase
          .from('tools')
          .upsert({
            name: tool.name,
            slug: slugify(tool.name),
            description: tool.description,
            category: tool.category,
            website_url: tool.website_url,
            logo_url: logoUrlToStore, // Store null, will generate from website_url
            pricing_free: tool.pricing_free,
            pricing_tier: tool.pricing_tier,
            pricing_details: tool.pricing_details,
            features: tool.features,
            use_cases: tool.use_cases,
            tags: tool.tags,
          }, {
            onConflict: 'slug',
          });

        if (error) {
          results.errors.push({ tool: tool.name, error: error.message });
        } else {
          results.success++;
        }
      } catch (error: any) {
        results.errors.push({ tool: tool.name, error: error.message });
      }
    }

    return NextResponse.json({
      message: `Seeded ${results.success} tools successfully`,
      success: results.success,
      errors: results.errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
