export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMs?: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private blockedUntil: number = 0;

  constructor(private config: RateLimitConfig) {}

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Check if we're still blocked
    if (now < this.blockedUntil) {
      return false;
    }

    // Clean old requests outside the window
    const windowStart = now - this.config.windowMs;
    this.requests = this.requests.filter(time => time > windowStart);

    // Check if we can make a new request
    return this.requests.length < this.config.maxRequests;
  }

  recordRequest(): void {
    const now = Date.now();
    this.requests.push(now);
  }

  blockFor(duration: number): void {
    this.blockedUntil = Date.now() + duration;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.config.maxRequests) {
      return 0;
    }

    const oldestRequest = Math.min(...this.requests);
    const timeUntilWindowReset = this.config.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, timeUntilWindowReset);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentRequests = this.requests.filter(time => time > windowStart);
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  reset(): void {
    this.requests = [];
    this.blockedUntil = 0;
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Pinboard API rate limits (conservative estimates)
  pinboard: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    backoffMs: 5000, // 5 seconds
  },
  
  // Metadata fetching (more lenient)
  metadata: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    backoffMs: 2000, // 2 seconds
  },
  
  // Bulk operations (very conservative)
  bulk: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    backoffMs: 10000, // 10 seconds
  },
};

// Global rate limiters
export const rateLimiters = {
  pinboard: new RateLimiter(rateLimitConfigs.pinboard),
  metadata: new RateLimiter(rateLimitConfigs.metadata),
  bulk: new RateLimiter(rateLimitConfigs.bulk),
};

// Rate limit decorator for API calls
export function withRateLimit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  rateLimiter: RateLimiter,
  operationName: string = 'operation'
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    // Check if we can make the request
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getTimeUntilNextRequest();
      throw new Error(
        `Rate limit exceeded for ${operationName}. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`
      );
    }

    try {
      // Record the request
      rateLimiter.recordRequest();
      
      // Execute the function
      const result = await fn(...args);
      return result;
    } catch (error) {
      // If it's a rate limit error from the server, block for backoff time
      if (error instanceof Error && error.message.includes('rate limit')) {
        const backoffMs = rateLimiter['config'].backoffMs || 5000;
        rateLimiter.blockFor(backoffMs);
      }
      throw error;
    }
  };
}

// Queue system for rate-limited operations
export class RateLimitedQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }> = [];
  
  private processing = false;

  constructor(private rateLimiter: RateLimiter) {}

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.queue.push({
        id,
        operation,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        if (rateLimiters.pinboard.canMakeRequest()) {
          const result = await item.operation();
          item.resolve(result);
          this.queue.shift();
        } else {
          // Wait for rate limit to reset
          const waitTime = rateLimiters.pinboard.getTimeUntilNextRequest();
          if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      } catch (error) {
        item.reject(error);
        this.queue.shift();
      }
    }

    this.processing = false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

// Export queue instances
export const rateLimitedQueues = {
  pinboard: new RateLimitedQueue(rateLimiters.pinboard),
  metadata: new RateLimitedQueue(rateLimiters.metadata),
  bulk: new RateLimitedQueue(rateLimiters.bulk),
};
