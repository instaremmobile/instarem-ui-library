import { SearchResult } from './Trie';
export declare class PriorityQueue {
  private heap;
  private maxSize;
  constructor(maxSize: number);
  /**
   * Push an item to the priority queue
   * Maintains a min-heap of the top maxSize items by score
   * Time complexity: O(log k) where k is maxSize
   */
  push(item: SearchResult): void;
  /**
   * Get all items sorted by score (highest first)
   * Time complexity: O(k log k) where k is the number of items
   */
  get(): SearchResult[];
  /**
   * Restore min-heap property by moving an item up
   * Time complexity: O(log k)
   */
  private heapifyUp;
  /**
   * Restore min-heap property by moving an item down
   * Time complexity: O(log k)
   */
  private heapifyDown;
}
