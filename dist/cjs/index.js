'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');

/*
 * Implements a very basic Max PriorityQueue
 *
 * */
class PriorityQueue {
    constructor(maxSize) {
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxSize = maxSize;
    }
    push(item) {
        this.items.push(item);
        this.items.sort((a, b) => b.score - a.score);
        if (this.maxSize < this.items.length) {
            this.items.pop();
        }
    }
    get() {
        return this.items;
    }
}

class TrieNode {
    constructor() {
        Object.defineProperty(this, "_children", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isEndOfTheWord", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_frequency", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // will be used for result sorting
        Object.defineProperty(this, "_prefixCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isWordBoundary", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._children = new Map();
        this._isEndOfTheWord = false;
        this._value = undefined;
        this._frequency = 1;
        this._isWordBoundary = false;
        this._prefixCount = 0;
    }
    get children() {
        return this._children;
    }
    set children(newValue) {
        this._children = newValue;
    }
    get isEndOfTheWord() {
        return this._isEndOfTheWord;
    }
    set isEndOfTheWord(newValue) {
        this._isEndOfTheWord = newValue;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        this._value = newValue;
    }
    get frequency() {
        return this._frequency;
    }
    set frequency(newValue) {
        this._frequency = newValue;
    }
    set isWordBoundary(newValue) {
        this._isWordBoundary = newValue;
    }
    get isWordBoundary() {
        return this._isWordBoundary;
    }
    set prefixCount(newValue) {
        this._prefixCount = newValue;
    }
    get prefixCount() {
        return this._prefixCount;
    }
    incrementPrefix() {
        this._prefixCount++;
    }
    decrementPrefix() {
        this._prefixCount--;
    }
}
class Trie {
    constructor() {
        Object.defineProperty(this, "root", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "wordCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2
        });
        Object.defineProperty(this, "getPartialDistance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (source, target, maxDistance = 3) => {
                const sourceWords = source.toLowerCase().trim().split(/\s+/);
                const targetWords = target.toLowerCase().trim().split(/\s+/);
                if (sourceWords.length === 0 || targetWords.length === 0)
                    return maxDistance + 1;
                if (source.toLowerCase() === target.toLowerCase())
                    return 0;
                if (source.toLowerCase().includes(target.toLowerCase()) ||
                    target.toLowerCase().includes(source.toLowerCase()))
                    return 0;
                let totalDistance = 0;
                let matchWords = 0;
                const usedTargetWords = new Set();
                sourceWords.sort((a, b) => b.length - a.length);
                for (const sourceWord of sourceWords) {
                    if (sourceWord.length < Trie.MIN_WORD_LENGTH)
                        continue;
                    let minWordDistance = Infinity;
                    let bestIdx = -1;
                    for (let i = 0; i < targetWords.length; i++) {
                        if (usedTargetWords.has(i))
                            continue;
                        const targetWord = targetWords[i];
                        if (Math.abs(sourceWord.length - targetWord.length) > maxDistance)
                            continue;
                        const distance = this.getLevenshtienDistance(sourceWord.toLowerCase(), targetWord.toLowerCase(), maxDistance);
                        if (distance <= maxDistance && distance < minWordDistance) {
                            minWordDistance = distance;
                            bestIdx = i;
                        }
                    }
                    if (bestIdx !== -1) {
                        usedTargetWords.add(bestIdx);
                        totalDistance += minWordDistance;
                        matchWords++;
                    }
                }
                if (matchWords === 0)
                    return Infinity;
                const unmatchedPenalty = Math.abs(sourceWords.length - targetWords.length) * 1.5;
                return totalDistance + unmatchedPenalty;
            }
        });
        this.root = new TrieNode();
        this.cache = new Map();
    }
    getCommonPrefix(edge, prefix) {
        let index = 0;
        const minLength = Math.min(edge.length, prefix.length);
        while (index < minLength && edge[index] === prefix[index])
            index++;
        return edge.slice(0, index);
    }
    createNewNode(currentNode, prefix, isEndOfTheWord, word, frequency) {
        const newNode = new TrieNode();
        newNode.isEndOfTheWord = isEndOfTheWord;
        newNode.value = word;
        newNode.frequency = frequency;
        newNode.incrementPrefix();
        currentNode.children.set(prefix, newNode);
        return newNode;
    }
    // great article - https://medium.com/basecs/compressing-radix-trees-without-too-many-tears-a2e658adb9a0
    splitNode(currentNode, edge, node, commonPrefix, prefix, word, frequency) {
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
        }
        else {
            newNode.isEndOfTheWord = true;
            newNode.value = word;
            newNode.frequency = frequency;
            newNode.isWordBoundary = true;
        }
    }
    insert(word, frequency = 1) {
        if (!word)
            return;
        const processedWord = word.normalize("NFD"); // unicode normalization
        const trimmedWord = processedWord
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "");
        let currentNode = this.root;
        let prefix = "";
        for (let i = 0; i < trimmedWord.length; i++) {
            const char = trimmedWord[i];
            prefix += char;
            if (char === " ")
                currentNode.isWordBoundary = true;
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
                        prefix = "";
                        found = true;
                        break;
                    }
                    else {
                        this.splitNode(currentNode, edge, node, commonPrefix, prefix, processedWord, frequency);
                        return;
                    }
                }
            }
            if (!found) {
                currentNode = this.createNewNode(currentNode, prefix, i === trimmedWord.length - 1, processedWord, frequency);
                prefix = "";
            }
        }
        if (!currentNode.isEndOfTheWord) {
            currentNode.isEndOfTheWord = true;
            currentNode.value = processedWord;
            if (currentNode.frequency != undefined) {
                currentNode.frequency += frequency;
            }
            else {
                currentNode.frequency = frequency;
            }
        }
    }
    getLevenshtienDistance(sourceString, targetString, maxDistance) {
        let sourceStringLength = sourceString.length;
        let targetStringLength = targetString.length;
        const difference = Math.abs(sourceStringLength - targetStringLength);
        if (difference > maxDistance * 1.4)
            return Infinity;
        if (sourceStringLength > targetStringLength) {
            const tempString = sourceString;
            sourceString = targetString;
            targetString = tempString;
            sourceStringLength = sourceString.length;
            targetStringLength = targetString.length;
        }
        let current = new Uint16Array(sourceStringLength + 1);
        let previous = new Uint16Array(sourceStringLength + 1);
        for (let i = 0; i <= sourceStringLength; i++)
            previous[i] = i;
        let minValue = previous[0];
        for (let i = 1; i <= targetStringLength; i++) {
            current[0] = i;
            minValue = current[0];
            for (let j = 1; j <= sourceStringLength; j++) {
                const substitutionCost = sourceString[j - 1] === targetString[i - 1] ? 0 : 1;
                current[j] = Math.min(Math.min(previous[j] + 1, current[j - 1] + 1), previous[j - 1] + substitutionCost);
                minValue = Math.min(minValue, current[j]);
            }
            if (minValue > maxDistance * 1.4)
                return Infinity;
            previous.set(current);
        }
        return previous[sourceStringLength];
    }
    calculateScore(result, query) {
        const queryWords = query
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "");
        const resultWords = result.item
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "");
        const distanceFactor = 1 / (result.distance + 1);
        const frequencyFactor = Math.log1p(result.frequency || 1) / Math.log1p(this.wordCount);
        const prefixMatchBonus = result.prefixMatch ? 2.5 : 1; // was 1.5
        const wordCountDiff = Math.abs(queryWords.length - resultWords.length);
        const wordCountPenalty = wordCountDiff === 0 ? 0 : wordCountDiff * 0.1;
        return (distanceFactor *
            frequencyFactor *
            prefixMatchBonus *
            (1 - wordCountPenalty));
    }
    search(query, options = { maxDistance: 3 }) {
        const { maxDistance = 3, prefixOnly = false, caseSensitive = false, maxResults = 10, matchType = "partial", } = options;
        if (!query.trim())
            return [];
        query = query.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
        const cacheKey = `${query}:${JSON.stringify(options)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey).map((res) => res.item);
        }
        const processedQuery = caseSensitive
            ? query.normalize("NFD")
            : query.toLowerCase().normalize("NFD");
        const seen = new Set();
        const priorityQueue = new PriorityQueue(maxResults);
        const dfs = (node, prefix, depth = 0, prefixDistance = 0) => {
            if (prefixDistance > maxDistance * 3)
                return;
            if (node.value && node.isEndOfTheWord) {
                const word = caseSensitive ? node.value : node.value.toLowerCase();
                if (!seen.has(word)) {
                    let distance;
                    let isPrefixMatch = false;
                    if (matchType === "partial") {
                        const loweredWord = word.toLowerCase();
                        if (loweredWord.startsWith(processedQuery)) {
                            distance = 0;
                            isPrefixMatch = true;
                        }
                        else {
                            distance = this.getPartialDistance(processedQuery, loweredWord, maxDistance);
                        }
                    }
                    else {
                        distance = prefixOnly
                            ? prefixDistance
                            : this.getLevenshtienDistance(processedQuery, word, maxDistance);
                        isPrefixMatch = prefixOnly && prefixDistance <= maxDistance;
                    }
                    const wordCount = node.value.trim().split(/\s+/).length;
                    const adjustableDistance = maxDistance * (wordCount > 1 ? wordCount * 1.2 : 1);
                    if (distance <= adjustableDistance) {
                        const result = {
                            item: node.value,
                            distance,
                            score: 0,
                            frequency: node.frequency || 1,
                            prefixMatch: isPrefixMatch,
                        };
                        result.score = this.calculateScore(result, processedQuery);
                        priorityQueue.push(result);
                        seen.add(word);
                    }
                }
            }
            for (const [edge, childNode] of node.children) {
                const edgeStr = caseSensitive ? edge : edge.toLowerCase();
                if (node.isWordBoundary && processedQuery.includes(" ")) {
                    const queryWords = processedQuery.split(" ");
                    const currentWord = queryWords[prefix.split(" ").length - 1] || "";
                    if (this.getCommonPrefix(edgeStr, currentWord).length > 0 ||
                        currentWord.length === 0) {
                        dfs(childNode, prefix + edge, depth + edge.length, prefixDistance);
                    }
                }
                else {
                    if (prefixOnly) {
                        const commonPrefix = this.getCommonPrefix(processedQuery.slice(depth), edgeStr);
                        if (commonPrefix.length > 0) {
                            dfs(childNode, prefix + edge, depth + commonPrefix.length, prefixDistance);
                        }
                    }
                    else {
                        dfs(childNode, prefix + edge, depth + edge.length, this.getLevenshtienDistance(processedQuery.slice(0, depth + edge.length), prefix + edge, maxDistance));
                    }
                }
            }
        };
        dfs(this.root, "");
        const results = priorityQueue.get();
        results.sort((a, b) => b.score - a.score ||
            a.distance - b.distance ||
            (b.frequency ?? 0) - (a.frequency ?? 0) ||
            a.item.localeCompare(b.item));
        if (this.cache.size >= Trie.CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, results);
        return results.map((r) => r.item);
    }
    clearCache() {
        this.cache.clear();
    }
}
Object.defineProperty(Trie, "CACHE_SIZE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1000
});
Object.defineProperty(Trie, "MIN_WORD_LENGTH", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2
});

function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

// Reference - https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/lib/utils.ts
const cn = (...inputClasses) => {
    return clsx(inputClasses);
};

class CacheManager {
    constructor(defaultTTL = 1000 * 60 * 5) {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultTTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }
    set(key, data, ttl = this.defaultTTL) {
        const timeStamp = Date.now();
        this.cache.set(key, { data, timeStamp, expiresAt: ttl + timeStamp });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    clear() {
        this.cache.clear();
    }
}

class NetworkManager {
    constructor() {
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        Object.defineProperty(this, "retryQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultRetryConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                maxAttempt: 5,
                baseDelay: 1000,
                maxDelay: 10000,
                jitter: true,
            }
        });
        this.cache = new CacheManager();
        this.setupNetworkListeners();
    }
    static getInstance() {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }
    setupNetworkListeners() {
        window.addEventListener("online", this.handleOnline.bind(this));
        window.addEventListener("offline", this.handleOffline.bind(this));
    }
    async handleOnline() {
        this.isOnline = true;
        await this.processRetryQueue();
    }
    handleOffline() {
        this.isOnline = false;
    }
    async processRetryQueue() {
        for (const [key, callbacks] of this.retryQueue.entries()) {
            const callback = callbacks.shift();
            if (callback) {
                try {
                    await callback();
                }
                catch (error) {
                    console.error("Retry queue processing error", error);
                }
            }
            if (callbacks.length === 0) {
                this.retryQueue.delete(key);
            }
        }
    }
    calculateDelay(attempt, config) {
        const exponentialDelay = Math.min(config.maxDelay, config.baseDelay * Math.pow(2, attempt));
        if (!config.jitter)
            return exponentialDelay;
        return exponentialDelay * (0.5 + Math.random() * 0.5);
    }
    async fetchWithRetry(key, fetchFn, config = {}) {
        const retryConfig = { ...this.defaultRetryConfig, ...config };
        let attempt = 0;
        const cachedData = this.cache.get(key);
        if (cachedData)
            return cachedData;
        while (attempt < retryConfig.maxAttempt) {
            try {
                if (!this.isOnline) {
                    const queuedKey = `${key}-${Date.now()}`;
                    const queuedCallbacks = this.retryQueue.get(queuedKey) || [];
                    queuedCallbacks?.push(async () => this.fetchWithRetry(key, fetchFn, config));
                    this.retryQueue.set(queuedKey, queuedCallbacks);
                    throw new Error("Network is offline");
                }
                const data = await fetchFn();
                this.cache.set(key, data);
                return data;
            }
            catch (error) {
                attempt++;
                if (attempt === retryConfig.maxAttempt) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, this.calculateDelay(attempt, retryConfig)));
            }
        }
        throw new Error("Max retry attempts reached");
    }
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$4 = ".btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  border-radius: 4px;\n  font-family: \"hellix-bold\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n  text-decoration: none;\n  cursor: pointer;\n  transition: all 0.2s ease-in-out;\n  position: relative;\n  overflow: hidden;\n  white-space: nowrap;\n  user-select: none;\n  outline: none;\n  max-width: 450px;\n  width: 100%;\n  height: 50px;\n  font-weight: 700;\n}\n.btn:focus-visible {\n  outline: 2px solid currentColor;\n  outline-offset: 2px;\n}\n.btn::before {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(255, 255, 255, 0.1);\n  transform: translateX(-100%);\n  transition: transform 0.2s ease-in-out;\n}\n.btn__text {\n  position: relative;\n  z-index: 1;\n  transition: opacity 0.2s ease-in-out;\n}\n.btn__text--loading {\n  opacity: 0;\n}\n.btn__icon {\n  display: inline-flex;\n  align-items: center;\n  position: relative;\n  z-index: 1;\n}\n.btn__icon--start {\n  margin-right: 4px;\n}\n.btn__icon--end {\n  margin-left: 4px;\n}\n.btn__icon svg {\n  width: 1em;\n  height: 1em;\n}\n.btn__spinner {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 2;\n}\n.btn__spinner-icon {\n  width: 1.2em;\n  height: 1.2em;\n  animation: spin 1s linear infinite;\n}\n.btn__spinner-icon circle {\n  animation: dash 1.5s ease-in-out infinite;\n}\n.btn--primary {\n  background-color: #fe0095;\n  color: #ffffff;\n}\n.btn--primary:hover:not(:disabled) {\n  background-color: rgb(203, 0, 119.0826771654);\n}\n.btn--primary:active:not(:disabled) {\n  background-color: rgb(177.5, 0, 104.124015748);\n  transform: translateY(0);\n  box-shadow: 0 2px 6px rgba(254, 0, 149, 0.2);\n}\n.btn--primary:focus-visible {\n  outline-color: #fe0095;\n}\n.btn--secondary {\n  border: 2px solid #fe0095;\n  background-color: #ffffff;\n  color: #fe0095;\n}\n.btn--secondary:hover:not(:disabled) {\n  background-color: #e5e7eb;\n}\n.btn--secondary:disabled {\n  background-color: transparent !important;\n  cursor: not-allowed;\n  pointer-events: none;\n  color: #a9a9a9;\n  border: 2px solid #a9a9a9;\n}\n.btn--secondary:active:not(:disabled) {\n  background-color: #d1d5db;\n  transform: translateY(0);\n  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.1);\n}\n.btn--secondary:focus-visible {\n  outline-color: #6b7280;\n}\n.btn--text {\n  background-color: transparent;\n  color: #007aff;\n}\n.btn--text:disabled {\n  color: #a9a9a9;\n  cursor: not-allowed;\n  pointer-events: none;\n  background-color: transparent !important;\n}\n.btn--text:focus-visible {\n  outline-color: #fe0095;\n}\n.btn--small {\n  padding: 8px 16px;\n  font-size: 14px;\n  min-height: 36px;\n  gap: 6px;\n}\n.btn--medium {\n  padding: 12px 24px;\n  font-size: 16px;\n  min-height: 44px;\n  gap: 8px;\n}\n.btn--large {\n  padding: 16px 32px;\n  font-size: 18px;\n  min-height: 52px;\n  gap: 10px;\n}\n.btn--loading {\n  pointer-events: none;\n}\n.btn--full-width {\n  width: 100%;\n}\n.btn:disabled {\n  cursor: not-allowed;\n  pointer-events: none;\n  background-color: #a9a9a9;\n}\n.btn:disabled::before {\n  display: none;\n}\n\n@keyframes spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes dash {\n  0% {\n    stroke-dasharray: 1, 150;\n    stroke-dashoffset: 0;\n  }\n  50% {\n    stroke-dasharray: 90, 150;\n    stroke-dashoffset: -35;\n  }\n  100% {\n    stroke-dasharray: 90, 150;\n    stroke-dashoffset: -124;\n  }\n}\n@media (max-width: 768px) {\n  .btn--small {\n    padding: 10px 16px;\n    min-height: 40px;\n  }\n  .btn--medium {\n    padding: 14px 24px;\n    min-height: 48px;\n  }\n  .btn--large {\n    padding: 18px 32px;\n    min-height: 56px;\n  }\n}\n@media (max-width: 480px) {\n  .btn {\n    max-width: 100%;\n  }\n  .btn--small {\n    font-size: 14px;\n  }\n  .btn--medium {\n    font-size: 16px;\n  }\n  .btn--large {\n    font-size: 17px;\n  }\n}\n@media (prefers-contrast: high) {\n  .btn--primary {\n    border: 2px solid transparent;\n  }\n  .btn--primary:focus-visible {\n    outline-width: 3px;\n  }\n  .btn--secondary {\n    border: 2px solid #4b5563;\n  }\n  .btn--secondary:focus-visible {\n    outline-width: 3px;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .btn {\n    transition: none;\n  }\n  .btn::before {\n    display: none;\n  }\n  .btn:hover:not(:disabled) {\n    transform: none;\n  }\n  .btn:active:not(:disabled) {\n    transform: none;\n  }\n  .btn__spinner-icon {\n    animation: none;\n  }\n  .btn__spinner-icon circle {\n    animation: none;\n    stroke-dasharray: none;\n    stroke-dashoffset: 0;\n  }\n}";
styleInject(css_248z$4);

const Button = React.forwardRef(({ children, variant = "primary", size = "medium", isLoading = false, disabled = false, fullWidth = false, className = "", startIcon, endIcon, type = "button", ...rest }, ref) => {
    const baseClass = "btn";
    const variantClass = `${baseClass}--${variant}`;
    const sizeClass = `${baseClass}--${size}`;
    const loadingClass = isLoading ? `${baseClass}--loading` : "";
    const fullWidthClass = fullWidth ? `${baseClass}--full-width` : "";
    const combinedClassName = cn(baseClass, variantClass, sizeClass, loadingClass, fullWidthClass, className);
    return (jsxRuntime.jsxs("button", { ref: ref, type: type, className: combinedClassName, disabled: disabled || isLoading, "aria-disabled": disabled || isLoading, ...rest, children: [isLoading && (jsxRuntime.jsx("span", { className: "btn__spinner", "aria-hidden": "true", children: jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", className: "btn__spinner-icon", children: jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round", strokeDasharray: "31.416", strokeDashoffset: "31.416" }) }) })), startIcon && !isLoading && (jsxRuntime.jsx("span", { className: "btn__icon btn__icon--start", "aria-hidden": "true", children: startIcon })), jsxRuntime.jsx("span", { className: `btn__text ${isLoading ? "btn__text--loading" : ""}`, children: children }), endIcon && !isLoading && (jsxRuntime.jsx("span", { className: "btn__icon btn__icon--end", "aria-hidden": "true", children: endIcon }))] }));
});
Button.displayName = "Button";

var css_248z$3 = ".toggle-switch {\n  display: inline-flex;\n  align-items: center;\n  cursor: pointer;\n}\n.toggle-switch.disabled {\n  cursor: not-allowed;\n  opacity: 0.5;\n}\n.toggle-switch__container {\n  position: relative;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n}\n.toggle-switch__input {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n  z-index: 99;\n}\n.toggle-switch__track {\n  width: 2.5rem;\n  height: 1.5rem;\n  background-color: #e5e7eb;\n  border-radius: 1.5rem;\n  transition: background-color 200ms ease-in-out;\n  border: 1px solid #f0f0f0;\n}\n.toggle-switch__input:checked + .toggle-switch__track {\n  background-color: #fe0095;\n  border-color: #fe0095;\n}\n.toggle-switch__input:focus + .toggle-switch__track {\n  box-shadow: 0 0 0 2px rgba(254, 0, 149, 0.25);\n}\n.toggle-switch__thumb {\n  position: absolute;\n  top: 0.3rem;\n  left: 0.3rem;\n  width: 1rem;\n  height: 1rem;\n  background-color: #fe0095;\n  border-radius: 50%;\n  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);\n  will-change: transform;\n}\n.toggle-switch__input:active + .toggle-switch__track .toggle-switch__thumb {\n  transform: scale(0.9);\n}\n.toggle-switch__input:checked + .toggle-switch__track .toggle-switch__thumb {\n  transform: translateX(1.005rem);\n  background-color: white;\n}\n.toggle-switch__input:active:checked + .toggle-switch__track .toggle-switch__thumb {\n  transform: translateX(1.005rem) scale(0.9);\n}\n.toggle-switch__label {\n  margin-left: 0.75rem;\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: #a9a9a9;\n}";
styleInject(css_248z$3);

const ToggleComponent = React.forwardRef(({ id, className, onChange, labelPosition = "right", checked, label, name, ...props }, ref) => {
    const toggleId = id || React.useId();
    return (jsxRuntime.jsxs("label", { htmlFor: toggleId, className: "toggle-switch__container", children: [label && labelPosition === "left" ? (jsxRuntime.jsx("span", { className: "toggle-switch__label", children: label })) : null, jsxRuntime.jsxs("div", { className: "toggle-switch__container", children: [jsxRuntime.jsx("input", { ...props, id: toggleId, ref: ref, type: "checkbox", className: cn("toggle-switch__input", className), checked: checked, name: name, onChange: (event) => onChange?.(event.target.checked) }), jsxRuntime.jsx("div", { className: "toggle-switch__track", children: jsxRuntime.jsx("div", { className: "toggle-switch__thumb" }) })] }), label && labelPosition === "right" ? (jsxRuntime.jsx("span", { className: "toggle-switch__label", children: label })) : null] }));
});
ToggleComponent.displayName = "Toggle";
const Toggle = React.memo(ToggleComponent);

/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Icon = React.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return React.createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => React.createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const createLucideIcon = (iconName, iconNode) => {
  const Component = React.forwardRef(
    ({ className, ...props }, ref) => React.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
      ...props
    })
  );
  Component.displayName = `${iconName}`;
  return Component;
};

/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const LoaderCircle = createLucideIcon("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

/** Used for built-in method references. */

var objectProto$6 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype$2(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$6;

  return value === proto;
}

var _isPrototype = isPrototype$2;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */

function overArg$1(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg$1;

var overArg = _overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys$1 = overArg(Object.keys, Object);

var _nativeKeys = nativeKeys$1;

var isPrototype$1 = _isPrototype,
    nativeKeys = _nativeKeys;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys$1(object) {
  if (!isPrototype$1(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$4.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys$1;

/** Detect free variable `global` from Node.js. */

var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal$1;

var freeGlobal = _freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$8 = freeGlobal || freeSelf || Function('return this')();

var _root = root$8;

var root$7 = _root;

/** Built-in value references. */
var Symbol$2 = root$7.Symbol;

var _Symbol = Symbol$2;

var Symbol$1 = _Symbol;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$4.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$3.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag$1;

/** Used for built-in method references. */

var objectProto$3 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$3.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}

var _objectToString = objectToString$1;

var Symbol = _Symbol,
    getRawTag = _getRawTag,
    objectToString = _objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag$5(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

var _baseGetTag = baseGetTag$5;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */

function isObject$4(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$4;

var baseGetTag$4 = _baseGetTag,
    isObject$3 = isObject_1;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag$1 = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$2(value) {
  if (!isObject$3(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag$4(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction$2;

var root$6 = _root;

/** Used to detect overreaching core-js shims. */
var coreJsData$1 = root$6['__core-js_shared__'];

var _coreJsData = coreJsData$1;

var coreJsData = _coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$1(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked$1;

/** Used for built-in method references. */

var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource$2;

var isFunction$1 = isFunction_1,
    isMasked = _isMasked,
    isObject$2 = isObject_1,
    toSource$1 = _toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$1(value) {
  if (!isObject$2(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource$1(value));
}

var _baseIsNative = baseIsNative$1;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */

function getValue$1(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue$1;

var baseIsNative = _baseIsNative,
    getValue = _getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$5(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

var _getNative = getNative$5;

var getNative$4 = _getNative,
    root$5 = _root;

/* Built-in method references that are verified to be native. */
var DataView$1 = getNative$4(root$5, 'DataView');

var _DataView = DataView$1;

var getNative$3 = _getNative,
    root$4 = _root;

/* Built-in method references that are verified to be native. */
var Map$2 = getNative$3(root$4, 'Map');

var _Map = Map$2;

var getNative$2 = _getNative,
    root$3 = _root;

/* Built-in method references that are verified to be native. */
var Promise$2 = getNative$2(root$3, 'Promise');

var _Promise = Promise$2;

var getNative$1 = _getNative,
    root$2 = _root;

/* Built-in method references that are verified to be native. */
var Set$2 = getNative$1(root$2, 'Set');

var _Set = Set$2;

var getNative = _getNative,
    root$1 = _root;

/* Built-in method references that are verified to be native. */
var WeakMap$1 = getNative(root$1, 'WeakMap');

var _WeakMap = WeakMap$1;

var DataView = _DataView,
    Map$1 = _Map,
    Promise$1 = _Promise,
    Set$1 = _Set,
    WeakMap = _WeakMap,
    baseGetTag$3 = _baseGetTag,
    toSource = _toSource;

/** `Object#toString` result references. */
var mapTag$2 = '[object Map]',
    objectTag$1 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$2 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$1 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map$1),
    promiseCtorString = toSource(Promise$1),
    setCtorString = toSource(Set$1),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag$1 = baseGetTag$3;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag$1(new DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
    (Map$1 && getTag$1(new Map$1) != mapTag$2) ||
    (Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag) ||
    (Set$1 && getTag$1(new Set$1) != setTag$2) ||
    (WeakMap && getTag$1(new WeakMap) != weakMapTag$1)) {
  getTag$1 = function(value) {
    var result = baseGetTag$3(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$1;
        case mapCtorString: return mapTag$2;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$2;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag$1;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

function isObjectLike$4(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike$4;

var baseGetTag$2 = _baseGetTag,
    isObjectLike$3 = isObjectLike_1;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments$1(value) {
  return isObjectLike$3(value) && baseGetTag$2(value) == argsTag$1;
}

var _baseIsArguments = baseIsArguments$1;

var baseIsArguments = _baseIsArguments,
    isObjectLike$2 = isObjectLike_1;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$1.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments$1 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike$2(value) && hasOwnProperty$1.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

var isArguments_1 = isArguments$1;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */

var isArray$1 = Array.isArray;

var isArray_1 = isArray$1;

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength$2(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength$2;

var isFunction = isFunction_1,
    isLength$1 = isLength_1;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike$1(value) {
  return value != null && isLength$1(value.length) && !isFunction(value);
}

var isArrayLike_1 = isArrayLike$1;

var isBuffer$1 = {exports: {}};

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */

function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

isBuffer$1.exports;

(function (module, exports) {
	var root = _root,
	    stubFalse = stubFalse_1;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer; 
} (isBuffer$1, isBuffer$1.exports));

var isBufferExports = isBuffer$1.exports;

var baseGetTag$1 = _baseGetTag,
    isLength = isLength_1,
    isObjectLike$1 = isObjectLike_1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag$1 = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag$1] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag$1] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray$1(value) {
  return isObjectLike$1(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag$1(value)];
}

var _baseIsTypedArray = baseIsTypedArray$1;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */

function baseUnary$1(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary$1;

var _nodeUtil = {exports: {}};

_nodeUtil.exports;

(function (module, exports) {
	var freeGlobal = _freeGlobal;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil; 
} (_nodeUtil, _nodeUtil.exports));

var _nodeUtilExports = _nodeUtil.exports;

var baseIsTypedArray = _baseIsTypedArray,
    baseUnary = _baseUnary,
    nodeUtil = _nodeUtilExports;

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray$1 = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

var isTypedArray_1 = isTypedArray$1;

var baseKeys = _baseKeys,
    getTag = _getTag,
    isArguments = isArguments_1,
    isArray = isArray_1,
    isArrayLike = isArrayLike_1,
    isBuffer = isBufferExports,
    isPrototype = _isPrototype,
    isTypedArray = isTypedArray_1;

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) &&
      (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer(value) || isTypedArray(value) || isArguments(value))) {
    return !value.length;
  }
  var tag = getTag(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

var isEmpty_1 = isEmpty;

var isEmpty$1 = /*@__PURE__*/getDefaultExportFromCjs(isEmpty_1);

var root = _root;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now$1 = function() {
  return root.Date.now();
};

var now_1 = now$1;

/** Used to match a single whitespace character. */

var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex$1(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

var _trimmedEndIndex = trimmedEndIndex$1;

var trimmedEndIndex = _trimmedEndIndex;

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim$1(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

var _baseTrim = baseTrim$1;

var baseGetTag = _baseGetTag,
    isObjectLike = isObjectLike_1;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol$1;

var baseTrim = _baseTrim,
    isObject$1 = isObject_1,
    isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber$1;

var isObject = isObject_1,
    now = now_1,
    toNumber = toNumber_1;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var debounce_1 = debounce;

var debounce$1 = /*@__PURE__*/getDefaultExportFromCjs(debounce_1);

var css_248z$2 = ".text-field-container {\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  flex-direction: column;\n  width: 100%;\n  max-width: 450px;\n  position: relative;\n  font-family: \"hellix-regular\" !important;\n}\n.text-field-container.full-width {\n  width: 450px;\n}\n@media (max-width: 768px) {\n  .text-field-container {\n    max-width: 100%;\n  }\n  .text-field-container.full-width {\n    width: 100%;\n  }\n}\n@media (max-width: 480px) {\n  .text-field-container .text-field-label {\n    font-size: 14px;\n  }\n  .text-field-container .text-field-input {\n    font-size: 14px;\n  }\n}\n\n.input-field-wrapper {\n  position: relative;\n  display: flex;\n  align-items: center;\n  border-radius: 4px;\n  height: 50px;\n  width: 100%;\n  outline: none;\n  transition: padding 0.25s, border 0.25s ease;\n  border: 1px solid #a9a9a9;\n  color: #333333;\n  font-family: \"hellix-regular\";\n}\n.input-field-wrapper.has-left-icon .text-field-label {\n  left: 30px;\n}\n.input-field-wrapper.has-right-icon .text-field-input {\n  padding-right: 40px;\n}\n.input-field-wrapper.focused {\n  border-color: black;\n}\n.input-field-wrapper.focused .text-field-label {\n  color: black;\n  transform: translateY(-25px) scale(0.75);\n}\n.input-field-wrapper.shrink .text-field-label {\n  color: black;\n  transform: translateY(-25px) scale(0.75);\n}\n.input-field-wrapper.shrink .text-field-input::placeholder {\n  color: #a9a9a9;\n}\n.input-field-wrapper.has-value {\n  border-color: black;\n}\n.input-field-wrapper.has-value .text-field-label {\n  transform: translateY(-25px) scale(0.75);\n}\n.input-field-wrapper.error {\n  border-color: #f92929;\n}\n.input-field-wrapper.error .text-field-label {\n  color: #f92929;\n}\n.input-field-wrapper.disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n  pointer-events: none;\n}\n.input-field-wrapper.disabled .text-field-label,\n.input-field-wrapper.disabled .text-field-input {\n  cursor: not-allowed;\n}\n.input-field-wrapper.outlined {\n  border: none;\n  border-radius: 0;\n  border-bottom: 1px solid #a9a9a9;\n}\n.input-field-wrapper.outlined .text-field-label {\n  background-color: transparent;\n}\n.input-field-wrapper.outlined.error {\n  border-bottom: 1px solid #f92929;\n}\n.input-field-wrapper.outlined.focused {\n  border-bottom: 1px solid black;\n}\n.input-field-wrapper.outlined.has-value {\n  border-bottom: 1px solid black;\n}\n@media (max-width: 480px) {\n  .input-field-wrapper {\n    height: 45px;\n  }\n}\n\n.text-field-icon {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  color: #757575;\n  transition: color 0.2s ease, transform 0.2s ease;\n}\n.text-field-icon.left {\n  position: absolute;\n  left: 12px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.text-field-icon.right {\n  position: absolute;\n  right: 12px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.text-field-icon.clickable {\n  cursor: pointer;\n}\n.text-field-icon.disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.text-field-icon .icon {\n  transition: transform 0.2s ease;\n}\n.text-field-icon .icon.disabled {\n  opacity: 0.5;\n}\n@media (max-width: 480px) {\n  .text-field-icon {\n    width: 20px;\n    height: 20px;\n  }\n}\n\n.text-field-input {\n  height: 100%;\n  background: none;\n  padding: 8px 16px 6px;\n  border: none;\n  width: 100%;\n  caret-color: #fe0095;\n  outline: none;\n  font-size: 16px;\n  line-height: 1.5;\n  font-family: \"hellix-regular\";\n  color: #747474;\n}\n.text-field-input::placeholder {\n  color: transparent;\n}\n.text-field-input:focus::placeholder {\n  color: #9e9e9e;\n}\n@media (max-width: 480px) {\n  .text-field-input {\n    padding: 6px 12px 4px;\n    font-size: 14px;\n  }\n}\n\n.text-field-label {\n  position: absolute;\n  left: 8px;\n  top: 16px;\n  font-size: 16px;\n  color: #a9a9a9;\n  pointer-events: none;\n  transition: transform 0.2s ease, color 0.2s ease;\n  transform-origin: left top;\n  padding: 0 4px;\n  background-color: white;\n}\n@media (max-width: 480px) {\n  .text-field-label {\n    font-size: 14px;\n    top: 14px;\n  }\n}\n\n.error-message {\n  margin-top: 4px;\n  font-size: 16px;\n  color: #f92929;\n}\n@media (max-width: 480px) {\n  .error-message {\n    font-size: 12px;\n    margin-top: 2px;\n  }\n}\n\n.start-adornment {\n  font-size: 16px;\n  margin-right: 4px;\n}\n@media (max-width: 480px) {\n  .start-adornment {\n    font-size: 14px;\n  }\n}\n\n.end-adornment {\n  z-index: 1;\n  right: 12px;\n  font-size: 16px;\n}\n@media (max-width: 480px) {\n  .end-adornment {\n    font-size: 14px;\n  }\n}\n\n.helper-text {\n  color: #747474;\n  margin-top: 4px;\n  font-size: 14px;\n}\n@media (max-width: 480px) {\n  .helper-text {\n    font-size: 12px;\n    margin-top: 2px;\n  }\n}\n\n.suggestions-list {\n  max-width: 450px;\n  width: 100%;\n  text-align: left;\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  max-height: 200px;\n  margin: 8px 0 4px;\n  padding: 0;\n  list-style: none;\n  border-radius: 4px;\n  overflow-y: auto;\n  z-index: 1000;\n  background-color: #fff;\n  border: 1px solid #f0f0f0;\n}\n@media (max-width: 768px) {\n  .suggestions-list {\n    max-width: 100%;\n  }\n}\n@media (max-width: 480px) {\n  .suggestions-list {\n    max-height: 180px;\n    margin: 6px 0 2px;\n  }\n}\n\n.suggestion-item {\n  display: flex;\n  white-space: pre-wrap;\n  align-items: center;\n  height: 50px;\n  padding: 0 16px;\n  cursor: pointer;\n  transition: background-color 0.2s ease;\n  border-bottom: 1px solid #f9f9f9;\n}\n.suggestion-item:hover {\n  background-color: rgba(72, 249, 254, 0.4);\n}\n.suggestion-item.selected {\n  background-color: #f5f5f5;\n}\n.suggestion-item:last-child {\n  border-bottom: none;\n}\n@media (max-width: 480px) {\n  .suggestion-item {\n    height: 40px;\n    padding: 0 12px;\n    font-size: 14px;\n  }\n}\n\n.suggestion-item .highlight {\n  color: #fe0095;\n  font-weight: 700;\n  font-family: \"hellix-bold\";\n}\n\n@media (max-width: 360px) {\n  .text-field-container .text-field-label {\n    font-size: 12px;\n  }\n  .text-field-container .text-field-input {\n    font-size: 12px;\n    padding: 4px 10px 2px;\n  }\n  .text-field-container .input-field-wrapper {\n    height: 40px;\n  }\n  .text-field-container .error-message,\n  .text-field-container .helper-text {\n    font-size: 10px;\n  }\n  .text-field-container .text-field-icon {\n    width: 18px;\n    height: 18px;\n  }\n}\n@media (max-width: 768px) {\n  .text-field-icon.clickable {\n    min-width: 32px;\n    min-height: 32px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .suggestion-item {\n    min-height: 44px; /* Minimum recommended touch target size */\n  }\n}";
styleInject(css_248z$2);

const globalTrie = new Trie();
const InputField = React.forwardRef(({ className = "", helperText, type = "text", label, error, shrink, value: controlledValue, startAdornment, endAdornment, disabled, id, defaultValue = "", onIconClick, iconSize = 18, clearable, fullWidth = false, suggestions = [], isSearchable = false, onBlur, onFocus, fetchFunction, retryConfig = { maxAttempt: 5 }, handleChange, outlined = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);
    const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
    const [originalFetchedSuggestions, setOriginalFetchedSuggestions] = React.useState([]);
    const [suggestionsVisible, setSuggestionsVisible] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
    const [retryAttempt, setRetryAttempt] = React.useState(0);
    const [hasFetchedInitialData, setHasFetchedInitialData] = React.useState(false);
    const inputRef = React.useRef(null);
    const suggestionListRef = React.useRef(null);
    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = Boolean(currentValue);
    const isControlled = controlledValue !== undefined;
    const networkManager = React.useMemo(() => NetworkManager.getInstance(), []);
    const handleOnIconClick = React.useCallback((position, iconProps, event) => {
        if (iconProps?.disabled)
            return;
        iconProps?.onClick?.(event);
        onIconClick?.(position, event);
    }, [onIconClick]);
    const renderIcon = React.useCallback((iconProps, position) => {
        if (isEmpty$1(iconProps) || !iconProps)
            return null;
        const { icon, onClick, toolTip, disabled, className = "" } = iconProps;
        const handleKeyDown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOnIconClick(position, iconProps, e);
            }
        };
        return (jsxRuntime.jsx("div", { className: cn("text-field-icon", position, disabled ? "disabled" : "", className, onClick ? "clickable" : ""), onClick: (e) => handleOnIconClick(position, iconProps, e), onKeyDown: handleKeyDown, title: toolTip, role: onClick ? "button" : "presentation", tabIndex: onClick && !disabled ? 0 : -1, "aria-label": toolTip, children: React.cloneElement(icon, {
                size: iconSize,
                className: cn("icon", disabled ? "disabled" : ""),
            }) }));
    }, [handleOnIconClick, iconSize]);
    const inputStyles = React.useMemo(() => {
        const style = {};
        if (startAdornment) {
            style.paddingLeft = `${iconSize + 20}px`;
        }
        if (endAdornment || (clearable && currentValue)) {
            style.paddingRight = `${iconSize + 16}px`;
        }
        return style;
    }, [startAdornment, endAdornment, clearable, currentValue, iconSize]);
    const normalizeSuggestions = React.useCallback((suggestions) => {
        if (!suggestions || suggestions.length === 0) {
            return [];
        }
        return suggestions.map((item) => {
            if (typeof item === "string") {
                return { label: item, value: item };
            }
            else if (typeof item === "object" &&
                (item.label || item.text || item.name) &&
                (item.value || item.id || item.code)) {
                return {
                    label: item.label || item.text || item.name,
                    value: item.value || item.id || item.code,
                };
            }
            else {
                return { label: String(item), value: String(item) };
            }
        });
    }, []);
    const handleFilterSuggestions = React.useMemo(() => {
        return debounce$1((newValue) => {
            const allSuggestions = originalFetchedSuggestions.length > 0
                ? originalFetchedSuggestions
                : normalizeSuggestions(suggestions);
            if (newValue.trim()) {
                const searchResults = globalTrie.search(newValue.trim(), {
                    maxDistance: 4,
                    matchType: "partial",
                });
                const matchedSuggestions = [];
                if (searchResults.length > 0) {
                    searchResults.forEach((resultLabel) => {
                        const matchingSuggestion = allSuggestions.find((item) => {
                            // Try exact match first, then case-insensitive
                            return (item.label === resultLabel ||
                                item.label.toLowerCase() === resultLabel.toLowerCase() ||
                                item.label
                                    .toLowerCase()
                                    .includes(resultLabel.toLowerCase()) ||
                                resultLabel.toLowerCase().includes(item.label.toLowerCase()));
                        });
                        if (matchingSuggestion &&
                            !matchedSuggestions.find((s) => s.value === matchingSuggestion.value)) {
                            matchedSuggestions.push(matchingSuggestion);
                        }
                    });
                }
                if (matchedSuggestions.length === 0) {
                    console.log("Trie search failed, using fallback filtering");
                    const query = newValue.toLowerCase().trim();
                    const filteredByString = allSuggestions.filter((item) => item.label.toLowerCase().includes(query) ||
                        item.value.toLowerCase().includes(query));
                    console.log("Fallback filtered results:", filteredByString);
                    setFilteredSuggestions(filteredByString);
                }
                else {
                    setFilteredSuggestions(matchedSuggestions);
                }
            }
            else {
                // Show all suggestions when input is empty
                setFilteredSuggestions(allSuggestions);
            }
        }, 300);
    }, [originalFetchedSuggestions, suggestions, normalizeSuggestions]);
    const handleKeyPress = React.useCallback((event) => {
        if (!isSearchable || !suggestionsVisible)
            return;
        switch (event.key) {
            case "ArrowUp": {
                event.preventDefault();
                setSelectedSuggestionIndex((prev) => {
                    const newIndex = prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
                    setTimeout(() => {
                        const selectedItem = suggestionListRef.current?.children[newIndex];
                        selectedItem?.scrollIntoView({ block: "nearest" });
                    }, 0);
                    return newIndex;
                });
                break;
            }
            case "ArrowDown": {
                event.preventDefault();
                setSelectedSuggestionIndex((prev) => {
                    const newIndex = prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
                    setTimeout(() => {
                        const selectedItem = suggestionListRef.current?.children[newIndex];
                        selectedItem?.scrollIntoView({ block: "nearest" });
                    }, 0);
                    return newIndex;
                });
                break;
            }
            case "Escape": {
                event.preventDefault();
                setSuggestionsVisible(false);
                setSelectedSuggestionIndex(-1);
                break;
            }
            case "Enter": {
                event.preventDefault();
                if (selectedSuggestionIndex >= 0 &&
                    filteredSuggestions[selectedSuggestionIndex]) {
                    handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
                }
                break;
            }
            case "Tab": {
                setSuggestionsVisible(false);
                setSelectedSuggestionIndex(-1);
                break;
            }
        }
    }, [
        isSearchable,
        suggestionsVisible,
        selectedSuggestionIndex,
        filteredSuggestions,
    ]);
    const handleSuggestionSelect = React.useCallback((selectedSuggestion) => {
        const displayValue = selectedSuggestion.label;
        const emittedValue = selectedSuggestion.value;
        if (!isControlled) {
            setInternalValue(isSearchable ? displayValue : emittedValue);
        }
        handleChange?.(emittedValue);
        setSuggestionsVisible(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.focus();
    }, [isControlled, handleChange]);
    const handleInputChange = React.useCallback((event) => {
        const newValue = event.target.value;
        if (!isControlled) {
            setInternalValue(newValue);
        }
        if (isSearchable) {
            setSuggestionsVisible(true);
            setSelectedSuggestionIndex(-1);
            handleFilterSuggestions(newValue);
        }
        handleChange?.(newValue);
    }, [isControlled, isSearchable, handleFilterSuggestions, handleChange]);
    const handleBlur = React.useCallback((event) => {
        setTimeout(() => {
            setIsFocused(false);
            setSuggestionsVisible(false);
            setSelectedSuggestionIndex(-1);
            onBlur?.(event);
        }, 150);
    }, [onBlur]);
    const handleFocus = React.useCallback((event) => {
        setIsFocused(true);
        onFocus?.(event);
        if (isSearchable && (filteredSuggestions.length > 0 || isLoading)) {
            setSuggestionsVisible(true);
        }
    }, [onFocus, isSearchable, filteredSuggestions.length, isLoading]);
    // Fetch suggestions function - now with proper dependency management
    const fetchSuggestions = React.useCallback(async () => {
        if (!fetchFunction || retryAttempt > retryConfig.maxAttempt)
            return;
        const cacheKey = `suggestions-initial`;
        try {
            setIsLoading(true);
            const suggestionsResults = (await networkManager.fetchWithRetry(cacheKey, fetchFunction, retryConfig));
            const normalizedSuggestions = normalizeSuggestions(suggestionsResults);
            setOriginalFetchedSuggestions(normalizedSuggestions);
            setFilteredSuggestions(normalizedSuggestions);
            setRetryAttempt(0);
            setHasFetchedInitialData(true);
            normalizedSuggestions.forEach((item) => globalTrie.insert(item.label));
        }
        catch (exception) {
            console.error("Error fetching suggestions:", exception);
            setRetryAttempt((prev) => prev + 1);
            if (isOffline) {
                const cachedSuggestions = networkManager.cache.get(cacheKey);
                if (cachedSuggestions?.length > 0) {
                    const normalizedCachedSuggestions = normalizeSuggestions(cachedSuggestions);
                    setOriginalFetchedSuggestions(normalizedCachedSuggestions);
                    setFilteredSuggestions(normalizedCachedSuggestions);
                }
            }
        }
        finally {
            setIsLoading(false);
        }
    }, [
        fetchFunction,
        retryConfig,
        networkManager,
        isOffline,
        retryAttempt,
        normalizeSuggestions,
    ]);
    // Render highlighted suggestions
    const renderSuggestions = React.useCallback((suggestion, query) => {
        if (!query)
            return jsxRuntime.jsx("span", { children: suggestion });
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedQuery})`, "gi");
        const parts = suggestion.split(regex);
        return (jsxRuntime.jsx("span", { children: parts.map((part, index) => {
                const isHighlighted = index % 2 === 1;
                return isHighlighted ? (jsxRuntime.jsx("span", { className: "highlight", children: part }, index)) : (jsxRuntime.jsx("span", { children: part }, index));
            }) }));
    }, []);
    React.useEffect(() => {
        const focusOnInput = (event) => {
            if (event.key === "/" && !isFocused) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", focusOnInput);
        return () => window.removeEventListener("keydown", focusOnInput);
    }, [isFocused]);
    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            handleFilterSuggestions.cancel();
        };
    }, [isOffline]);
    React.useEffect(() => {
        if (fetchFunction && !hasFetchedInitialData) {
            fetchSuggestions();
        }
    }, [fetchFunction, hasFetchedInitialData, fetchSuggestions]);
    // Handle static suggestions (non-fetched)
    React.useEffect(() => {
        if (!fetchFunction && suggestions.length > 0) {
            const normalizedSuggestions = normalizeSuggestions(suggestions);
            normalizedSuggestions.forEach((item) => globalTrie.insert(item.label));
            setFilteredSuggestions(normalizedSuggestions);
        }
    }, [suggestions, fetchFunction, normalizeSuggestions]);
    const inputId = id || React.useId();
    return (jsxRuntime.jsxs("div", { className: cn("text-field-container", fullWidth ? "full-width" : ""), children: [jsxRuntime.jsxs("div", { className: cn("input-field-wrapper", shrink ? "shrink" : "", error ? "error" : "", isFocused ? "focused" : "", disabled ? "disabled" : "", hasValue ? "has-value" : "", startAdornment ? "has-left-icon" : "", endAdornment || clearable ? "has-right-icon" : "", outlined ? "outlined" : ""), children: [renderIcon(startAdornment, "left"), jsxRuntime.jsx("input", { ...props, id: inputId, ref: ref || inputRef, className: cn("text-field-input", disabled ? "disabled" : "", className), type: type, value: currentValue, onChange: handleInputChange, onFocus: handleFocus, onBlur: handleBlur, onKeyDown: handleKeyPress, style: inputStyles, disabled: disabled, "aria-invalid": Boolean(error), "aria-describedby": cn(error ? `${inputId}-error` : undefined, helperText ? `${inputId}-helper` : undefined).trim() || undefined, "aria-expanded": isSearchable ? suggestionsVisible : undefined, "aria-haspopup": isSearchable ? "listbox" : undefined, "aria-autocomplete": isSearchable ? "list" : undefined, role: isSearchable ? "combobox" : undefined }), renderIcon(endAdornment, "right"), label && (jsxRuntime.jsx("label", { htmlFor: inputId, className: "text-field-label", style: startAdornment ? { left: `${iconSize + 16}px` } : undefined, children: label }))] }), error && (jsxRuntime.jsx("div", { id: `${inputId}-error`, className: "error-message", role: "alert", children: error })), helperText && (jsxRuntime.jsx("span", { id: `${inputId}-helper`, className: "helper-text", children: helperText })), isSearchable && suggestionsVisible && (jsxRuntime.jsx("ul", { ref: suggestionListRef, className: "suggestions-list", role: "listbox", "aria-label": `Suggestions for ${label || "input"}`, children: filteredSuggestions.length > 0 ? (filteredSuggestions.map((suggestion, index) => (jsxRuntime.jsx("li", { role: "option", className: cn("suggestion-item", index === selectedSuggestionIndex ? "selected" : ""), "aria-selected": index === selectedSuggestionIndex, onClick: () => handleSuggestionSelect(suggestion), onMouseEnter: () => setSelectedSuggestionIndex(index), children: renderSuggestions(suggestion.label, currentValue) }, `${suggestion.value}-${index}`)))) : (jsxRuntime.jsx("li", { role: "option", className: "suggestion-item no-results", children: isLoading ? (jsxRuntime.jsxs("div", { className: "loading-container", children: [jsxRuntime.jsx(LoaderCircle, { className: "animate-spin", size: 16 }), jsxRuntime.jsx("span", { children: "Loading..." })] })) : ("No Results") })) }))] }));
});
InputField.displayName = "InputField";
var Input = React.memo(InputField);

var css_248z$1 = ".checkbox-container {\n  font-family: \"hellix-regular\" !important;\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n}\n.checkbox-container.disabled {\n  cursor: not-allowed;\n  opacity: 0.6;\n}\n\n.checkbox-input {\n  position: absolute;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n.checkbox-input:focus + .checkbox-custom {\n  outline: 2px solid #fe0095;\n  outline-offset: 2px;\n}\n.checkbox-input:checked + .checkbox-custom {\n  background-color: #fe0095;\n  border-color: #fe0095;\n}\n.checkbox-input:checked + .checkbox-custom::after {\n  opacity: 1;\n}\n.checkbox-input:indeterminate + .checkbox-custom {\n  background-color: #fe0095;\n  border-color: #fe0095;\n}\n.checkbox-input:indeterminate + .checkbox-custom::before {\n  opacity: 1;\n}\n.checkbox-input:disabled + .checkbox-custom {\n  background-color: #f5f5f5;\n  border-color: #d0d0d0;\n  cursor: not-allowed;\n}\n\n.checkbox-custom {\n  position: relative;\n  width: 20px;\n  height: 20px;\n  border: 2px solid #333333;\n  border-radius: 4px;\n  background-color: white;\n  transition: all 0.2s ease;\n  flex-shrink: 0;\n}\n.checkbox-custom::after {\n  content: \"\";\n  position: absolute;\n  top: 4px;\n  left: 7px;\n  width: 4px;\n  height: 8px;\n  border: solid white;\n  border-width: 0 2px 2px 0;\n  transform: rotate(45deg) scale(1);\n  opacity: 0;\n  transition: all 0.2s ease;\n}\n.checkbox-custom::before {\n  content: \"\";\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 10px;\n  height: 2px;\n  background-color: white;\n  transform: translate(-50%, -50%) scale(1);\n  opacity: 0;\n  transition: all 0.2s ease;\n}\n\n.checkbox-label {\n  font-size: 14px;\n  color: #333;\n  line-height: 1.4;\n  user-select: none;\n}\n.checkbox-label.disabled {\n  color: #999;\n}";
styleInject(css_248z$1);

const Checkbox = React.forwardRef(({ id, label, checked = false, disabled = false, indeterminate = false, onChange, className = "", "aria-describedby": ariaDescribedBy, "aria-labelledby": ariaLabelledBy, required = false, }, ref) => {
    const inputRef = React.useRef(null);
    React.useImperativeHandle(ref, () => inputRef.current, []);
    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);
    const handleChange = (event) => {
        if (onChange && !disabled) {
            onChange(event.target.checked);
        }
    };
    const containerClasses = cn("checkbox-container", disabled ? "disabled" : "", className);
    const labelClasses = cn("checkbox-label", disabled ? "disabled" : "");
    return (jsxRuntime.jsxs("label", { className: containerClasses, htmlFor: id, children: [jsxRuntime.jsx("input", { ref: inputRef, type: "checkbox", id: id, className: "checkbox-input", checked: checked, disabled: disabled, onChange: handleChange, "aria-describedby": ariaDescribedBy, "aria-labelledby": ariaLabelledBy, required: required }), jsxRuntime.jsx("span", { className: "checkbox-custom", "aria-hidden": "true" }), jsxRuntime.jsx("span", { className: labelClasses, children: label })] }));
});
Checkbox.displayName = "Checkbox";

var css_248z = ".radio-button {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  cursor: pointer;\n  user-select: none;\n  transition: all 0.2s ease;\n}\n.radio-button--disabled {\n  cursor: not-allowed;\n  opacity: 0.6;\n}\n.radio-button__input {\n  position: absolute;\n  opacity: 0;\n  cursor: pointer;\n  width: 0;\n  height: 0;\n}\n.radio-button__input:focus + .radio-button__label .radio-button__control {\n  outline: 2px solid #2196f3;\n  outline-offset: 2px;\n}\n.radio-button__input:focus-visible + .radio-button__label .radio-button__control {\n  outline: 2px solid #2196f3;\n  outline-offset: 2px;\n}\n.radio-button__input:focus:not(:focus-visible) + .radio-button__label .radio-button__control {\n  outline: none;\n}\n.radio-button__label {\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  position: relative;\n}\n.radio-button--disabled .radio-button__label {\n  cursor: not-allowed;\n}\n.radio-button__control {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px solid #000;\n  border-radius: 50%;\n  background-color: #ffffff;\n  transition: all 0.2s ease;\n  flex-shrink: 0;\n}\n.radio-button__control::before {\n  content: \"\";\n  position: absolute;\n  border-radius: 50%;\n  background-color: transparent;\n  transition: all 0.2s ease;\n  transform: scale(0);\n}\n.radio-button:hover:not(.radio-button--disabled) .radio-button__control {\n  border-color: #ddd;\n  transform: scale(1.05);\n}\n.radio-button__indicator {\n  border-radius: 50%;\n  background-color: transparent;\n  transition: all 0.2s ease;\n  transform: scale(0);\n}\n.radio-button__text {\n  margin-left: 8px;\n  color: #333;\n  font-size: 16px;\n  line-height: 1.5;\n  transition: color 0.2s ease;\n}\n.radio-button--checked .radio-button__control {\n  border-color: #fe0095;\n  animation: bounce 0.3s ease-in-out;\n}\n.radio-button--checked .radio-button__indicator {\n  background-color: #fe0095;\n  transform: scale(1);\n  animation: bounce-in 0.3s ease-in-out;\n}\n.radio-button--small .radio-button__control {\n  width: 16px;\n  height: 16px;\n}\n.radio-button--small .radio-button__indicator {\n  width: 12px;\n  height: 12px;\n}\n.radio-button--small .radio-button__text {\n  font-size: 14px;\n}\n.radio-button--medium .radio-button__control {\n  width: 20px;\n  height: 20px;\n}\n.radio-button--medium .radio-button__indicator {\n  width: 16px;\n  height: 16px;\n}\n.radio-button--medium .radio-button__text {\n  font-size: 16px;\n}\n.radio-button--large .radio-button__control {\n  width: 24px;\n  height: 24px;\n}\n.radio-button--large .radio-button__indicator {\n  width: 18px;\n  height: 18px;\n}\n.radio-button--large .radio-button__text {\n  font-size: 18px;\n}\n.radio-button--primary.radio-button--checked .radio-button__control {\n  border-color: #fe0095;\n}\n.radio-button--primary.radio-button--checked .radio-button__indicator {\n  background-color: #fe0095;\n}\n.radio-button--secondary.radio-button--checked .radio-button__control {\n  border-color: #6c757d;\n}\n.radio-button--secondary.radio-button--checked .radio-button__indicator {\n  background-color: #6c757d;\n}\n.radio-button--success.radio-button--checked .radio-button__control {\n  border-color: #28a745;\n}\n.radio-button--success.radio-button--checked .radio-button__indicator {\n  background-color: #28a745;\n}\n.radio-button--danger.radio-button--checked .radio-button__control {\n  border-color: #dc3545;\n}\n.radio-button--danger.radio-button--checked .radio-button__indicator {\n  background-color: #dc3545;\n}\n.radio-button--disabled .radio-button__control {\n  border-color: #e0e0e0;\n  background-color: #f5f5f5;\n}\n.radio-button--disabled .radio-button__text {\n  color: #999;\n}\n.radio-button--disabled.radio-button--checked .radio-button__control {\n  border-color: #ccc;\n}\n.radio-button--disabled.radio-button--checked .radio-button__indicator {\n  background-color: #ccc;\n}\n\n@keyframes bounce {\n  0% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(1.2);\n  }\n  100% {\n    transform: scale(1);\n  }\n}\n@keyframes bounce-in {\n  0% {\n    transform: scale(0);\n  }\n  50% {\n    transform: scale(1.2);\n  }\n  100% {\n    transform: scale(1);\n  }\n}\n@media (prefers-contrast: high) {\n  .radio-button__control {\n    border-width: 2px;\n  }\n  .radio-button--checked .radio-button__control {\n    border-color: #000;\n  }\n  .radio-button--checked .radio-button__indicator {\n    background-color: #000;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .radio-button__control, .radio-button__indicator {\n    animation: none !important;\n    transition: none !important;\n  }\n}";
styleInject(css_248z);

const RadioButton = React.forwardRef(({ name, value, checked = false, disabled = false, label, className = "", size = "medium", variant = "primary", onChange, onFocus, onBlur, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const id = React.useId();
    const inputId = `radio-${id}`;
    const handleChange = (e) => {
        if (!disabled && onChange) {
            onChange(e);
        }
    };
    const handleKeyDown = (event) => {
        // Handle arrow key navigation within radio groups
        if (event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight") {
            event.preventDefault();
            const radioGroup = document.querySelectorAll(`input[name="${name}"]`);
            const radioArray = Array.from(radioGroup);
            const currentIndex = radioArray.findIndex((radio) => radio === event.target);
            let nextIndex;
            if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                nextIndex =
                    currentIndex > 0 ? currentIndex - 1 : radioArray.length - 1;
            }
            else {
                nextIndex =
                    currentIndex < radioArray.length - 1 ? currentIndex + 1 : 0;
            }
            const nextRadio = radioArray[nextIndex];
            if (nextRadio && !nextRadio.disabled) {
                nextRadio.focus();
                nextRadio.click();
            }
        }
    };
    return (jsxRuntime.jsxs("div", { className: cn("radio-button", `radio-button--${size}`, `radio-button--${variant}`, disabled ? "radio-button--disabled" : "", checked ? "radio-button--checked" : "", className), children: [jsxRuntime.jsx("input", { ref: ref, id: inputId, type: "radio", name: name, value: value, checked: checked, disabled: disabled, onChange: handleChange, onKeyDown: handleKeyDown, onFocus: onFocus, onBlur: onBlur, className: "radio-button__input", "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, ...props }), jsxRuntime.jsxs("label", { htmlFor: inputId, className: "radio-button__label", children: [jsxRuntime.jsx("span", { className: "radio-button__control", children: jsxRuntime.jsx("span", { className: "radio-button__indicator" }) }), label && jsxRuntime.jsx("span", { className: "radio-button__text", children: label })] })] }));
});
RadioButton.displayName = "RadioButton";

exports.Button = Button;
exports.Checkbox = Checkbox;
exports.Input = Input;
exports.RadioButton = RadioButton;
exports.Toggle = Toggle;
