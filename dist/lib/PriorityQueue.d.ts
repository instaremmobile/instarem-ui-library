import { SearchResult } from './Trie';
export declare class PriorityQueue {
  private items;
  private maxSize;
  constructor(maxSize: number);
  push(item: SearchResult): void;
  get(): SearchResult[];
}
