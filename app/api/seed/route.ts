import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/tools';

// Simple seed endpoint for testing
export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    const sampleTools = [
      {
        name: 'ChatGPT',
        description: 'Advanced AI chatbot by OpenAI',
        category: 'Text AI',
        website_url: 'https://chat.openai.com',
        logo_url: 'https://logo.clearbit.com/openai.com',
        pricing_free: true,
        pricing_tier: 'freemium',
        pricing_details: { monthly: '$20', free_tier: 'Limited' },
        features: ['Conversational AI', 'Code generation'],
        use_cases: ['Writing', 'Coding'],
        tags: ['chatbot', 'openai'],
      },
    ];

    const results = [];
    for (const tool of sampleTools) {
      const { data, error } = await supabase
        .from('tools')
        .upsert({
          name: tool.name,
          slug: slugify(tool.name),
          description: tool.description,
          category: tool.category,
          website_url: tool.website_url,
          logo_url: tool.logo_url,
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
        results.push({ tool: tool.name, error: error.message });
      } else {
        results.push({ tool: tool.name, success: true });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
