/**
 * Server-side blog utility functions
 * Helper functions for blog post creation and management
 * Uses Supabase admin client
 */

import { getSupabaseAdmin } from './supabase';
import { slugify } from './tools';

/**
 * Finds the next available publish date for a blog post
 * Ensures 1 post per day with sequential scheduling (no gaps)
 * @returns Promise resolving to the next available Date
 */
export async function getNextAvailablePublishDate(): Promise<Date> {
  const supabase = getSupabaseAdmin();
  
  // Get the latest scheduled post date
  const { data: latestPost } = await supabase
    .from('posts')
    .select('published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to midnight

  let nextDate: Date;

  if (latestPost?.published_at) {
    // Get the date from the latest post
    const latestDate = new Date(latestPost.published_at);
    latestDate.setHours(0, 0, 0, 0);
    
    // Add 1 day
    nextDate = new Date(latestDate);
    nextDate.setDate(nextDate.getDate() + 1);
  } else {
    // No posts yet, use tomorrow
    nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
  }

  // If the calculated date is in the past, use tomorrow instead
  if (nextDate < now) {
    nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

/**
 * Generates a URL-friendly slug from a post title
 * @param title - The post title to convert to a slug
 * @returns A URL-friendly slug string
 */
export function generatePostSlug(title: string): string {
  return slugify(title);
}

