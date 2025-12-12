/**
 * Request deduplication cache
 * Prevents duplicate database queries for identical requests
 */

interface CachedRequest {
  data: any;
  timestamp: number;
}

// In-memory cache for request deduplication
const requestCache = new Map<string, CachedRequest>();

// Cache TTL: 5 seconds
const CACHE_TTL = 5 * 1000;

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(...args: any[]): string {
  return JSON.stringify(args);
}

/**
 * Get cached request result
 */
export function getCachedRequest(key: string): any | null {
  const cached = requestCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * Set cached request result
 */
export function setCachedRequest(key: string, data: any): void {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache entry
 */
export function clearCache(key: string): void {
  requestCache.delete(key);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  requestCache.clear();
}

/**
 * Wrap a function with request deduplication
 */
export function withDeduplication<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : generateCacheKey(fn.name, ...args);
    
    // Check cache first
    const cached = getCachedRequest(key);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function
    const result = await fn(...args);
    
    // Cache result
    setCachedRequest(key, result);
    
    return result;
  }) as T;
}

