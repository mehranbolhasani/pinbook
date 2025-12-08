export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    maxDelay = 10000
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const currentDelay = calculateDelay(attempt, delay, backoff, maxDelay);
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
  
  throw lastError!;
}

function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoff: 'linear' | 'exponential',
  maxDelay: number
): number {
  let delay: number;
  
  if (backoff === 'exponential') {
    delay = baseDelay * Math.pow(2, attempt - 1);
  } else {
    delay = baseDelay * attempt;
  }
  
  return Math.min(delay, maxDelay);
}

// Specific retry configurations for different types of operations
export const retryConfigs = {
  api: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential' as const,
    maxDelay: 5000
  },
  network: {
    maxAttempts: 5,
    delay: 2000,
    backoff: 'exponential' as const,
    maxDelay: 10000
  },
  quick: {
    maxAttempts: 2,
    delay: 500,
    backoff: 'linear' as const,
    maxDelay: 2000
  }
};
