import { NextRequest, NextResponse } from 'next/server';
import { scrapeGitHubAITools, scrapeHuggingFaceSpaces, scrapeTheresAnAIForThat } from '@/lib/scraper';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }
  try {
    const results = {
      github: { count: 0, tools: [] as any[] },
      huggingface: { count: 0, tools: [] as any[] },
      theresAnAI: { count: 0, tools: [] as any[] },
      errors: [] as string[],
    };

    // Test GitHub scraper
    try {
      const githubTools = await scrapeGitHubAITools();
      results.github = {
        count: githubTools.length,
        tools: githubTools.slice(0, 5).map(t => ({
          name: t.name,
          category: t.category,
          website_url: t.website_url,
        })),
      };
    } catch (error: any) {
      results.errors.push(`GitHub: ${error.message}`);
    }

    // Test Hugging Face scraper
    try {
      const hfTools = await scrapeHuggingFaceSpaces();
      results.huggingface = {
        count: hfTools.length,
        tools: hfTools.slice(0, 5).map(t => ({
          name: t.name,
          category: t.category,
          website_url: t.website_url,
        })),
      };
    } catch (error: any) {
      results.errors.push(`Hugging Face: ${error.message}`);
    }

    // Test There's An AI For That scraper
    try {
      const taaiTools = await scrapeTheresAnAIForThat();
      results.theresAnAI = {
        count: taaiTools.length,
        tools: taaiTools.slice(0, 5).map(t => ({
          name: t.name,
          category: t.category,
          website_url: t.website_url,
        })),
      };
    } catch (error: any) {
      results.errors.push(`There's An AI: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Scraper test completed',
      results,
      totalFound: results.github.count + results.huggingface.count + results.theresAnAI.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
