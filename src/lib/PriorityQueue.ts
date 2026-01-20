/*
 * Implements a Min-Heap based Priority Queue for efficient top-K retrieval
 *
 * Uses a min-heap to maintain the top K highest-scoring items.
 * - push(): O(log k) time complexity
 * - get(): O(k log k) time complexity for final sorting
 *
 * This is more efficient than sorting on every insertion (O(n log n) per push)
 */

import { SearchResult } from './Trie';

export class PriorityQueue {
  private heap: SearchResult[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  /**
   * Push an item to the priority queue
   * Maintains a min-heap of the top maxSize items by score
   * Time complexity: O(log k) where k is maxSize
   */
  push(item: SearchResult): void {
    if (this.heap.length < this.maxSize) {
      // Heap not full, add item and heapify up
      this.heap.push(item);
      this.heapifyUp(this.heap.length - 1);
    } else if (item.score > this.heap[0].score) {
      // Item score is higher than minimum, replace minimum and heapify down
      this.heap[0] = item;
      this.heapifyDown(0);
    }
    // If item score is lower than minimum and heap is full, discard item
  }

  /**
   * Get all items sorted by score (highest first)
   * Time complexity: O(k log k) where k is the number of items
   */
  get(): SearchResult[] {
    // Return a sorted copy (descending by score)
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  /**
   * Restore min-heap property by moving an item up
   * Time complexity: O(log k)
   */
  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      // Min-heap: parent should be smaller than child
      if (this.heap[index].score >= this.heap[parentIndex].score) {
        break;
      }

      // Swap with parent
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  /**
   * Restore min-heap property by moving an item down
   * Time complexity: O(log k)
   */
  private heapifyDown(index: number): void {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      // Find smallest among node and its children
      if (leftChild < this.heap.length && this.heap[leftChild].score < this.heap[smallest].score) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].score < this.heap[smallest].score
      ) {
        smallest = rightChild;
      }

      // If node is already smallest, heap property is satisfied
      if (smallest === index) {
        break;
      }

      // Swap with smallest child
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
