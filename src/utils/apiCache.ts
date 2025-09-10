/**
 * API Response Caching Utilities
 * Implements in-memory and localStorage caching for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_MEMORY_ITEMS = 100;

  /**
   * Generates a cache key from URL and parameters
   */
  private generateKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `api_cache_${btoa(endpoint + paramString).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Checks if a cache entry is still valid
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Stores data in memory cache
   */
  set<T>(endpoint: string, data: T, params?: Record<string, unknown>, ttl: number = this.DEFAULT_TTL): void {
    const key = this.generateKey(endpoint, params);
    
    // Remove oldest entries if cache is full
    if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Also store in localStorage for persistence (for smaller data)
    try {
      if (JSON.stringify(data).length < 100000) { // < 100KB
        localStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl
        }));
      }
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  /**
   * Retrieves data from cache
   */
  get<T>(endpoint: string, params?: Record<string, unknown>): T | null {
    const key = this.generateKey(endpoint, params);

    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Try localStorage cache
    try {
      const localEntry = localStorage.getItem(key);
      if (localEntry) {
        const parsed: CacheEntry<T> = JSON.parse(localEntry);
        if (this.isValidEntry(parsed)) {
          // Move back to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          // Expired, remove from localStorage
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }

    return null;
  }

  /**
   * Invalidates cache for a specific endpoint
   */
  invalidate(endpoint: string, params?: Record<string, unknown>): void {
    const key = this.generateKey(endpoint, params);
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Invalidates all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api_cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Gets cache statistics
   */
  getStats(): { memorySize: number; localStorageSize: number } {
    let localStorageSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api_cache_')) {
          localStorageSize++;
        }
      }
    } catch (error) {
      console.warn('Failed to get localStorage stats:', error);
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize
    };
  }
}

// Export singleton instance
export const apiCache = new APICache();

/**
 * Higher-order function to add caching to API calls
 */
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  endpoint: string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const params = args.length > 0 ? { args } : undefined;
    
    // Try to get from cache first
    const cached = apiCache.get(endpoint, params);
    if (cached) {
      return cached;
    }

    // Call the original function
    const result = await fn(...args);
    
    // Cache the result if successful
    if (result && typeof result === 'object' && 'success' in result && result.success) {
      apiCache.set(endpoint, result, params, ttl);
    }

    return result;
  }) as T;
}
