import { NextRequest, NextResponse } from 'next/server';
import { getToolBySlug } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    const tool = await getToolBySlug(params.slug);

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Format pricing information
    let pricingInfo = 'Free';
    if (tool.pricing_tier === 'paid') {
      pricingInfo = 'Paid subscription required';
    } else if (tool.pricing_tier === 'freemium') {
      pricingInfo = 'Free tier available + paid plans';
    }
    if (tool.pricing_details) {
      const details = typeof tool.pricing_details === 'string' 
        ? JSON.parse(tool.pricing_details) 
        : tool.pricing_details;
      if (details.monthly) pricingInfo += ` (${details.monthly}/month)`;
    }

    // Format features list
    const featuresList = (tool.features || [])
      .map((f: string) => `  • ${f}`)
      .join('\n');

    // Generate optimized ChatGPT template
    const template = `Create a comprehensive blog post about ${tool.name} for my AI tools directory website.

Tool Details:
- Name: ${tool.name}
- Category: ${tool.category || 'AI Tool'}
- Website: ${tool.website_url || 'N/A'}
- Description: ${tool.description || 'No description available'}
${featuresList ? `- Features:\n${featuresList}` : ''}
- Pricing: ${pricingInfo}
${tool.pricing_free ? '- Free Tier: Available' : ''}

Requirements:
- 800-1200 words
- SEO-optimized with keywords: ${tool.name}, ${tool.category || 'AI'}, ${(tool.tags || []).slice(0, 3).join(', ')}
- Include these sections:
  1. Introduction (hook the reader, mention what ${tool.name} is)
  2. Key Features (detailed breakdown of main features)
  3. Pricing Information (clear explanation of pricing tiers)
  4. Use Cases (real-world examples of how to use ${tool.name})
  5. Pros and Cons (balanced view)
  6. Conclusion (call to action to try the tool)
- Format as clean HTML with proper headings (h2, h3)
- Make it engaging, informative, and helpful
- Include internal links to related tools where relevant
- Add a call-to-action to try ${tool.name}
- Write in a professional but accessible tone

Additional Requirements:
1. Hero Image Prompt: At the end of your response, provide a DALL-E style image generation prompt for a hero image. Format it as:
   [HERO_IMAGE_PROMPT]
   Your detailed prompt here for generating a hero image for this blog post
   [/HERO_IMAGE_PROMPT]

2. Related Tools: Also at the end, suggest 3-5 related AI tools that users might be interested in. These should be tools in similar categories or with similar use cases. Format as:
   [RELATED_TOOLS]
   Tool Name 1
   Tool Name 2
   Tool Name 3
   Tool Name 4
   Tool Name 5
   [/RELATED_TOOLS]

Please generate the blog post now, including the hero image prompt and related tools at the end.`;

    return NextResponse.json({
      success: true,
      template,
      tool: {
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
        tags: tool.tags || [],
      },
    });
  } catch (error: any) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

