/**
 * Utility functions for fetching and generating logo URLs
 */

/**
 * Extract domain from a URL
 */
export function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

/**
 * Generate logo URL from website URL using multiple fallback services
 * Returns the best available logo URL
 */
export function getLogoUrl(websiteUrl: string | null, existingLogoUrl?: string | null): string | null {
  // If we already have a logo URL (and it's not Clearbit), use it
  if (existingLogoUrl && existingLogoUrl.startsWith('http') && !existingLogoUrl.includes('clearbit.com')) {
    return existingLogoUrl;
  }

  if (!websiteUrl) return null;

  const domain = extractDomain(websiteUrl);
  if (!domain) return null;

  // Try direct favicon first (most accurate)
  // Then fallback to Google's favicon service
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/**
 * Get multiple logo URL options for fallback
 */
export function getLogoUrlOptions(domain: string | null): string[] {
  if (!domain) return [];
  
  return [
    `https://${domain}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://logo.clearbit.com/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
}

/**
 * Get alternative logo URLs for fallback
 */
export function getLogoFallbacks(domain: string | null): string[] {
  if (!domain) return [];
  
  return [
    `https://www.google.com/s2/favicons?domain=${domain}`,
    `https://logo.clearbit.com/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://${domain}/favicon.ico`,
  ];
}

/**
 * Alternative: Use Clearbit logo service
 */
export function getClearbitLogoUrl(domain: string | null): string | null {
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}`;
}

/**
 * Alternative: Use favicon service
 */
export function getFaviconUrl(domain: string | null): string | null {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}`;
}
