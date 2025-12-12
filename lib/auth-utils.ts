/**
 * Simple authentication utilities for admin routes
 * Uses a secret key from environment variables
 */

/**
 * Check if request is authorized with admin secret key
 */
export function isAuthorized(request: Request): boolean {
  // In development, allow without key (for easier testing)
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, require secret key
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  if (!adminSecret) {
    // If no secret is set, deny access in production
    return false;
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${adminSecret}`) {
    return true;
  }

  // Check query parameter (for GET requests)
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  if (secretParam === adminSecret) {
    return true;
  }

  return false;
}

/**
 * Get unauthorized response
 */
export function getUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Unauthorized',
      message: 'This endpoint requires authentication. Please provide a valid secret key.'
    }),
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

