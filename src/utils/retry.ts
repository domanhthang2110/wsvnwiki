interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

export class RetryManager {
  /**
   * Execute an operation with retry logic and exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error;
    let currentDelay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Operation failed (attempt ${attempt}/${config.maxRetries}):`,
          error
        );

        if (attempt < config.maxRetries) {
          console.log(`Retrying in ${currentDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay = Math.min(
            currentDelay * config.backoffFactor,
            config.maxDelay
          );
        }
      }
    }

    throw lastError!;
  }

  /**
   * Wraps an async operation with retry logic
   */
  static withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    return this.retry(operation, options);
  }
}
