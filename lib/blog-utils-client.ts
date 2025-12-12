/**
 * Client-side blog utility functions
 * Safe to use in React components
 */

/**
 * Extract title from HTML content
 */
export function extractTitleFromContent(content: string): string {
  // Try to find H1 tag
  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]*>/g, '').trim();
  }

  // Try to find first line (remove HTML tags)
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  const firstLine = textContent.split('\n')[0].trim();
  
  if (firstLine.length > 10 && firstLine.length < 100) {
    return firstLine;
  }

  return '';
}

/**
 * Extract excerpt from HTML content
 */
export function extractExcerptFromContent(content: string, maxLength: number = 200): string {
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  
  // Get first paragraph or first few sentences
  const firstParagraph = textContent.split('\n\n')[0] || textContent.split('.')[0];
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  // Truncate to max length
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

/**
 * Extract tags from content and tool data
 */
export function extractTagsFromContent(content: string, toolCategory?: string, toolTags?: string[]): string[] {
  const tags: string[] = [];

  // Add category as tag
  if (toolCategory) {
    tags.push(toolCategory);
  }

  // Add tool tags
  if (toolTags && toolTags.length > 0) {
    tags.push(...toolTags.slice(0, 3));
  }

  // Extract keywords from content (simple approach)
  const contentLower = content.toLowerCase();
  const commonKeywords = ['ai', 'artificial intelligence', 'machine learning', 'automation', 'productivity'];
  
  commonKeywords.forEach(keyword => {
    if (contentLower.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
  });

  // Remove duplicates and limit to 5 tags
  return Array.from(new Set(tags)).slice(0, 5);
}

/**
 * Extract hero image prompt from ChatGPT response
 */
export function extractHeroImagePrompt(content: string): string {
  const match = content.match(/\[HERO_IMAGE_PROMPT\]([\s\S]*?)\[\/HERO_IMAGE_PROMPT\]/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

/**
 * Extract related tools from ChatGPT response
 */
export function extractRelatedTools(content: string): string[] {
  const match = content.match(/\[RELATED_TOOLS\]([\s\S]*?)\[\/RELATED_TOOLS\]/i);
  if (match && match[1]) {
    // Split by lines and clean up
    const tools = match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('-') && !line.startsWith('•'))
      .map(line => {
        // Remove any leading numbers or bullets
        return line.replace(/^[\d\-\•\.\s]+/, '').trim();
      })
      .filter(line => line.length > 0);
    
    return tools.slice(0, 5); // Limit to 5 tools
  }
  return [];
}

/**
 * Remove extracted sections from content (clean up the HTML)
 */
export function cleanContentFromExtractedSections(content: string): string {
  // Remove hero image prompt section
  let cleaned = content.replace(/\[HERO_IMAGE_PROMPT\][\s\S]*?\[\/HERO_IMAGE_PROMPT\]/gi, '');
  
  // Remove related tools section
  cleaned = cleaned.replace(/\[RELATED_TOOLS\][\s\S]*?\[\/RELATED_TOOLS\]/gi, '');
  
  return cleaned.trim();
}

/**
 * Auto-fill post data from ChatGPT response
 */
export function autoFillPostData(
  content: string,
  toolName: string,
  toolCategory?: string,
  toolTags?: string[]
): {
  title: string;
  excerpt: string;
  tags: string[];
  hero_image_prompt: string;
  related_tools: string[];
  cleaned_content: string;
} {
  const heroImagePrompt = extractHeroImagePrompt(content);
  const relatedTools = extractRelatedTools(content);
  const cleanedContent = cleanContentFromExtractedSections(content);
  
  return {
    title: extractTitleFromContent(cleanedContent) || `Complete Guide to ${toolName}`,
    excerpt: extractExcerptFromContent(cleanedContent),
    tags: extractTagsFromContent(cleanedContent, toolCategory, toolTags),
    hero_image_prompt: heroImagePrompt,
    related_tools: relatedTools,
    cleaned_content: cleanedContent,
  };
}

