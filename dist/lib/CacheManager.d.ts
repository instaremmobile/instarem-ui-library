export declare class CacheManager {
  private cache;
  private readonly defaultTTL;
  constructor(defaultTTL?: number);
  set<T>(key: string, data: T, ttl?: number): void;
  get<T>(key: string): T | null;
  clear(): void;
}
