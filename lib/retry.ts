/**
 * Retry utility with exponential backoff
 * Handles failed requests with automatic retries
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryable?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryable: () => true, // Retry all errors by default
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      if (!opts.retryable(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }
      
      // Wait before retrying
      await sleep(Math.min(delay, opts.maxDelay));
      
      // Exponential backoff
      delay *= opts.backoffMultiplier;
    }
  }
  
  throw lastError;
}

/**
 * Circuit breaker pattern
 * Prevents cascading failures by stopping requests after too many failures
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    
    // Check if circuit should be reset
    if (this.state === 'open' && now - this.lastFailureTime > this.timeout) {
      this.state = 'half-open';
      this.failures = 0;
    }
    
    // Reject if circuit is open
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      
      // Success - reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = now;
      
      // Open circuit if threshold exceeded
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
  
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breakers for different operations
export const databaseCircuitBreaker = new CircuitBreaker(5, 60000);
export const apiCircuitBreaker = new CircuitBreaker(10, 30000);

