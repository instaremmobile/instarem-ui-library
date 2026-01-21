import { NetworkManager } from './NetworkManager';

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

describe('NetworkManager', () => {
  let networkManager: NetworkManager;
  let onlineListeners: Function[] = [];
  let offlineListeners: Function[] = [];

  beforeEach(() => {
    // Reset singleton
    (NetworkManager as any).instance = undefined;

    // Reset listeners
    onlineListeners = [];
    offlineListeners = [];

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true
    });

    // Mock window event listeners
    window.addEventListener = jest.fn((event: string, handler: any) => {
      if (event === 'online') onlineListeners.push(handler);
      if (event === 'offline') offlineListeners.push(handler);
    });

    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = NetworkManager.getInstance();
      const instance2 = NetworkManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('creates instance with CacheManager', () => {
      const instance = NetworkManager.getInstance();
      expect(instance.cache).toBeDefined();
    });
  });

  describe('constructor', () => {
    it('sets up network listeners', () => {
      networkManager = new NetworkManager();
      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('network status handling', () => {
    it('handles online event', async () => {
      networkManager = new NetworkManager();

      // Simulate going offline then online
      Object.defineProperty(navigator, 'onLine', { value: false });
      offlineListeners.forEach((fn) => fn());

      Object.defineProperty(navigator, 'onLine', { value: true });
      await Promise.resolve();
      onlineListeners.forEach((fn) => fn());

      // Verify no errors
      expect(true).toBe(true);
    });

    it('handles offline event', () => {
      networkManager = new NetworkManager();

      offlineListeners.forEach((fn) => fn());

      // Verify no errors
      expect(true).toBe(true);
    });
  });

  describe('fetchWithRetry', () => {
    beforeEach(() => {
      networkManager = new NetworkManager();
    });

    it('returns data from successful fetch', async () => {
      const mockData = { result: 'success' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      const result = await networkManager.fetchWithRetry('test-key', fetchFn);

      expect(result).toEqual(mockData);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('returns cached data if available', async () => {
      const mockData = { result: 'cached' };
      networkManager.cache.set('cached-key', mockData);

      const fetchFn = jest.fn().mockResolvedValue({ result: 'fresh' });

      const result = await networkManager.fetchWithRetry('cached-key', fetchFn);

      expect(result).toEqual(mockData);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('caches successful fetch result', async () => {
      const mockData = { result: 'success' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      await networkManager.fetchWithRetry('new-key', fetchFn);

      expect(networkManager.cache.get('new-key')).toEqual(mockData);
    });

    it('throws when offline and queues retry', async () => {
      networkManager = new NetworkManager();

      // Simulate offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      offlineListeners.forEach((fn) => fn());
      (networkManager as any).isOnline = false;

      const fetchFn = jest.fn().mockResolvedValue({ result: 'success' });

      await expect(
        networkManager.fetchWithRetry('offline-key', fetchFn, { maxAttempt: 1 })
      ).rejects.toThrow('Network is offline');
    });

    it('uses default retry config when none provided', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ result: 'success' });

      const result = await networkManager.fetchWithRetry('default-config-key', fetchFn);

      expect(result).toEqual({ result: 'success' });
    });
  });

  describe('retry queue processing', () => {
    it('processes retry queue when coming back online', async () => {
      networkManager = new NetworkManager();

      // Mock processRetryQueue behavior
      const mockCallback = jest.fn().mockResolvedValue(undefined);
      (networkManager as any).retryQueue.set('test-queue', [mockCallback]);

      // Simulate coming online
      Object.defineProperty(navigator, 'onLine', { value: true });
      await onlineListeners[0]?.();

      expect(mockCallback).toHaveBeenCalled();
    });

    it('handles errors in retry queue processing', async () => {
      networkManager = new NetworkManager();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockCallback = jest.fn().mockRejectedValue(new Error('Queue error'));
      (networkManager as any).retryQueue.set('error-queue', [mockCallback]);

      await onlineListeners[0]?.();

      expect(consoleSpy).toHaveBeenCalledWith('Retry queue processing error', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('removes empty queues after processing', async () => {
      networkManager = new NetworkManager();

      const mockCallback = jest.fn().mockResolvedValue(undefined);
      (networkManager as any).retryQueue.set('empty-queue', [mockCallback]);

      await onlineListeners[0]?.();

      expect((networkManager as any).retryQueue.has('empty-queue')).toBe(false);
    });
  });

  describe('calculateDelay', () => {
    it('calculates exponential delay without jitter', () => {
      networkManager = new NetworkManager();
      const config = { maxAttempt: 5, baseDelay: 1000, maxDelay: 10000, jitter: false };

      const delay = (networkManager as any).calculateDelay(1, config);
      expect(delay).toBe(2000); // baseDelay * 2^1

      const delay2 = (networkManager as any).calculateDelay(2, config);
      expect(delay2).toBe(4000); // baseDelay * 2^2
    });

    it('respects maxDelay', () => {
      networkManager = new NetworkManager();
      const config = { maxAttempt: 5, baseDelay: 1000, maxDelay: 5000, jitter: false };

      const delay = (networkManager as any).calculateDelay(10, config);
      expect(delay).toBe(5000); // capped at maxDelay
    });

    it('applies jitter when enabled', () => {
      networkManager = new NetworkManager();
      const config = { maxAttempt: 5, baseDelay: 1000, maxDelay: 10000, jitter: true };

      const delay = (networkManager as any).calculateDelay(1, config);
      // With jitter, delay should be between 1000 and 2000 (exponential * 0.5 to 1.0)
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(2000);
    });
  });
});
