import { CacheManager } from './CacheManager';
export interface RetryConfig {
  maxAttempt: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}
export declare class NetworkManager {
  private static instance;
  private isOnline;
  private retryQueue;
  cache: CacheManager;
  private defaultRetryConfig;
  constructor();
  static getInstance(): NetworkManager;
  private setupNetworkListeners;
  private handleOnline;
  private handleOffline;
  private processRetryQueue;
  private calculateDelay;
  fetchWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T>;
}
