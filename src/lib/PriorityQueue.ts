/*
 * Implements a very basic Max PriorityQueue
 *
 * */

import { SearchResult } from "./Trie";

export class PriorityQueue {
  private items: SearchResult[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  push(item: SearchResult): void {
    this.items.push(item);

    this.items.sort((a, b) => b.score - a.score);
    if (this.maxSize < this.items.length) {
      this.items.pop();
    }
  }

  get(): SearchResult[] {
    return this.items;
  }
}
