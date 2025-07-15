interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

export class CacheManager {
  private static caches: Map<string, Map<string, CacheEntry<unknown>>> = new Map();

  /**
   * Get or create a cache instance for a specific namespace
   */
  static getCache(namespace: string): Map<string, CacheEntry<unknown>> {
    let cache = this.caches.get(namespace);
    if (!cache) {
      cache = new Map();
      this.caches.set(namespace, cache);
    }
    return cache;
  }

  /**
   * Get a value from cache
   */
  static get<T>(namespace: string, key: string, options: CacheOptions = {}): T | undefined {
    const cache = this.getCache(namespace);
    const entry = cache.get(key);
    
    if (!entry) return undefined;

    const ttl = options.ttl ?? DEFAULT_TTL;
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache
   */
  static set<T>(namespace: string, key: string, value: T): void {
    const cache = this.getCache(namespace);
    cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  /**
   * Clear a specific key from a namespace
   */
  static clear(namespace: string, key?: string): void {
    if (key) {
      const cache = this.getCache(namespace);
      cache.delete(key);
    } else {
      this.caches.delete(namespace);
    }
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    this.caches.clear();
  }
}
