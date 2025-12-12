// Automated scraper for fetching new AI tools from various sources
import { getSupabaseAdmin } from './supabase';
import { slugify } from './tools';

interface ScrapedTool {
  name: string;
  description: string;
  category: string;
  website_url: string;
  logo_url?: string;
  pricing_free: boolean;
  pricing_tier: string;
  pricing_details?: any;
  features: string[];
  use_cases: string[];
  tags: string[];
}

// Fetch from Product Hunt API (requires API key, but we'll use a free alternative)
export async function fetchFromProductHunt(): Promise<ScrapedTool[]> {
  try {
    // Product Hunt API requires authentication
    // For now, we'll use an alternative approach
    // You can add Product Hunt API key to .env.local if you have one
    const apiKey = process.env.PRODUCT_HUNT_API_KEY;
    
    if (!apiKey) {
      // Return empty if no API key - we'll use other sources
      return [];
    }

    // Product Hunt API call would go here
    // const response = await fetch('https://api.producthunt.com/v2/api/graphql', {...});
    
    return [];
  } catch (error) {
    console.error('Error fetching from Product Hunt:', error);
    return [];
  }
}

// Scrape from "There's An AI For That" directory
export async function scrapeTheresAnAIForThat(): Promise<ScrapedTool[]> {
  try {
    // This is a popular AI tool directory
    // We'll use their API if available, or scrape their site
    const response = await fetch('https://theresanaiforthat.com/api/ai/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Tool-Directory/1.0)',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Transform their data format to our format
    return data.slice(0, 20).map((item: any) => ({
      name: item.name || item.title || 'Unknown Tool',
      description: item.description || item.summary || '',
      category: categorizeTool(item.name, item.description || ''),
      website_url: item.url || item.website || '',
      logo_url: item.logo || item.image || `https://logo.clearbit.com/${extractDomain(item.url || item.website || '')}`,
      pricing_free: item.pricing?.free !== false,
      pricing_tier: item.pricing?.free ? 'freemium' : 'paid',
      pricing_details: item.pricing || {},
      features: item.features || [],
      use_cases: item.use_cases || [],
      tags: item.tags || item.categories || [],
    })).filter((tool: ScrapedTool) => tool.name !== 'Unknown Tool');
  } catch (error) {
    console.error('Error scraping There\'s An AI For That:', error);
    return [];
  }
}

// Scrape from RSS feeds and AI tool aggregators
export async function scrapeAIToolRSS(): Promise<ScrapedTool[]> {
  try {
    // Try to fetch from various RSS feeds or APIs
    // Many AI tool directories don't have public APIs, so we'll use alternative sources
    
    // Alternative: Scrape from popular AI tool list pages
    // Note: This is a placeholder - actual scraping would require parsing HTML
    // For now, we'll focus on sources with APIs
    
    return [];
  } catch (error) {
    console.error('Error scraping RSS feeds:', error);
    return [];
  }
}

// Scrape from Hugging Face Spaces (popular AI tool hosting)
export async function scrapeHuggingFaceSpaces(): Promise<ScrapedTool[]> {
  try {
    // Hugging Face Spaces API
    const response = await fetch(
      'https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=30',
      {
        headers: {
          'User-Agent': 'AI-Tool-Directory/1.0',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((space: any) => space.likes > 10 && space.sdk === 'gradio') // Popular Gradio spaces
      .map((space: any) => ({
        name: space.id.split('/').pop()?.replace(/-/g, ' ') || space.id,
        description: space.cardData?.description || space.description || `AI tool: ${space.id}`,
        category: categorizeTool(space.id, space.cardData?.description || ''),
        website_url: `https://huggingface.co/spaces/${space.id}`,
        logo_url: space.cardData?.thumbnail ? `https://huggingface.co${space.cardData.thumbnail}` : undefined,
        pricing_free: true,
        pricing_tier: 'free',
        pricing_details: { free_tier: 'Available' },
        features: space.tags || [],
        use_cases: [],
        tags: [...(space.tags || []), 'huggingface', 'gradio'],
      }))
      .slice(0, 20);
  } catch (error) {
    console.error('Error scraping Hugging Face:', error);
    return [];
  }
}

// Scrape from GitHub Topics (AI-related repositories)
export async function scrapeGitHubAITools(): Promise<ScrapedTool[]> {
  try {
    // Multiple GitHub searches for different AI tool types
    const queries = [
      'topic:ai-tool topic:artificial-intelligence stars:>10',
      'topic:ai-assistant topic:chatbot stars:>10',
      'topic:ml-tool topic:machine-learning stars:>10',
      'topic:llm topic:language-model stars:>10',
    ];

    const allRepos: any[] = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'AI-Tool-Directory',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            allRepos.push(...data.items);
          }
        }
        
        // Rate limiting - wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error in GitHub query ${query}:`, error);
      }
    }

    // Remove duplicates and filter
    const uniqueRepos = Array.from(
      new Map(allRepos.map((repo: any) => [repo.id, repo])).values()
    );

    return uniqueRepos
      .filter((repo: any) => {
        // Filter: must have homepage or be a well-known tool
        const hasHomepage = repo.homepage && repo.homepage.startsWith('http');
        const hasDescription = repo.description && repo.description.length > 20;
        const starCount = repo.stargazers_count || 0;
        const hasStars = starCount > 5; // At least some popularity
        
        return (hasHomepage || starCount > 20) && hasDescription;
      })
      .map((repo: any) => {
        const domain = extractDomain(repo.homepage || repo.html_url);
        return {
          name: repo.name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: repo.description || `Open-source ${repo.name} AI tool`,
          category: categorizeTool(repo.name, repo.description || ''),
          website_url: repo.homepage || repo.html_url,
          logo_url: domain ? `https://logo.clearbit.com/${domain}` : undefined,
          pricing_free: true,
          pricing_tier: 'free',
          pricing_details: { free_tier: 'Open source' },
          features: extractFeaturesFromDescription(repo.description || ''),
          use_cases: [],
          tags: [...(repo.topics || []), 'open-source', 'github'],
        };
      })
      .slice(0, 30); // Limit to 30 tools
  } catch (error) {
    console.error('Error scraping GitHub:', error);
    return [];
  }
}

// Helper function to categorize tools based on name/description
function categorizeTool(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('image') || text.includes('photo') || text.includes('picture') || text.includes('visual')) {
    return 'Image AI';
  }
  if (text.includes('video') || text.includes('movie') || text.includes('film')) {
    return 'Video AI';
  }
  if (text.includes('code') || text.includes('programming') || text.includes('developer') || text.includes('coding')) {
    return 'Code AI';
  }
  if (text.includes('audio') || text.includes('sound') || text.includes('voice') || text.includes('music')) {
    return 'Audio AI';
  }
  if (text.includes('productivity') || text.includes('automation') || text.includes('workflow')) {
    return 'Productivity AI';
  }
  return 'Text AI'; // Default
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// Extract features from description
function extractFeaturesFromDescription(description: string): string[] {
  if (!description) return [];
  
  const features: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  // Common feature keywords
  const featureKeywords = [
    'api', 'integration', 'real-time', 'collaboration', 'analytics',
    'automation', 'customization', 'export', 'import', 'templates',
    'multi-language', 'cloud', 'mobile', 'desktop', 'web-based',
    'encryption', 'security', 'backup', 'sync', 'offline'
  ];
  
  // Extract features based on keywords
  featureKeywords.forEach(keyword => {
    if (lowerDesc.includes(keyword)) {
      features.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  // Limit to 5 features max
  return features.slice(0, 5);
}

// Validate tool link
export async function validateToolLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'follow',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Main function to fetch and add new tools from various sources
 * Fetches from GitHub, Hugging Face, and other sources
 * Automatically categorizes, validates, and deduplicates tools
 * @returns Promise resolving to object with counts of new/updated tools and any errors
 */
export async function fetchAndAddNewTools(): Promise<{
  newTools: number;
  updatedTools: number;
  errors: string[];
}> {
  const results = {
    newTools: 0,
    updatedTools: 0,
    errors: [] as string[],
  };

  try {
    const supabase = getSupabaseAdmin();
    
    // Fetch from multiple sources
    const [productHuntTools, theresAnAITools, githubTools, huggingFaceTools] = await Promise.all([
      fetchFromProductHunt(),
      scrapeTheresAnAIForThat(),
      scrapeGitHubAITools(),
      scrapeHuggingFaceSpaces(),
    ]);

    // Combine all tools
    const allNewTools = [
      ...productHuntTools,
      ...theresAnAITools,
      ...githubTools,
      ...huggingFaceTools,
    ];

    // Remove duplicates based on URL
    const uniqueTools = Array.from(
      new Map(allNewTools.map(tool => [tool.website_url, tool])).values()
    );

    // Add tools to database
    for (const tool of uniqueTools) {
      try {
        // Check if tool already exists
        const { data: existing } = await supabase
          .from('tools')
          .select('id, name')
          .eq('slug', slugify(tool.name))
          .single();

        if (existing) {
          // Update existing tool
          const { error } = await supabase
            .from('tools')
            .update({
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
              last_updated: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (!error) {
            results.updatedTools++;
          } else {
            results.errors.push(`Update error for ${tool.name}: ${error.message}`);
          }
        } else {
          // Validate URL before inserting
          const isValidUrl = tool.website_url && tool.website_url.startsWith('http');
          if (!isValidUrl) {
            results.errors.push(`Invalid URL for ${tool.name}: ${tool.website_url}`);
            continue;
          }

          // Insert new tool
          const { error } = await supabase.from('tools').insert({
            name: tool.name,
            slug: slugify(tool.name),
            description: tool.description.substring(0, 500), // Limit description length
            category: tool.category,
            website_url: tool.website_url,
            logo_url: tool.logo_url,
            pricing_free: tool.pricing_free,
            pricing_tier: tool.pricing_tier,
            pricing_details: tool.pricing_details,
            features: tool.features.slice(0, 10), // Limit features
            use_cases: tool.use_cases.slice(0, 10), // Limit use cases
            tags: tool.tags.slice(0, 15), // Limit tags
          });

          if (!error) {
            results.newTools++;
          } else {
            results.errors.push(`Insert error for ${tool.name}: ${error.message}`);
          }
        }
      } catch (error: any) {
        results.errors.push(`Error processing ${tool.name}: ${error.message}`);
      }
    }

    return results;
  } catch (error: any) {
    results.errors.push(`Fatal error: ${error.message}`);
    return results;
  }
}
