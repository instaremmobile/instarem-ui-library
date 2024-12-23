import { CacheManager } from "./CacheManager";

export interface RetryConfig {
  maxAttempt: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

export class NetworkManager {
  private static instance: NetworkManager;
  private isOnline: boolean = navigator.onLine;
  private retryQueue: Map<string, (() => Promise<any>)[]> = new Map();
  cache: CacheManager;

  private defaultRetryConfig: RetryConfig = {
    maxAttempt: 5,
    baseDelay: 1000,
    maxDelay: 10000,
    jitter: true,
  };

  constructor() {
    this.cache = new CacheManager();
    this.setupNetworkListners();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private setupNetworkListners(): void {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    this.isOnline = true;
    await this.processRetryQueue();
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  private async processRetryQueue(): Promise<void> {
    for (const [key, callbacks] of this.retryQueue.entries()) {
      const callback = callbacks.shift();
      if (callback) {
        try {
          await callback();
        } catch (error) {
          console.error("Retry queue processing error", error);
        }
      }
      if (callbacks.length === 0) {
        this.retryQueue.delete(key);
      }
    }
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = Math.min(
      config.maxDelay,
      config.baseDelay * Math.pow(2, attempt),
    );
    if (!config.jitter) return exponentialDelay;
    return exponentialDelay * (0.5 + Math.random() * 0.5);
  }

  async fetchWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let attempt = 0;
    const cachedData = this.cache.get<T>(key);
    if (cachedData) return cachedData;

    while (attempt < retryConfig.maxAttempt) {
      try {
        if (!this.isOnline) {
          const queuedKey = `${key}-${Date.now()}`;
          const queuedCallbacks = this.retryQueue.get(queuedKey) || [];
          queuedCallbacks?.push(async () =>
            this.fetchWithRetry(key, fetchFn, config),
          );
          this.retryQueue.set(queuedKey, queuedCallbacks);
          throw new Error("Netowrk is offline");
        }
        const data = await fetchFn();
        this.cache.set(key, data);
        return data;
      } catch (error) {
        attempt++;
        if (attempt === retryConfig.maxAttempt) {
          throw error;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, this.calculateDelay(attempt, retryConfig)),
        );
      }
    }
    throw new Error("Max retry attemps reached");
  }
}
