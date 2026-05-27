import { PriorityQueue } from './PriorityQueue';
import { SearchResult } from './Trie';

describe('PriorityQueue', () => {
  describe('Basic operations', () => {
    it('should create an empty priority queue', () => {
      const pq = new PriorityQueue(10);
      expect(pq.get()).toEqual([]);
    });

    it('should push items to the queue', () => {
      const pq = new PriorityQueue(10);
      const item: SearchResult = {
        item: 'test',
        distance: 0,
        score: 1.0,
        frequency: 1
      };

      pq.push(item);
      expect(pq.get()).toHaveLength(1);
      expect(pq.get()[0]).toEqual(item);
    });

    it('should maintain maxSize limit', () => {
      const pq = new PriorityQueue(3);

      pq.push({ item: 'a', distance: 0, score: 1.0, frequency: 1 });
      pq.push({ item: 'b', distance: 0, score: 2.0, frequency: 1 });
      pq.push({ item: 'c', distance: 0, score: 3.0, frequency: 1 });
      pq.push({ item: 'd', distance: 0, score: 4.0, frequency: 1 });

      expect(pq.get()).toHaveLength(3);
    });

    it('should keep highest score items when at capacity', () => {
      const pq = new PriorityQueue(3);

      pq.push({ item: 'low', distance: 0, score: 1.0, frequency: 1 });
      pq.push({ item: 'high', distance: 0, score: 5.0, frequency: 1 });
      pq.push({ item: 'medium', distance: 0, score: 3.0, frequency: 1 });
      pq.push({ item: 'higher', distance: 0, score: 4.0, frequency: 1 });

      const results = pq.get();
      const items = results.map((r) => r.item);

      expect(items).toContain('high');
      expect(items).toContain('higher');
      expect(items).toContain('medium');
      expect(items).not.toContain('low');
    });
  });

  describe('Sorting behavior', () => {
    it('should return items sorted by score descending', () => {
      const pq = new PriorityQueue(10);

      pq.push({ item: 'a', distance: 0, score: 3.0, frequency: 1 });
      pq.push({ item: 'b', distance: 0, score: 1.0, frequency: 1 });
      pq.push({ item: 'c', distance: 0, score: 5.0, frequency: 1 });
      pq.push({ item: 'd', distance: 0, score: 2.0, frequency: 1 });

      const results = pq.get();

      expect(results[0].score).toBe(5.0);
      expect(results[1].score).toBe(3.0);
      expect(results[2].score).toBe(2.0);
      expect(results[3].score).toBe(1.0);
    });

    it('should handle items with equal scores', () => {
      const pq = new PriorityQueue(10);

      pq.push({ item: 'a', distance: 0, score: 3.0, frequency: 1 });
      pq.push({ item: 'b', distance: 0, score: 3.0, frequency: 1 });
      pq.push({ item: 'c', distance: 0, score: 3.0, frequency: 1 });

      const results = pq.get();
      expect(results).toHaveLength(3);
      results.forEach((r) => expect(r.score).toBe(3.0));
    });
  });

  describe('Edge cases', () => {
    it('should handle maxSize of 1', () => {
      const pq = new PriorityQueue(1);

      pq.push({ item: 'a', distance: 0, score: 1.0, frequency: 1 });
      pq.push({ item: 'b', distance: 0, score: 2.0, frequency: 1 });

      const results = pq.get();
      expect(results).toHaveLength(1);
      expect(results[0].item).toBe('b');
    });

    it('should handle many items', () => {
      const pq = new PriorityQueue(100);

      for (let i = 0; i < 1000; i++) {
        pq.push({
          item: `item${i}`,
          distance: i,
          score: Math.random() * 10,
          frequency: 1
        });
      }

      const results = pq.get();
      expect(results).toHaveLength(100);

      // Verify sorted
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should handle negative scores', () => {
      const pq = new PriorityQueue(5);

      pq.push({ item: 'a', distance: 0, score: -1.0, frequency: 1 });
      pq.push({ item: 'b', distance: 0, score: 0.0, frequency: 1 });
      pq.push({ item: 'c', distance: 0, score: 1.0, frequency: 1 });

      const results = pq.get();
      expect(results[0].score).toBe(1.0);
      expect(results[1].score).toBe(0.0);
      expect(results[2].score).toBe(-1.0);
    });

    it('should handle zero scores', () => {
      const pq = new PriorityQueue(5);

      pq.push({ item: 'a', distance: 0, score: 0.0, frequency: 1 });
      pq.push({ item: 'b', distance: 0, score: 0.0, frequency: 1 });

      const results = pq.get();
      expect(results).toHaveLength(2);
    });
  });

  describe('SearchResult properties', () => {
    it('should preserve all SearchResult properties', () => {
      const pq = new PriorityQueue(5);

      const result: SearchResult = {
        item: 'test',
        distance: 2,
        score: 0.85,
        frequency: 10,
        prefixMatch: true
      };

      pq.push(result);
      const retrieved = pq.get()[0];

      expect(retrieved.item).toBe(result.item);
      expect(retrieved.distance).toBe(result.distance);
      expect(retrieved.score).toBe(result.score);
      expect(retrieved.frequency).toBe(result.frequency);
      expect(retrieved.prefixMatch).toBe(result.prefixMatch);
    });

    it('should handle optional prefixMatch property', () => {
      const pq = new PriorityQueue(5);

      const withPrefix: SearchResult = {
        item: 'a',
        distance: 0,
        score: 1.0,
        frequency: 1,
        prefixMatch: true
      };

      const withoutPrefix: SearchResult = {
        item: 'b',
        distance: 0,
        score: 1.0,
        frequency: 1
      };

      pq.push(withPrefix);
      pq.push(withoutPrefix);

      const results = pq.get();
      expect(results[0].prefixMatch).toBe(true);
      expect(results[1].prefixMatch).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should handle rapid insertions efficiently', () => {
      const pq = new PriorityQueue(100);
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        pq.push({
          item: `item${i}`,
          distance: i % 10,
          score: Math.random() * 100,
          frequency: 1
        });
      }

      const duration = Date.now() - startTime;

      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds for 10k operations

      const results = pq.get();
      expect(results).toHaveLength(100);
    });

    it('should maintain sorted order under stress', () => {
      const pq = new PriorityQueue(50);

      // Insert in random order
      for (let i = 0; i < 1000; i++) {
        pq.push({
          item: `item${i}`,
          distance: 0,
          score: Math.random() * 1000,
          frequency: 1
        });
      }

      const results = pq.get();

      // Verify sorted
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });
  });
});
