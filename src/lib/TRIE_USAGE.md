# Trie Usage Guide

## Typo Tolerance

The Trie implementation includes built-in fuzzy search using Levenshtein distance to handle typos.

### Basic Usage

```typescript
import { Trie } from '@lib';

const trie = new Trie();

// Insert words
trie.insert('god');
trie.insert('good');
trie.insert('gold');
trie.insert('golf');

// Search with typo tolerance
// "gof" will find "god" (1 character substitution)
const results = trie.search('gof', {
  maxDistance: 2, // Allow up to 2 character differences
  matchType: 'partial' // Use partial matching for better results
});

console.log(results); // ['god', 'golf', ...] - sorted by relevance
```

### maxDistance Guidelines

- **maxDistance: 1** - Very strict, only single-character typos (insert, delete, substitute)
  - "gof" → "god" ✓
  - "godd" → "good" ✗ (too different)

- **maxDistance: 2** - Moderate tolerance (recommended for most use cases)
  - "gof" → "god" ✓
  - "godd" → "good" ✓
  - "glod" → "gold" ✓

- **maxDistance: 3-4** - Lenient tolerance (good for longer words)
  - "aplication" → "application" ✓
  - "recieve" → "receive" ✓

### Match Types

#### 1. Partial Match (Recommended for autocomplete)

```typescript
const results = trie.search('uni', {
  maxDistance: 2,
  matchType: 'partial' // Finds "united", "union", "university"
});
```

#### 2. Exact Match (Strict)

```typescript
const results = trie.search('god', {
  maxDistance: 0,
  matchType: 'exact' // Only finds exact match "god"
});
```

### Common Typo Types Handled

1. **Substitution**: "gof" → "god" (f→d)
2. **Insertion**: "godd" → "god" (extra d)
3. **Deletion**: "gd" → "god" (missing o)
4. **Transposition**: "sotp" → "stop" (tp→pt)

### Example: Autocomplete with Typo Tolerance

```typescript
import { TrieManager } from '@lib';

// Create namespaced instance
const trie = TrieManager.getOrCreate('countries');

// Insert data
const countries = ['United States', 'United Kingdom', 'Germany', 'France'];
countries.forEach((country) => trie.insert(country));

// Search with typos
const results1 = trie.search('Untied States', {
  // typo: "Untied" instead of "United"
  maxDistance: 2,
  matchType: 'partial',
  maxResults: 5
});
// Returns: ['United States', 'United Kingdom']

const results2 = trie.search('Germny', {
  // typo: missing 'a'
  maxDistance: 2,
  matchType: 'partial'
});
// Returns: ['Germany']
```

### Performance Tips

1. **Use appropriate maxDistance**: Higher values are slower
   - Short words (< 5 chars): maxDistance = 1-2
   - Medium words (5-10 chars): maxDistance = 2-3
   - Long words (> 10 chars): maxDistance = 3-4

2. **Limit results**: Use `maxResults` to improve performance

   ```typescript
   trie.search('query', { maxDistance: 2, maxResults: 10 });
   ```

3. **Use TrieManager**: Prevents memory leaks in React components
   ```typescript
   const trie = TrieManager.getOrCreate('my-namespace');
   // ... use trie
   TrieManager.clear('my-namespace'); // Clean up when done
   ```

### Frequency-Based Ranking

Words inserted with higher frequency will rank higher in results:

```typescript
trie.insert('god', 100); // Common word
trie.insert('goad', 10); // Less common

const results = trie.search('gof', { maxDistance: 2 });
// 'god' ranks higher due to frequency
```

### Case Sensitivity

```typescript
// Case-insensitive (default)
trie.search('GOD', { maxDistance: 1, caseSensitive: false });
// Returns: ['god', ...]

// Case-sensitive
trie.search('GOD', { maxDistance: 1, caseSensitive: true });
// Returns: [] (no match unless 'GOD' was inserted)
```

### Integration with Input Component

The Input component automatically uses typo-tolerant search when `isSearchable=true`:

```tsx
<Input
  isSearchable
  suggestions={['god', 'good', 'golf', 'gold']}
  // Internally uses: trie.search(query, { maxDistance: 4, matchType: 'partial' })
/>
```

### Troubleshooting

**Problem**: "gof" doesn't find "god"

**Solutions**:

1. Ensure "god" is inserted: `trie.insert('god')`
2. Check maxDistance: Should be >= 1
3. Verify matchType: Use 'partial' for better results
4. Check normalization: Special characters are removed

**Problem**: Too many irrelevant results

**Solutions**:

1. Decrease maxDistance
2. Use maxResults to limit output
3. Consider using exact match for short queries
