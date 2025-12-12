/**
 * Optimized field selections for database queries
 * Only fetch fields that are actually used in the UI
 */

// Fields needed for tool listing/cards
export const TOOL_LIST_FIELDS = `
  id,
  name,
  slug,
  description,
  category,
  website_url,
  logo_url,
  pricing_free,
  pricing_tier,
  pricing_details,
  features,
  use_cases,
  tags,
  popularity_score,
  last_updated,
  created_at
`;

// Fields needed for tool detail page
export const TOOL_DETAIL_FIELDS = `
  id,
  name,
  slug,
  description,
  category,
  website_url,
  logo_url,
  pricing_free,
  pricing_tier,
  pricing_details,
  features,
  use_cases,
  tags,
  popularity_score,
  last_updated,
  created_at
`;

// Minimal fields for search results (still need all Tool fields for type compatibility)
export const TOOL_SEARCH_FIELDS = `
  id,
  name,
  slug,
  description,
  category,
  website_url,
  logo_url,
  pricing_free,
  pricing_tier,
  pricing_details,
  features,
  use_cases,
  tags,
  popularity_score,
  last_updated,
  created_at
`;

// Fields for category listing
export const CATEGORY_FIELDS = `
  id,
  name,
  slug,
  description
`;

// Fields for post listing
export const POST_LIST_FIELDS = `
  id,
  title,
  slug,
  excerpt,
  content_html,
  tags,
  hero_image_url,
  related_tools,
  published_at,
  created_at,
  updated_at
`;

// Fields for post detail (same as list, all fields needed)
export const POST_DETAIL_FIELDS = `
  id,
  title,
  slug,
  excerpt,
  content_html,
  tags,
  hero_image_url,
  related_tools,
  published_at,
  created_at,
  updated_at
`;

