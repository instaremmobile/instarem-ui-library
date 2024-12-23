interface CacheItem<T> {
  data: T;
  timeStamp: number;
  expiresAt: number;
}

export class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private readonly defaultTTL: number;

  constructor(defaultTTL = 1000 * 60 * 5) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const timeStamp = Date.now();
    this.cache.set(key, { data, timeStamp, expiresAt: ttl + timeStamp });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}
