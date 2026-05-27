import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  memo,
  cloneElement,
  forwardRef,
  useId,
  CSSProperties,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent
} from 'react';
import { LoaderCircle } from 'lucide-react';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { cn, NetworkManager, TrieManager } from '@lib';
import { InputFieldProps, IconProps, SuggestionType } from './Input.types';
import './input.scss';

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className = '',
      helperText,
      type = 'text',
      label,
      error,
      shrink,
      value: controlledValue,
      startAdornment,
      endAdornment,
      disabled,
      id,
      defaultValue = '',
      onIconClick,
      iconSize = 18,
      clearable,
      fullWidth = false,
      suggestions = [],
      isSearchable = false,
      onBlur,
      onFocus,
      fetchFunction,
      retryConfig = { maxAttempt: 5 },
      handleChange,
      onValueChange,
      enableShortcut = false,
      outlined = false,
      borderless = false,
      format,
      parse,
      formatOn = 'blur',
      rawOnChange = true,
      maxRawLength,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
    const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionType[]>([]);
    const [originalFetchedSuggestions, setOriginalFetchedSuggestions] = useState<SuggestionType[]>(
      []
    );
    const [suggestionsVisible, setSuggestionsVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
    const retryAttemptRef = useRef<number>(0);
    const [hasFetchedInitialData, setHasFetchedInitialData] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [displayText, setDisplayText] = useState<string>(String(defaultValue ?? ''));

    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);
    const suggestionListRef = useRef<HTMLUListElement>(null);
    const cursorRef = useRef<number | null>(null);
    const isFocusedRef = useRef<boolean>(false);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = Boolean(currentValue);
    const isControlled = controlledValue !== undefined;

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const networkManager = useMemo(() => NetworkManager.getInstance(), []);

    // Create a namespaced Trie instance for this component to prevent memory leaks
    const trieNamespace = useMemo(() => inputId, [inputId]);
    const trie = useMemo(() => TrieManager.getOrCreate(trieNamespace), [trieNamespace]);

    const formatSafe = useCallback((v: any) => (format ? format(v) : (v ?? '')), [format]);
    const parseSafe = useCallback((s: string) => (parse ? parse(s) : s), [parse]);

    const handleOnIconClick = useCallback(
      (
        position: 'left' | 'right',
        iconProps: IconProps | undefined,
        event: MouseEvent<HTMLDivElement>
      ) => {
        if (iconProps?.disabled) return;
        iconProps?.onClick?.(event);
        onIconClick?.(position, event);
      },
      [onIconClick]
    );

    const renderIcon = useCallback(
      (iconProps: IconProps | undefined, position: 'left' | 'right') => {
        if (isEmpty(iconProps) || !iconProps) return null;
        const { icon, onClick, toolTip, disabled, className = '' } = iconProps;
        const handleKeyDown = (e: ReactKeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOnIconClick(position, iconProps, e as any);
          }
        };
        return (
          <div
            className={cn(
              'text-field-icon',
              position,
              disabled ? 'disabled' : '',
              className,
              onClick ? 'clickable' : ''
            )}
            onClick={(e) => handleOnIconClick(position, iconProps, e)}
            onKeyDown={handleKeyDown}
            title={toolTip}
            role={onClick ? 'button' : 'presentation'}
            tabIndex={onClick && !disabled ? 0 : -1}
            aria-label={toolTip}
          >
            {React.isValidElement(icon)
              ? cloneElement(
                  icon as React.ReactElement<any>,
                  {
                    size: iconSize as any,
                    className: cn(
                      'icon',
                      disabled ? 'disabled' : '',
                      (icon as any)?.props?.className || ''
                    )
                  } as any
                )
              : icon}
          </div>
        );
      },
      [handleOnIconClick, iconSize]
    );

    const inputStyles = useMemo(() => {
      const style: CSSProperties = {};
      if (startAdornment) style.paddingLeft = `${iconSize + 20}px`;
      if (endAdornment || (clearable && currentValue)) style.paddingRight = `${iconSize + 16}px`;
      if (borderless) {
        style.border = 'none';
        style.background = 'transparent';
        style.boxShadow = 'none';
        style.paddingLeft = 0;
        style.paddingRight = 0;
      }
      return style;
    }, [startAdornment, endAdornment, clearable, currentValue, iconSize, borderless]);

    const normalizeSuggestions = useCallback((arr: any[]): SuggestionType[] => {
      if (!arr || arr.length === 0) return [];
      return arr.map((item) => {
        if (typeof item === 'string') return { label: item, value: item };
        if (
          typeof item === 'object' &&
          (item.label || item.text || item.name) &&
          (item.value || item.id || item.code)
        ) {
          return {
            label: item.label || item.text || item.name,
            value: item.value || item.id || item.code
          };
        }
        return { label: String(item), value: String(item) };
      });
    }, []);

    const allForDisplay =
      originalFetchedSuggestions.length > 0
        ? originalFetchedSuggestions
        : normalizeSuggestions(suggestions);

    const selectedFromValue = useMemo(() => {
      if (!isSearchable) return null;
      return allForDisplay.find((s) => s.value === currentValue) || null;
    }, [isSearchable, allForDisplay, currentValue]);

    const displayValue = isSearchable
      ? suggestionsVisible
        ? searchText
        : (selectedFromValue?.label ?? String(currentValue ?? ''))
      : (displayText ?? String(currentValue ?? ''));

    useEffect(() => {
      if (isSearchable) return;
      const raw = currentValue;
      if (formatOn === 'none') {
        setDisplayText(String(raw ?? ''));
      } else {
        setDisplayText(formatSafe(raw));
      }
    }, [currentValue, isSearchable, formatOn, formatSafe]);

    const handleFilterSuggestions = useMemo(() => {
      return debounce((newValue: string) => {
        const allSuggestions =
          originalFetchedSuggestions.length > 0
            ? originalFetchedSuggestions
            : normalizeSuggestions(suggestions);
        if (newValue.trim()) {
          const searchResults = trie.search(newValue.trim(), {
            maxDistance: 4,
            matchType: 'partial'
          });
          const matched: SuggestionType[] = [];
          if (searchResults.length > 0) {
            searchResults.forEach((resultLabel) => {
              const hit = allSuggestions.find(
                (item) =>
                  item.label === resultLabel ||
                  item.label.toLowerCase() === resultLabel.toLowerCase() ||
                  item.label.toLowerCase().includes(resultLabel.toLowerCase()) ||
                  resultLabel.toLowerCase().includes(item.label.toLowerCase())
              );
              if (hit && !matched.find((s) => s.value === hit.value)) matched.push(hit);
            });
          }
          if (matched.length === 0) {
            const q = newValue.toLowerCase().trim();
            setFilteredSuggestions(
              allSuggestions.filter(
                (i) => i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)
              )
            );
          } else {
            setFilteredSuggestions(matched);
          }
        } else {
          setFilteredSuggestions(allSuggestions);
        }
      }, 300);
    }, [originalFetchedSuggestions, suggestions, normalizeSuggestions]);

    const handleSuggestionSelect = useCallback(
      (selectedSuggestion: SuggestionType) => {
        const display = selectedSuggestion.label;
        const emitted = selectedSuggestion.value;
        if (!isControlled) {
          setInternalValue(isSearchable ? display : emitted);
        }
        handleChange?.(emitted);
        onValueChange?.(emitted);
        setSearchText('');
        setSuggestionsVisible(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.focus();
      },
      [isControlled, handleChange, onValueChange, isSearchable]
    );

    const handleKeyPress = useCallback(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (!isSearchable || !suggestionsVisible) return;
        switch (event.key) {
          case 'ArrowUp': {
            event.preventDefault();
            setSelectedSuggestionIndex((prev) => {
              const ni = prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
              setTimeout(() => {
                const el = suggestionListRef.current?.children[ni] as HTMLElement;
                el?.scrollIntoView({ block: 'nearest' });
              }, 0);
              return ni;
            });
            break;
          }
          case 'ArrowDown': {
            event.preventDefault();
            setSelectedSuggestionIndex((prev) => {
              const ni = prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
              setTimeout(() => {
                const el = suggestionListRef.current?.children[ni] as HTMLElement;
                el?.scrollIntoView({ block: 'nearest' });
              }, 0);
              return ni;
            });
            break;
          }
          case 'Escape': {
            event.preventDefault();
            setSuggestionsVisible(false);
            setSelectedSuggestionIndex(-1);
            setSearchText('');
            break;
          }
          case 'Enter': {
            event.preventDefault();
            if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
              handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
            }
            break;
          }
          case 'Tab': {
            setSuggestionsVisible(false);
            setSelectedSuggestionIndex(-1);
            break;
          }
        }
      },
      [
        isSearchable,
        suggestionsVisible,
        selectedSuggestionIndex,
        filteredSuggestions,
        handleSuggestionSelect
      ]
    );

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const nextDisplay = event.target.value;

        if (isSearchable) {
          setSearchText(nextDisplay);
          setSuggestionsVisible(true);
          setSelectedSuggestionIndex(-1);
          handleFilterSuggestions(nextDisplay);
          if (!isControlled) setInternalValue(nextDisplay);
          return;
        }

        setDisplayText(nextDisplay);
        const raw = parseSafe(nextDisplay) as string;

        if (typeof maxRawLength === 'number' && (raw ?? '').toString().length > maxRawLength) {
          const prev = isControlled ? controlledValue : internalValue;
          if (formatOn === 'change') {
            setDisplayText(formatSafe(prev));
          } else {
            setDisplayText(String(prev ?? ''));
          }
          return;
        }

        if (!isControlled) setInternalValue(raw);

        const anyProps = props as any;
        if (rawOnChange) {
          const fieldName = anyProps?.name;
          anyProps?.onChange?.({ target: { value: raw, name: fieldName } });
        } else {
          anyProps?.onChange?.(event);
        }
        handleChange?.(raw);

        if (formatOn === 'change') {
          const formatted = formatSafe(raw);
          const isDeleting = nextDisplay.length < (displayText ?? '').length;
          if (isDeleting && formatted.length >= (displayText ?? '').length) {
            // Deletion would be undone by the format — let it through unformatted
          } else {
            const selStart = event.target.selectionStart ?? 0;
            const diff = formatted.length - nextDisplay.length;
            cursorRef.current = Math.max(0, selStart + diff);
            setDisplayText(formatted);
          }
        }
      },
      [
        isSearchable,
        isControlled,
        handleFilterSuggestions,
        parseSafe,
        handleChange,
        props,
        formatOn,
        formatSafe,
        displayText,
        controlledValue,
        internalValue,
        rawOnChange,
        maxRawLength
      ]
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = false;
        const blurTarget = event.target;
        setTimeout(() => {
          if (isFocusedRef.current) return;
          setIsFocused(false);
          setSuggestionsVisible(false);
          setSelectedSuggestionIndex(-1);
          if (!isSearchable && formatOn === 'blur') {
            const raw = parseSafe(displayText ?? '');
            setDisplayText(formatSafe(raw));
          }
          onBlur?.({ ...event, target: blurTarget });
        }, 150);
      },
      [onBlur, isSearchable, formatOn, parseSafe, displayText, formatSafe]
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = true;
        setIsFocused(true);
        onFocus?.(event);
        if (isSearchable) {
          setSuggestionsVisible(true);
          setSearchText(selectedFromValue?.label ?? String(currentValue ?? ''));
        } else if (formatOn === 'blur') {
          setDisplayText(String(currentValue ?? ''));
        }
      },
      [onFocus, isSearchable, selectedFromValue, currentValue, formatOn]
    );

    const fetchSuggestions = useCallback(async () => {
      if (!fetchFunction || retryAttemptRef.current > retryConfig.maxAttempt!) return;
      const cacheKey = `suggestions-initial`;
      try {
        setIsLoading(true);
        const suggestionsResults = (await networkManager.fetchWithRetry(
          cacheKey,
          fetchFunction,
          retryConfig
        )) as any[];
        const normalized = normalizeSuggestions(suggestionsResults);
        setOriginalFetchedSuggestions(normalized);
        setFilteredSuggestions(normalized);
        retryAttemptRef.current = 0;
        setHasFetchedInitialData(true);
        normalized.forEach((item) => trie.insert(item.label));
      } catch (exception) {
        retryAttemptRef.current += 1;
        if (isOffline) {
          const cached = networkManager.cache.get(cacheKey) as any[];
          if (cached?.length > 0) {
            const normalizedCached = normalizeSuggestions(cached);
            setOriginalFetchedSuggestions(normalizedCached);
            setFilteredSuggestions(normalizedCached);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }, [fetchFunction, retryConfig, networkManager, isOffline, normalizeSuggestions]);

    const renderSuggestions = useCallback((suggestion: string, query: string) => {
      if (!query) return <span>{suggestion}</span>;
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = suggestion.split(regex);
      return (
        <span>
          {parts.map((part, index) =>
            index % 2 === 1 ? (
              <span className="highlight" key={index}>
                {part}
              </span>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </span>
      );
    }, []);

    useEffect(() => {
      if (!enableShortcut) return;
      const focusOnInput = (event: KeyboardEvent) => {
        if (event.key === '/' && !isFocused) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      };
      window.addEventListener('keydown', focusOnInput);
      return () => window.removeEventListener('keydown', focusOnInput);
    }, [enableShortcut, isFocused]);

    useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        handleFilterSuggestions.cancel();
      };
    }, [handleFilterSuggestions]);

    useEffect(() => {
      if (fetchFunction && !hasFetchedInitialData) fetchSuggestions();
    }, [fetchFunction, hasFetchedInitialData, fetchSuggestions]);

    useEffect(() => {
      if (!fetchFunction && suggestions.length > 0) {
        const normalized = normalizeSuggestions(suggestions);
        normalized.forEach((item) => trie.insert(item.label));
        setFilteredSuggestions(normalized);
      }
    }, [suggestions, fetchFunction, normalizeSuggestions]);

    // Cleanup: Clear the Trie instance when component unmounts
    useEffect(() => {
      return () => {
        TrieManager.clear(trieNamespace);
      };
    }, [trieNamespace]);

    useLayoutEffect(() => {
      if (
        cursorRef.current !== null &&
        inputRef.current &&
        document.activeElement === inputRef.current
      ) {
        const pos = cursorRef.current;
        inputRef.current.setSelectionRange(pos, pos);
        cursorRef.current = null;
      }
    });

    return (
      <div
        className={cn(
          'text-field-container',
          fullWidth ? 'full-width' : '',
          borderless ? 'borderless' : ''
        )}
      >
        <div
          className={cn(
            'input-field-wrapper',
            shrink ? 'shrink' : '',
            error ? 'error' : '',
            isFocused ? 'focused' : '',
            disabled ? 'disabled' : '',
            hasValue ? 'has-value' : '',
            startAdornment ? 'has-left-icon' : '',
            endAdornment || clearable ? 'has-right-icon' : '',
            outlined ? 'outlined' : '',
            borderless ? 'borderless' : ''
          )}
        >
          {renderIcon(startAdornment, 'left')}
          <input
            {...props}
            id={inputId}
            ref={inputRef}
            className={cn('text-field-input', disabled ? 'disabled' : '', className)}
            type={type}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyPress}
            style={inputStyles}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              cn(
                error ? `${inputId}-error` : undefined,
                helperText ? `${inputId}-helper` : undefined
              ).trim() || undefined
            }
            aria-expanded={isSearchable ? suggestionsVisible : undefined}
            aria-haspopup={isSearchable ? 'listbox' : undefined}
            aria-autocomplete={isSearchable ? 'list' : undefined}
            role={isSearchable ? 'combobox' : undefined}
            maxLength={typeof maxRawLength === 'number' ? undefined : (props as any)?.maxLength}
          />
          {renderIcon(endAdornment, 'right')}
          {label && (
            <label
              htmlFor={inputId}
              className="text-field-label"
              style={startAdornment ? { left: `${iconSize + 16}px` } : undefined}
            >
              {label}
            </label>
          )}
        </div>

        {error && (
          <div id={`${inputId}-error`} className="error-message" role="alert">
            {error}
          </div>
        )}

        {helperText && (
          <span id={`${inputId}-helper`} className="helper-text">
            {helperText}
          </span>
        )}

        {isSearchable && suggestionsVisible && (
          <ul
            ref={suggestionListRef}
            className="suggestions-list"
            role="listbox"
            aria-label={`Suggestions for ${label || 'input'}`}
          >
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.value}-${index}`}
                  role="option"
                  className={cn(
                    'suggestion-item',
                    index === selectedSuggestionIndex ? 'selected' : ''
                  )}
                  aria-selected={index === selectedSuggestionIndex}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {renderSuggestions(
                    suggestion.label,
                    isSearchable ? searchText : String(currentValue ?? '')
                  )}
                </li>
              ))
            ) : (
              <li role="option" className="suggestion-item no-results">
                {isLoading ? (
                  <div className="loading-container">
                    <LoaderCircle className="animate-spin" size={16} />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'No Results'
                )}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default memo(InputField);
