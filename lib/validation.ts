/**
 * Validation utilities for form data
 */

import { LIMITS } from './constants';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates post data before submission
 * @param data - Post data to validate
 * @returns Validation result with errors array
 */
export function validatePostData(data: {
  title: string;
  content_html: string;
}): ValidationResult {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length < LIMITS.MIN_TITLE_LENGTH) {
    errors.push(`Title must be at least ${LIMITS.MIN_TITLE_LENGTH} characters`);
  }
  
  if (!data.content_html || data.content_html.trim().length < LIMITS.MIN_CONTENT_LENGTH) {
    errors.push(`Content must be at least ${LIMITS.MIN_CONTENT_LENGTH} characters`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validates tool data
 * @param data - Tool data to validate
 * @returns Validation result with errors array
 */
export function validateToolData(data: {
  name: string;
  description: string;
  website_url: string;
}): ValidationResult {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Tool name must be at least 2 characters');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  if (!data.website_url || !isValidUrl(data.website_url)) {
    errors.push('Valid website URL is required');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

