/**
 * Timeout utilities for async operations
 */

/**
 * Execute a promise with a timeout
 * @param promise - The promise to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Error message if timeout occurs
 * @returns The promise result or throws timeout error
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out"
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );

  return Promise.race([promise, timeout]);
}

/**
 * Execute a function with automatic timeout and retry logic
 */
export async function withTimeoutAndRetry<T>(
  fn: () => Promise<T>,
  options: {
    timeoutMs: number;
    retries?: number;
    retryDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  const { timeoutMs, retries = 0, retryDelayMs = 1000, onRetry } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(
        fn(),
        timeoutMs,
        `Operation timed out after ${timeoutMs}ms`
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw lastError;
}
