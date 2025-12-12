/**
 * Date utility functions for blog posts
 */

export type PostStatus = 'published' | 'scheduled' | 'draft';

/**
 * Categorizes a post based on its published_at date
 * @param publishedAt - ISO date string or null
 * @returns 'published' | 'scheduled' | 'draft'
 */
export function categorizePostByDate(publishedAt: string | null): PostStatus {
  if (!publishedAt) return 'draft';
  
  const now = new Date().toISOString();
  const dateISO = new Date(publishedAt).toISOString();
  
  return dateISO <= now ? 'published' : 'scheduled';
}

/**
 * Checks if a post is published (published_at is in the past or now)
 * @param publishedAt - ISO date string or null
 * @returns true if post is published
 */
export function isPostPublished(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  return new Date(publishedAt).toISOString() <= new Date().toISOString();
}

/**
 * Checks if a post is scheduled (published_at is in the future)
 * @param publishedAt - ISO date string or null
 * @returns true if post is scheduled
 */
export function isPostScheduled(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  return new Date(publishedAt).toISOString() > new Date().toISOString();
}

/**
 * Checks if a post is a draft (published_at is null)
 * @param publishedAt - ISO date string or null
 * @returns true if post is a draft
 */
export function isPostDraft(publishedAt: string | null): boolean {
  return !publishedAt;
}

