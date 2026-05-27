import { CacheManager } from './CacheManager';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('creates cache manager with default TTL', () => {
      const cache = new CacheManager();
      expect(cache).toBeInstanceOf(CacheManager);
    });

    it('creates cache manager with custom TTL', () => {
      const cache = new CacheManager(1000);
      expect(cache).toBeInstanceOf(CacheManager);
    });
  });

  describe('set', () => {
    it('stores data in cache', () => {
      cacheManager.set('key1', 'value1');
      expect(cacheManager.get('key1')).toBe('value1');
    });

    it('stores different data types', () => {
      cacheManager.set('string', 'test');
      cacheManager.set('number', 42);
      cacheManager.set('object', { a: 1, b: 2 });
      cacheManager.set('array', [1, 2, 3]);

      expect(cacheManager.get('string')).toBe('test');
      expect(cacheManager.get('number')).toBe(42);
      expect(cacheManager.get('object')).toEqual({ a: 1, b: 2 });
      expect(cacheManager.get('array')).toEqual([1, 2, 3]);
    });

    it('overwrites existing key', () => {
      cacheManager.set('key', 'value1');
      cacheManager.set('key', 'value2');
      expect(cacheManager.get('key')).toBe('value2');
    });

    it('uses custom TTL when provided', () => {
      cacheManager.set('key', 'value', 500);

      expect(cacheManager.get('key')).toBe('value');

      jest.advanceTimersByTime(600);

      expect(cacheManager.get('key')).toBeNull();
    });
  });

  describe('get', () => {
    it('returns null for non-existent key', () => {
      expect(cacheManager.get('nonexistent')).toBeNull();
    });

    it('returns cached value for valid key', () => {
      cacheManager.set('key', 'value');
      expect(cacheManager.get('key')).toBe('value');
    });

    it('returns null and deletes key when expired', () => {
      cacheManager.set('key', 'value', 1000);

      expect(cacheManager.get('key')).toBe('value');

      jest.advanceTimersByTime(1100);

      expect(cacheManager.get('key')).toBeNull();
    });

    it('returns value with correct type', () => {
      interface TestData {
        name: string;
        age: number;
      }

      const testData: TestData = { name: 'John', age: 30 };
      cacheManager.set('user', testData);

      const result = cacheManager.get<TestData>('user');
      expect(result).toEqual(testData);
      expect(result?.name).toBe('John');
    });
  });

  describe('clear', () => {
    it('clears all cached items', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');

      cacheManager.clear();

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
      expect(cacheManager.get('key3')).toBeNull();
    });

    it('works on empty cache', () => {
      expect(() => cacheManager.clear()).not.toThrow();
    });
  });

  describe('expiration behavior', () => {
    it('uses default TTL of 5 minutes', () => {
      cacheManager.set('key', 'value');

      // Advance to just before expiration (5 min - 1 sec)
      jest.advanceTimersByTime(1000 * 60 * 5 - 1000);
      expect(cacheManager.get('key')).toBe('value');

      // Advance past expiration
      jest.advanceTimersByTime(2000);
      expect(cacheManager.get('key')).toBeNull();
    });

    it('each key has independent expiration', () => {
      cacheManager.set('key1', 'value1', 1000);
      cacheManager.set('key2', 'value2', 2000);

      jest.advanceTimersByTime(1100);

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBe('value2');

      jest.advanceTimersByTime(1000);

      expect(cacheManager.get('key2')).toBeNull();
    });
  });
});
