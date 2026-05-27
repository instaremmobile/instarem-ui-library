import { Trie } from './Trie';

/**
 * TrieManager provides namespaced Trie instances to prevent memory leaks
 * and namespace collisions when multiple components use Trie for search.
 *
 * Each namespace gets its own Trie instance, and instances can be cleaned up
 * when components unmount.
 */
export class TrieManager {
  private static instances = new Map<string, Trie>();

  /**
   * Get or create a Trie instance for the given namespace
   * @param namespace - Unique identifier for the Trie instance
   * @returns Trie instance associated with the namespace
   */
  static getOrCreate(namespace: string): Trie {
    if (!this.instances.has(namespace)) {
      this.instances.set(namespace, new Trie());
    }
    return this.instances.get(namespace)!;
  }

  /**
   * Clear a specific Trie instance by namespace
   * @param namespace - Namespace to clear
   */
  static clear(namespace: string): void {
    const trie = this.instances.get(namespace);
    if (trie) {
      trie.clearCache();
      this.instances.delete(namespace);
    }
  }

  /**
   * Clear all Trie instances (useful for testing)
   */
  static clearAll(): void {
    this.instances.forEach((trie) => trie.clearCache());
    this.instances.clear();
  }

  /**
   * Get the number of active Trie instances
   */
  static getInstanceCount(): number {
    return this.instances.size;
  }
}
