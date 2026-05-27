import { PriorityQueue } from './PriorityQueue';

class TrieNode {
  _children: Map<string, TrieNode>;
  _isEndOfTheWord: boolean;
  _value: string | undefined;
  _frequency: number | undefined; // will be used for result sorting
  _prefixCount: number;
  _isWordBoundary: boolean;

  constructor() {
    this._children = new Map<string, TrieNode>();
    this._isEndOfTheWord = false;
    this._value = undefined;
    this._frequency = 1;
    this._isWordBoundary = false;
    this._prefixCount = 0;
  }

  get children() {
    return this._children;
  }
  set children(newValue: Map<string, TrieNode>) {
    this._children = newValue;
  }

  get isEndOfTheWord() {
    return this._isEndOfTheWord;
  }
  set isEndOfTheWord(newValue: boolean) {
    this._isEndOfTheWord = newValue;
  }

  get value() {
    return this._value;
  }
  set value(newValue: string | undefined) {
    this._value = newValue;
  }

  get frequency() {
    return this._frequency;
  }
  set frequency(newValue: number | undefined) {
    this._frequency = newValue;
  }

  set isWordBoundary(newValue: boolean) {
    this._isWordBoundary = newValue;
  }
  get isWordBoundary() {
    return this._isWordBoundary;
  }

  set prefixCount(newValue: number) {
    this._prefixCount = newValue;
  }
  get prefixCount() {
    return this._prefixCount;
  }

  incrementPrefix(): void {
    this._prefixCount++;
  }
  decrementPrefix(): void {
    this._prefixCount--;
  }
}

export interface SearchResult {
  item: string;
  distance: number;
  score: number;
  frequency: number;
  prefixMatch?: boolean;
}

interface SearchOptions {
  maxDistance: number;
  prefixOnly?: boolean;
  caseSensitive?: boolean;
  maxResults?: number;
  matchType?: 'exact' | 'partial';
}

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
  accessCount: number;
}

class Trie {
  private root: TrieNode;
  private cache: Map<string, CacheEntry>;
  private static readonly CACHE_SIZE = 1000;
  private static readonly MIN_WORD_LENGTH = 2;
  private wordCount: number = 0; // Track total unique words inserted
  private uniqueWords: Set<string> = new Set(); // Track unique words for accurate counting

  constructor() {
    this.root = new TrieNode();
    this.cache = new Map<string, CacheEntry>();
  }

  private getCommonPrefix(edge: string, prefix: string): string {
    let index = 0;
    const minLength = Math.min(edge.length, prefix.length);
    while (index < minLength && edge[index] === prefix[index]) index++;
    return edge.slice(0, index);
  }

  private createNewNode(
    currentNode: TrieNode,
    prefix: string,
    isEndOfTheWord: boolean,
    word: string | undefined,
    frequency: number
  ): TrieNode {
    const newNode = new TrieNode();
    newNode.isEndOfTheWord = isEndOfTheWord;
    newNode.value = word;
    newNode.frequency = frequency;
    newNode.incrementPrefix();
    currentNode.children.set(prefix, newNode);
    return newNode;
  }
  // great article - https://medium.com/basecs/compressing-radix-trees-without-too-many-tears-a2e658adb9a0
  private splitNode(
    currentNode: TrieNode,
    edge: string,
    node: TrieNode,
    commonPrefix: string,
    prefix: string,
    word: string,
    frequency: number
  ) {
    const newNode = new TrieNode();
    const remainingOld = edge.slice(commonPrefix.length);
    const remainingNew = prefix.slice(commonPrefix.length);
    newNode.children.set(remainingOld, node);
    currentNode.children.delete(edge);
    currentNode.children.set(commonPrefix, newNode);

    if (remainingNew.length > 0) {
      const newLeaf = this.createNewNode(newNode, remainingNew, true, word, frequency);
      newLeaf.isEndOfTheWord = true;
      newLeaf.value = word;
    } else {
      newNode.isEndOfTheWord = true;
      newNode.value = word;
      newNode.frequency = frequency;
      newNode.isWordBoundary = true;
    }
  }

  insert(word: string, frequency = 1) {
    if (!word) return;
    const processedWord = word.normalize('NFD'); // unicode normalization
    // Preserve spaces for multi-word phrases, only remove non-alphanumeric except spaces
    const trimmedWord = processedWord
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();

    // Track unique words for accurate word count
    const isNewWord = !this.uniqueWords.has(processedWord);
    if (isNewWord) {
      this.uniqueWords.add(processedWord);
      this.wordCount++;
    }

    let currentNode = this.root;
    let prefix = '';
    for (let i = 0; i < trimmedWord.length; i++) {
      const char = trimmedWord[i];
      prefix += char;

      if (char === ' ') currentNode.isWordBoundary = true;
      let found = false;

      for (const [edge, node] of currentNode.children.entries()) {
        const commonPrefix = this.getCommonPrefix(edge, prefix);
        if (commonPrefix.length > 0) {
          if (edge === commonPrefix) {
            currentNode = node;
            currentNode.incrementPrefix();
            if (i === trimmedWord.length - 1) {
              currentNode.isEndOfTheWord = true;
              currentNode.value = processedWord;
              currentNode.frequency = (currentNode.frequency || 0) + frequency;
            }
            prefix = '';
            found = true;
            break;
          } else {
            this.splitNode(currentNode, edge, node, commonPrefix, prefix, processedWord, frequency);
            return;
          }
        }
      }
      if (!found) {
        currentNode = this.createNewNode(
          currentNode,
          prefix,
          i === trimmedWord.length - 1,
          processedWord,
          frequency
        );
        prefix = '';
      }
    }
    if (!currentNode.isEndOfTheWord) {
      currentNode.isEndOfTheWord = true;
      currentNode.value = processedWord;
      if (currentNode.frequency != undefined) {
        currentNode.frequency += frequency;
      } else {
        currentNode.frequency = frequency;
      }
    }
  }

  private getLevenshtienDistance(
    sourceString: string,
    targetString: string,
    maxDistance: number
  ): number {
    let sourceStringLength = sourceString.length;
    let targetStringLength = targetString.length;
    const difference = Math.abs(sourceStringLength - targetStringLength);
    if (difference > maxDistance * 1.4) return Infinity;

    if (sourceStringLength > targetStringLength) {
      const tempString = sourceString;
      sourceString = targetString;
      targetString = tempString;
      sourceStringLength = sourceString.length;
      targetStringLength = targetString.length;
    }

    let current = new Uint16Array(sourceStringLength + 1);
    let previous = new Uint16Array(sourceStringLength + 1);

    for (let i = 0; i <= sourceStringLength; i++) previous[i] = i;

    let minValue = previous[0];

    for (let i = 1; i <= targetStringLength; i++) {
      current[0] = i;
      minValue = current[0];
      for (let j = 1; j <= sourceStringLength; j++) {
        const substitutionCost = sourceString[j - 1] === targetString[i - 1] ? 0 : 1;
        current[j] = Math.min(
          Math.min(previous[j] + 1, current[j - 1] + 1),
          previous[j - 1] + substitutionCost
        );
        minValue = Math.min(minValue, current[j]);
      }
      if (minValue > maxDistance * 1.4) return Infinity;
      previous.set(current);
    }
    return previous[sourceStringLength];
  }

  private getPartialDistance = (source: string, target: string, maxDistance = 3) => {
    const sourceWords = source.toLowerCase().trim().split(/\s+/);
    const targetWords = target.toLowerCase().trim().split(/\s+/);

    if (sourceWords.length === 0 || targetWords.length === 0) return maxDistance + 1;

    if (source.toLowerCase() === target.toLowerCase()) return 0;
    if (
      source.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(source.toLowerCase())
    )
      return 0;

    let totalDistance = 0;
    let matchWords = 0;
    const usedTargetWords = new Set<number>();

    // Don't sort - maintain word order for better position-based matching
    for (let i = 0; i < sourceWords.length; i++) {
      const sourceWord = sourceWords[i];

      // Allow short words (like "of", "a", "the") but give them less weight
      const isShortWord = sourceWord.length < Trie.MIN_WORD_LENGTH;

      let minWordDistance = Infinity;
      let bestIdx = -1;

      // Try to match with target words, preferring same position
      for (let j = 0; j < targetWords.length; j++) {
        if (usedTargetWords.has(j)) continue;
        const targetWord = targetWords[j];

        // For short words, require exact match or very close
        if (isShortWord) {
          if (sourceWord === targetWord) {
            minWordDistance = 0;
            bestIdx = j;
            break;
          }
          continue; // Skip fuzzy matching for short words
        }

        // Skip if length difference is too large
        if (Math.abs(sourceWord.length - targetWord.length) > maxDistance) continue;

        const distance = this.getLevenshtienDistance(
          sourceWord.toLowerCase(),
          targetWord.toLowerCase(),
          maxDistance
        );

        // Prefer matches at same position
        const positionBonus = i === j ? 0 : 0.5;
        const adjustedDistance = distance + positionBonus;

        if (distance <= maxDistance && adjustedDistance < minWordDistance) {
          minWordDistance = distance;
          bestIdx = j;
        }
      }

      if (bestIdx !== -1) {
        usedTargetWords.add(bestIdx);
        totalDistance += minWordDistance;
        matchWords++;
      }
    }

    if (matchWords === 0) return Infinity;

    // Reduce penalty for unmatched short words
    const unmatchedWords = Math.abs(sourceWords.length - targetWords.length);
    const unmatchedPenalty = unmatchedWords * 1.0; // Reduced from 1.5

    return totalDistance + unmatchedPenalty;
  };

  private calculateScore(result: SearchResult, query: string): number {
    // Preserve spaces for word count calculation
    const queryWords = query
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '');
    const resultWords = result.item
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '');

    const distanceFactor = 1 / (result.distance + 1);
    const frequencyFactor = Math.log1p(result.frequency || 1) / Math.log1p(this.wordCount);
    const prefixMatchBonus = result.prefixMatch ? 2.5 : 1; // was 1.5
    const wordCountDiff = Math.abs(queryWords.length - resultWords.length);
    const wordCountPenalty = wordCountDiff === 0 ? 0 : wordCountDiff * 0.1;

    return distanceFactor * frequencyFactor * prefixMatchBonus * (1 - wordCountPenalty);
  }

  search(query: string, options: SearchOptions = { maxDistance: 3 }): string[] {
    const {
      maxDistance = 3,
      prefixOnly = false,
      caseSensitive = false,
      maxResults = 10,
      matchType = 'partial'
    } = options;
    if (!query.trim()) return [];

    // Preserve spaces for multi-word queries
    query = query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();
    const cacheKey = `${query}:${JSON.stringify(options)}`;

    // Check cache and update access time if found (LRU)
    if (this.cache.has(cacheKey)) {
      const cacheEntry = this.cache.get(cacheKey)!;
      cacheEntry.timestamp = Date.now();
      cacheEntry.accessCount++;
      this.cache.set(cacheKey, cacheEntry); // Update the entry
      return cacheEntry.results.map((res) => res.item);
    }
    const processedQuery = caseSensitive
      ? query.normalize('NFD')
      : query.toLowerCase().normalize('NFD');

    const seen = new Set<string>();
    const priorityQueue = new PriorityQueue(maxResults);

    const dfs = (
      node: TrieNode,
      prefix: string,
      depth: number = 0,
      prefixDistance: number = 0
    ): void => {
      // For partial matching with multi-word queries, be more lenient with early termination
      const maxDistanceThreshold = matchType === 'partial' ? maxDistance * 5 : maxDistance * 3;
      if (prefixDistance > maxDistanceThreshold) return;

      if (node.value && node.isEndOfTheWord) {
        const word = caseSensitive ? node.value : node.value.toLowerCase();
        if (!seen.has(word)) {
          let distance: number;
          let isPrefixMatch = false;

          if (matchType === 'partial') {
            const loweredWord = word.toLowerCase();
            if (loweredWord.startsWith(processedQuery)) {
              distance = 0;
              isPrefixMatch = true;
            } else {
              distance = this.getPartialDistance(processedQuery, loweredWord, maxDistance);
            }
          } else {
            distance = prefixOnly
              ? prefixDistance
              : this.getLevenshtienDistance(processedQuery, word, maxDistance);
            isPrefixMatch = prefixOnly && prefixDistance <= maxDistance;
          }

          const wordCount = node.value.trim().split(/\s+/).length;
          const adjustableDistance = maxDistance * (wordCount > 1 ? wordCount * 1.2 : 1);

          if (distance <= adjustableDistance) {
            const result: SearchResult = {
              item: node.value,
              distance,
              score: 0,
              frequency: node.frequency || 1,
              prefixMatch: isPrefixMatch
            };
            result.score = this.calculateScore(result, processedQuery);
            priorityQueue.push(result);
            seen.add(word);
          }
        }
      }

      for (const [edge, childNode] of node.children) {
        const edgeStr = caseSensitive ? edge : edge.toLowerCase();

        // For partial matching, explore all paths to find multi-word matches
        if (matchType === 'partial') {
          // Just explore everything - distance will be calculated at leaf nodes
          dfs(childNode, prefix + edge, depth + edge.length, 0);
        } else if (node.isWordBoundary && processedQuery.includes(' ')) {
          const queryWords = processedQuery.split(' ');
          const currentWord = queryWords[prefix.split(' ').length - 1] || '';
          if (this.getCommonPrefix(edgeStr, currentWord).length > 0 || currentWord.length === 0) {
            dfs(childNode, prefix + edge, depth + edge.length, prefixDistance);
          }
        } else {
          if (prefixOnly) {
            const commonPrefix = this.getCommonPrefix(processedQuery.slice(depth), edgeStr);
            if (commonPrefix.length > 0) {
              dfs(childNode, prefix + edge, depth + commonPrefix.length, prefixDistance);
            }
          } else {
            dfs(
              childNode,
              prefix + edge,
              depth + edge.length,
              this.getLevenshtienDistance(
                processedQuery.slice(0, depth + edge.length),
                prefix + edge,
                maxDistance
              )
            );
          }
        }
      }
    };

    dfs(this.root, '');

    const results = priorityQueue.get();

    results.sort(
      (a, b) =>
        b.score - a.score ||
        a.distance - b.distance ||
        (b.frequency ?? 0) - (a.frequency ?? 0) ||
        a.item.localeCompare(b.item)
    );

    // Implement LRU cache eviction strategy
    if (this.cache.size >= Trie.CACHE_SIZE) {
      // Convert cache to array and sort by timestamp (least recently used first)
      const entries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );

      // Remove oldest 20% of entries to avoid frequent evictions
      const entriesToRemove = Math.max(1, Math.floor(Trie.CACHE_SIZE * 0.2));
      for (let i = 0; i < entriesToRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    // Add new entry to cache with timestamp
    this.cache.set(cacheKey, {
      results,
      timestamp: Date.now(),
      accessCount: 1
    });

    return results.map((r) => r.item);
  }

  clearCache() {
    this.cache.clear();
  }
}

export { Trie };
