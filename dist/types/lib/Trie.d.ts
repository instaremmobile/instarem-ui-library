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
    matchType?: "exact" | "partial";
}
declare class Trie {
    private root;
    private cache;
    private static readonly CACHE_SIZE;
    private static readonly MIN_WORD_LENGTH;
    private wordCount;
    constructor();
    private getCommonPrefix;
    private createNewNode;
    private splitNode;
    insert(word: string, frequency?: number): void;
    private getLevenshtienDistance;
    private getPartialDistance;
    private calculateScore;
    search(query: string, options?: SearchOptions): string[];
    clearCache(): void;
}
export { Trie };
