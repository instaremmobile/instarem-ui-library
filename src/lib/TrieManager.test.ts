import { TrieManager } from './TrieManager';

describe('TrieManager', () => {
  afterEach(() => {
    // Clean up all instances after each test
    TrieManager.clearAll();
  });

  describe('Instance management', () => {
    it('should create a new Trie instance for a namespace', () => {
      const trie = TrieManager.getOrCreate('test-namespace');
      expect(trie).toBeDefined();
    });

    it('should return the same instance for the same namespace', () => {
      const trie1 = TrieManager.getOrCreate('test-namespace');
      const trie2 = TrieManager.getOrCreate('test-namespace');
      expect(trie1).toBe(trie2);
    });

    it('should create different instances for different namespaces', () => {
      const trie1 = TrieManager.getOrCreate('namespace-1');
      const trie2 = TrieManager.getOrCreate('namespace-2');
      expect(trie1).not.toBe(trie2);
    });

    it('should track the number of active instances', () => {
      expect(TrieManager.getInstanceCount()).toBe(0);

      TrieManager.getOrCreate('test-1');
      expect(TrieManager.getInstanceCount()).toBe(1);

      TrieManager.getOrCreate('test-2');
      expect(TrieManager.getInstanceCount()).toBe(2);

      // Getting the same namespace should not increase count
      TrieManager.getOrCreate('test-1');
      expect(TrieManager.getInstanceCount()).toBe(2);
    });
  });

  describe('Instance cleanup', () => {
    it('should clear a specific namespace', () => {
      TrieManager.getOrCreate('test-1');
      TrieManager.getOrCreate('test-2');
      expect(TrieManager.getInstanceCount()).toBe(2);

      TrieManager.clear('test-1');
      expect(TrieManager.getInstanceCount()).toBe(1);
    });

    it('should clear all instances', () => {
      TrieManager.getOrCreate('test-1');
      TrieManager.getOrCreate('test-2');
      TrieManager.getOrCreate('test-3');
      expect(TrieManager.getInstanceCount()).toBe(3);

      TrieManager.clearAll();
      expect(TrieManager.getInstanceCount()).toBe(0);
    });

    it('should handle clearing non-existent namespace gracefully', () => {
      expect(TrieManager.getInstanceCount()).toBe(0);
      TrieManager.clear('non-existent');
      expect(TrieManager.getInstanceCount()).toBe(0);
    });

    it('should clear the Trie cache when clearing namespace', () => {
      const trie = TrieManager.getOrCreate('test-namespace');
      trie.insert('test');
      trie.search('test', { maxDistance: 0 }); // This caches the result

      TrieManager.clear('test-namespace');

      // After clearing, getting the same namespace should create a new instance
      const newTrie = TrieManager.getOrCreate('test-namespace');
      expect(newTrie).not.toBe(trie);
    });
  });

  describe('Data isolation', () => {
    it('should isolate data between different namespaces', () => {
      const trie1 = TrieManager.getOrCreate('namespace-1');
      const trie2 = TrieManager.getOrCreate('namespace-2');

      trie1.insert('apple');
      trie2.insert('banana');

      const results1 = trie1.search('apple', { maxDistance: 0 });
      const results2 = trie2.search('apple', { maxDistance: 0 });

      expect(results1).toContain('apple');
      expect(results2).not.toContain('apple');
    });

    it('should maintain separate caches for different namespaces', () => {
      const trie1 = TrieManager.getOrCreate('namespace-1');
      const trie2 = TrieManager.getOrCreate('namespace-2');

      trie1.insert('test');
      trie2.insert('test');

      // Both should cache independently
      const results1 = trie1.search('test', { maxDistance: 0 });
      const results2 = trie2.search('test', { maxDistance: 0 });

      expect(results1).toEqual(results2);
      expect(results1).toContain('test');
    });
  });

  describe('Memory management', () => {
    it('should prevent memory leaks by cleaning up instances', () => {
      // Create multiple instances
      for (let i = 0; i < 10; i++) {
        const trie = TrieManager.getOrCreate(`namespace-${i}`);
        trie.insert(`word-${i}`);
      }

      expect(TrieManager.getInstanceCount()).toBe(10);

      // Clear all
      TrieManager.clearAll();
      expect(TrieManager.getInstanceCount()).toBe(0);
    });

    it('should allow recreation of cleared namespaces', () => {
      const trie1 = TrieManager.getOrCreate('test-namespace');
      trie1.insert('first');

      TrieManager.clear('test-namespace');

      const trie2 = TrieManager.getOrCreate('test-namespace');
      trie2.insert('second');

      const results = trie2.search('first', { maxDistance: 0 });
      expect(results).not.toContain('first'); // Old data should be gone
      expect(trie2.search('second', { maxDistance: 0 })).toContain('second');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty namespace string', () => {
      const trie1 = TrieManager.getOrCreate('');
      const trie2 = TrieManager.getOrCreate('');
      expect(trie1).toBe(trie2);
    });

    it('should handle special characters in namespace', () => {
      const namespace = 'test-namespace-@#$%';
      const trie = TrieManager.getOrCreate(namespace);
      expect(trie).toBeDefined();

      trie.insert('test');
      expect(trie.search('test', { maxDistance: 0 })).toContain('test');
    });

    it('should handle numeric namespace', () => {
      const trie = TrieManager.getOrCreate('12345');
      expect(trie).toBeDefined();
    });
  });
});
