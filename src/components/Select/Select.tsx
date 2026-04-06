import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
  cloneElement,
  forwardRef,
  useId,
  CSSProperties,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent
} from 'react';
import { ChevronDown, LoaderCircle, X } from 'lucide-react';
import isEmpty from 'lodash/isEmpty';
import { cn, NetworkManager, TrieManager } from '@lib';
import { SelectProps, IconProps, OptionType, CategoryType } from './Select.types';
import './select.scss';

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      className = '',
      helperText,
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
      clearable = false,
      fullWidth = false,
      options = [],
      categories = [],
      onBlur,
      onFocus,
      fetchFunction,
      retryConfig = { maxAttempt: 5 },
      onChange,
      outlined = false,
      searchable = true,
      multiple = false,
      placeholder,
      name,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [internalValue, setInternalValue] = useState<string | string[]>(defaultValue);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1);
    const [originalFetchedOptions, setOriginalFetchedOptions] = useState<OptionType[]>([]);
    const [originalFetchedCategories, setOriginalFetchedCategories] = useState<CategoryType[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
    const [retryAttempt, setRetryAttempt] = useState<number>(0);
    const [hasFetchedInitialData, setHasFetchedInitialData] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');

    const selectRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasInitializedOptions = useRef<boolean>(false);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = multiple
      ? Array.isArray(currentValue) && currentValue.length > 0
      : Boolean(currentValue);
    const isControlled = controlledValue !== undefined;

    const selectId = id || useId();
    const networkManager = useMemo(() => NetworkManager.getInstance(), []);

    const trieNamespace = useMemo(() => selectId, [selectId]);

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
              'select-icon',
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

    const selectStyles = useMemo(() => {
      const style: CSSProperties = {};
      if (startAdornment) style.paddingLeft = `${iconSize + 20}px`;
      if (endAdornment || clearable) style.paddingRight = `${iconSize + 40}px`;
      return style;
    }, [startAdornment, endAdornment, clearable, iconSize]);

    const normalizeOptions = useCallback((arr: any[]): OptionType[] => {
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
            value: item.value || item.id || item.code,
            disabled: item.disabled || false,
            icon: item.icon,
            image: item.image
          };
        }
        return { label: String(item), value: String(item) };
      });
    }, []);

    const useCategories = categories.length > 0 || originalFetchedCategories.length > 0;

    const allForDisplay = useMemo(() => {
      return useCategories
        ? []
        : originalFetchedOptions.length > 0
          ? originalFetchedOptions
          : normalizeOptions(options);
    }, [useCategories, originalFetchedOptions, options]);

    const allCategoriesForDisplay = useMemo(() => {
      return useCategories
        ? originalFetchedCategories.length > 0
          ? originalFetchedCategories
          : categories
        : [];
    }, [useCategories, originalFetchedCategories, categories]);

    const selectedOptions = useMemo(() => {
      const allOpts = useCategories
        ? allCategoriesForDisplay.flatMap((cat) => cat.options)
        : allForDisplay;

      if (multiple && Array.isArray(currentValue)) {
        return allOpts.filter((o) => currentValue.includes(o.value));
      }
      return allOpts.filter((o) => o.value === currentValue);
    }, [useCategories, allCategoriesForDisplay, allForDisplay, currentValue, multiple]);

    const displayValue = useMemo(() => {
      if (dropdownVisible && searchable) return searchText;
      if (multiple) return '';
      return selectedOptions[0]?.label ?? '';
    }, [dropdownVisible, searchable, searchText, multiple, selectedOptions]);

    const getFlattenedOptions = useCallback((cats: CategoryType[]): OptionType[] => {
      return cats.flatMap((cat) => cat.options);
    }, []);

    const scoreMatch = useCallback((label: string, value: string, q: string): number => {
      const l = label.toLowerCase();
      const v = value.toLowerCase();
      if (l === q || v === q) return 100;
      if (l.startsWith(q) || v.startsWith(q)) return 90;
      if (l.includes(q) || v.includes(q)) return 70;
      const labelWords = l.split(/\s+/);
      const queryWords = q.split(/\s+/);
      if (queryWords.every((qw) => labelWords.some((lw) => lw.startsWith(qw)))) return 50;
      return 0;
    }, []);

    // filteredCategories: full category list when not searching; empty when searching
    const filteredCategories = useMemo((): CategoryType[] => {
      if (!useCategories || searchText.trim()) return [];
      return allCategoriesForDisplay;
    }, [searchText, useCategories, allCategoriesForDisplay]);

    // filteredOptions: flat filtered list for non-category mode, or flat search results in category mode
    const filteredOptions = useMemo((): OptionType[] => {
      const q = searchText.toLowerCase().trim();

      if (useCategories) {
        if (!q) return [];
        const scored = allCategoriesForDisplay
          .flatMap((cat) =>
            cat.options.map((opt) => ({ opt, score: scoreMatch(opt.label, opt.value, q) }))
          )
          .filter(({ score }) => score > 0);
        if (scored.length === 0) {
          const trie = TrieManager.getOrCreate(trieNamespace);
          const trieResults = new Set(
            trie.search(q, { maxDistance: 1, matchType: 'partial' }).map((r) => r.toLowerCase())
          );
          return allCategoriesForDisplay.flatMap((cat) =>
            cat.options.filter((opt) => trieResults.has(opt.label.toLowerCase()))
          );
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.map(({ opt }) => opt);
      }

      if (!q) return allForDisplay;

      const scored = allForDisplay
        .map((opt) => ({ opt, score: scoreMatch(opt.label, opt.value, q) }))
        .filter(({ score }) => score > 0);
      if (scored.length === 0) {
        const trie = TrieManager.getOrCreate(trieNamespace);
        const trieResults = new Set(
          trie.search(q, { maxDistance: 1, matchType: 'partial' }).map((r) => r.toLowerCase())
        );
        return allForDisplay.filter((opt) => trieResults.has(opt.label.toLowerCase()));
      }
      scored.sort((a, b) => b.score - a.score);
      return scored.map(({ opt }) => opt);
    }, [
      searchText,
      useCategories,
      allForDisplay,
      allCategoriesForDisplay,
      trieNamespace,
      scoreMatch
    ]);

    const handleOptionSelect = useCallback(
      (selectedOpt: OptionType) => {
        if (selectedOpt.disabled) return;

        const emitted = selectedOpt.value;
        if (multiple) {
          const currentValues = Array.isArray(currentValue) ? currentValue : [];
          const newValues = currentValues.includes(emitted)
            ? currentValues.filter((v) => v !== emitted)
            : [...currentValues, emitted];

          if (!isControlled) {
            setInternalValue(newValues);
          }
          onChange?.(newValues);
        } else {
          if (!isControlled) {
            setInternalValue(emitted);
          }
          onChange?.(emitted);
          setSearchText('');
          setDropdownVisible(false);
          setSelectedOptionIndex(-1);
        }
      },
      [multiple, currentValue, isControlled, onChange]
    );

    const handleRemoveTag = useCallback(
      (valueToRemove: string, event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const currentValues = Array.isArray(currentValue) ? currentValue : [];
        const newValues = currentValues.filter((v) => v !== valueToRemove);
        if (!isControlled) {
          setInternalValue(newValues);
        }
        onChange?.(newValues);
      },
      [currentValue, isControlled, onChange]
    );

    const handleKeyPress = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement | HTMLInputElement>) => {
        const allOpts =
          useCategories && filteredCategories.length > 0
            ? getFlattenedOptions(filteredCategories)
            : filteredOptions;

        switch (event.key) {
          case 'ArrowUp': {
            event.preventDefault();
            if (!dropdownVisible) {
              setDropdownVisible(true);
            } else {
              setSelectedOptionIndex((prev) => {
                const ni = prev > 0 ? prev - 1 : allOpts.length - 1;
                setTimeout(() => {
                  const el = dropdownListRef.current?.querySelectorAll(
                    '.dropdown-item:not(.category-header)'
                  )[ni] as HTMLElement;
                  el?.scrollIntoView({ block: 'nearest' });
                }, 0);
                return ni;
              });
            }
            break;
          }
          case 'ArrowDown': {
            event.preventDefault();
            if (!dropdownVisible) {
              setDropdownVisible(true);
            } else {
              setSelectedOptionIndex((prev) => {
                const ni = prev < allOpts.length - 1 ? prev + 1 : 0;
                setTimeout(() => {
                  const el = dropdownListRef.current?.querySelectorAll(
                    '.dropdown-item:not(.category-header)'
                  )[ni] as HTMLElement;
                  el?.scrollIntoView({ block: 'nearest' });
                }, 0);
                return ni;
              });
            }
            break;
          }
          case 'Escape': {
            event.preventDefault();
            setDropdownVisible(false);
            setSelectedOptionIndex(-1);
            setSearchText('');
            inputRef.current?.blur();
            break;
          }
          case 'Enter': {
            event.preventDefault();
            if (dropdownVisible) {
              const targetIndex = selectedOptionIndex >= 0 ? selectedOptionIndex : 0;
              const targetOpt = allOpts[targetIndex];
              if (targetOpt) handleOptionSelect(targetOpt);
            } else {
              setDropdownVisible(true);
              if (searchable) setTimeout(() => inputRef.current?.focus(), 0);
            }
            break;
          }
          case 'Tab': {
            setDropdownVisible(false);
            setSelectedOptionIndex(-1);
            setSearchText('');
            break;
          }
        }
      },
      [
        dropdownVisible,
        selectedOptionIndex,
        useCategories,
        filteredCategories,
        filteredOptions,
        handleOptionSelect,
        getFlattenedOptions
      ]
    );

    const handleSelectClick = useCallback(() => {
      if (disabled) return;
      setDropdownVisible(true);
      if (searchable) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [disabled, searchable]);

    const handleClear = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const emptyValue = multiple ? [] : '';
        if (!isControlled) {
          setInternalValue(emptyValue);
        }
        onChange?.(emptyValue);
        setSearchText('');
        setDropdownVisible(false);
      },
      [isControlled, onChange, multiple]
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLDivElement | HTMLInputElement>) => {
        setTimeout(() => {
          const relatedTarget = event.relatedTarget as Node;
          if (selectRef.current && relatedTarget && selectRef.current.contains(relatedTarget)) {
            return;
          }
          setIsFocused(false);
          setDropdownVisible(false);
          setSelectedOptionIndex(-1);
          setSearchText('');
          onBlur?.(event as FocusEvent<HTMLDivElement>);
        }, 150);
      },
      [onBlur]
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLDivElement | HTMLInputElement>) => {
        setIsFocused(true);
        setDropdownVisible(true);
        onFocus?.(event as FocusEvent<HTMLDivElement>);
      },
      [onFocus]
    );

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!searchable) return;
        setSearchText(event.target.value);
        setDropdownVisible(true);
        setSelectedOptionIndex(-1);
      },
      [searchable]
    );

    const fetchOptions = useCallback(async () => {
      if (!fetchFunction || retryAttempt > retryConfig.maxAttempt!) return;
      const cacheKey = `select-options-initial`;
      const currentTrie = TrieManager.getOrCreate(trieNamespace);
      try {
        setIsLoading(true);
        const optionsResults = (await networkManager.fetchWithRetry(
          cacheKey,
          fetchFunction,
          retryConfig
        )) as any;

        if (optionsResults.categories || Array.isArray(optionsResults?.data?.categories)) {
          const cats = optionsResults.categories || optionsResults.data.categories;
          const normalizedCats: CategoryType[] = cats.map((cat: any) => ({
            category: cat.category || cat.name || cat.label,
            options: normalizeOptions(cat.options || cat.items || [])
          }));
          setOriginalFetchedCategories(normalizedCats);
          normalizedCats.forEach((cat) => {
            cat.options.forEach((item) => currentTrie.insert(item.label));
          });
        } else {
          const normalized = normalizeOptions(
            Array.isArray(optionsResults) ? optionsResults : optionsResults?.data || []
          );
          setOriginalFetchedOptions(normalized);
          normalized.forEach((item) => currentTrie.insert(item.label));
        }

        setRetryAttempt(0);
        setHasFetchedInitialData(true);
      } catch (exception) {
        setRetryAttempt((prev) => prev + 1);
        if (isOffline) {
          const cached = networkManager.cache.get(cacheKey) as any;
          if (cached?.categories) {
            const normalizedCached: CategoryType[] = cached.categories.map((cat: any) => ({
              category: cat.category,
              options: normalizeOptions(cat.options)
            }));
            setOriginalFetchedCategories(normalizedCached);
          } else if (cached?.length > 0) {
            const normalizedCached = normalizeOptions(cached);
            setOriginalFetchedOptions(normalizedCached);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }, [fetchFunction, retryConfig, networkManager, isOffline, retryAttempt, trieNamespace]);

    const renderHighlight = useCallback((optionLabel: string, query: string) => {
      if (!query) return <span>{optionLabel}</span>;
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = optionLabel.split(regex);
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

    const renderOptionIcon = useCallback((option: OptionType) => {
      if (option.image) {
        return <img src={option.image} alt="" className="option-image" />;
      }
      if (option.icon) {
        return <span className="option-icon">{option.icon}</span>;
      }
      return null;
    }, []);

    const isSelected = useCallback(
      (optionValue: string): boolean => {
        if (multiple && Array.isArray(currentValue)) {
          return currentValue.includes(optionValue);
        }
        return currentValue === optionValue;
      },
      [multiple, currentValue]
    );

    useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    useEffect(() => {
      if (!dropdownVisible) return;
      const handleClickOutside = (event: globalThis.MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setDropdownVisible(false);
          setSelectedOptionIndex(-1);
          setSearchText('');
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownVisible]);

    useEffect(() => {
      if (fetchFunction && !hasFetchedInitialData) fetchOptions();
    }, [fetchFunction, hasFetchedInitialData, fetchOptions]);

    useEffect(() => {
      if (!fetchFunction && !hasInitializedOptions.current) {
        hasInitializedOptions.current = true;
        const currentTrie = TrieManager.getOrCreate(trieNamespace);
        if (useCategories) {
          categories.forEach((cat) => {
            cat.options.forEach((item) => currentTrie.insert(item.label));
          });
        } else if (options.length > 0) {
          normalizeOptions(options).forEach((item) => currentTrie.insert(item.label));
        }
      }
    }, [options, categories, fetchFunction, trieNamespace, useCategories, normalizeOptions]);

    useEffect(() => {
      return () => {
        TrieManager.clear(trieNamespace);
      };
    }, [trieNamespace]);

    const noResultsItem = (
      <li role="option" className="dropdown-item no-results">
        {isLoading ? (
          <div className="loading-container">
            <LoaderCircle className="animate-spin" size={16} />
            <span>Loading...</span>
          </div>
        ) : (
          'No Results'
        )}
      </li>
    );

    const renderOptions = () => {
      // Category mode with no active search: show grouped list
      if (useCategories && !searchText.trim()) {
        if (filteredCategories.length === 0) return noResultsItem;

        let globalIndex = 0;
        return filteredCategories.map((category: CategoryType, catIndex: number) => (
          <React.Fragment key={`category-${catIndex}`}>
            <li className="dropdown-item category-header" role="presentation">
              {category.category}
            </li>
            {category.options.map((option: OptionType) => {
              const currentGlobalIndex = globalIndex++;
              return (
                <li
                  key={`${option.value}-${currentGlobalIndex}`}
                  role="option"
                  className={cn(
                    'dropdown-item',
                    currentGlobalIndex === selectedOptionIndex ? 'selected' : '',
                    isSelected(option.value) ? 'active' : '',
                    option.disabled ? 'disabled' : ''
                  )}
                  aria-selected={isSelected(option.value)}
                  aria-disabled={option.disabled}
                  onClick={() => !option.disabled && handleOptionSelect(option)}
                  onMouseEnter={() => setSelectedOptionIndex(currentGlobalIndex)}
                >
                  {renderOptionIcon(option)}
                  {renderHighlight(option.label, searchText)}
                </li>
              );
            })}
          </React.Fragment>
        ));
      }

      // Flat list: non-category mode, or category mode during search
      if (filteredOptions.length === 0) return noResultsItem;

      return filteredOptions.map((option: OptionType, index: number) => (
        <li
          key={`${option.value}-${index}`}
          role="option"
          className={cn(
            'dropdown-item',
            index === selectedOptionIndex ? 'selected' : '',
            isSelected(option.value) ? 'active' : '',
            option.disabled ? 'disabled' : ''
          )}
          aria-selected={isSelected(option.value)}
          aria-disabled={option.disabled}
          onClick={() => !option.disabled && handleOptionSelect(option)}
          onMouseEnter={() => setSelectedOptionIndex(index)}
        >
          {renderOptionIcon(option)}
          {renderHighlight(option.label, searchText)}
        </li>
      ));
    };

    return (
      <div ref={containerRef} className={cn('select-container', fullWidth ? 'full-width' : '')}>
        <div
          className={cn(
            'select-wrapper',
            shrink ? 'shrink' : '',
            error ? 'error' : '',
            isFocused ? 'focused' : '',
            disabled ? 'disabled' : '',
            hasValue || (dropdownVisible && searchText) ? 'has-value' : '',
            startAdornment ? 'has-left-icon' : '',
            endAdornment || clearable ? 'has-right-icon' : '',
            outlined ? 'outlined' : '',
            dropdownVisible ? 'dropdown-visible' : '',
            multiple ? 'multiple' : '',
            !dropdownVisible &&
              !multiple &&
              selectedOptions[0] &&
              (selectedOptions[0].icon || selectedOptions[0].image)
              ? 'has-selected-visual'
              : ''
          )}
        >
          {renderIcon(startAdornment, 'left')}
          {!dropdownVisible && !multiple && selectedOptions[0] && (
            <div className="selected-option-visual">{renderOptionIcon(selectedOptions[0])}</div>
          )}
          {/* Hidden input for React Hook Form */}
          <input
            ref={ref}
            type="hidden"
            name={name}
            value={multiple ? JSON.stringify(currentValue) : String(currentValue)}
            disabled={disabled}
          />
          {multiple ? (
            <div className="multiple-content">
              {selectedOptions.map((option) => (
                <div key={option.value} className="selected-tag">
                  <span className="selected-tag-label">{option.label}</span>
                  <div
                    className="selected-tag-remove"
                    onClick={(e) => handleRemoveTag(option.value, e)}
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${option.label}`}
                  >
                    <X size={10} />
                  </div>
                </div>
              ))}
              <input
                ref={inputRef}
                type="text"
                className={cn('select-input multiple-input', disabled ? 'disabled' : '', className)}
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyPress}
                onClick={handleSelectClick}
                disabled={disabled}
                placeholder={!hasValue && (!label || shrink || isFocused) ? placeholder : ''}
                readOnly={!searchable}
                role="combobox"
                aria-expanded={dropdownVisible}
                aria-haspopup="listbox"
                aria-controls={`${selectId}-listbox`}
                aria-labelledby={label ? `${selectId}-label` : undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  cn(
                    error ? `${selectId}-error` : undefined,
                    helperText ? `${selectId}-helper` : undefined
                  ).trim() || undefined
                }
                style={selectStyles}
              />
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              className={cn('select-input', disabled ? 'disabled' : '', className)}
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyPress}
              onClick={handleSelectClick}
              disabled={disabled}
              placeholder={
                dropdownVisible && searchable
                  ? 'Search...'
                  : !hasValue && !dropdownVisible && (!label || shrink || isFocused)
                    ? placeholder
                    : ''
              }
              readOnly={!searchable}
              role="combobox"
              aria-expanded={dropdownVisible}
              aria-haspopup="listbox"
              aria-controls={`${selectId}-listbox`}
              aria-labelledby={label ? `${selectId}-label` : undefined}
              aria-invalid={Boolean(error)}
              aria-describedby={
                cn(
                  error ? `${selectId}-error` : undefined,
                  helperText ? `${selectId}-helper` : undefined
                ).trim() || undefined
              }
              style={selectStyles}
            />
          )}
          {clearable && hasValue && (
            <div
              className="select-icon right clear-icon clickable"
              onClick={handleClear}
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as any);
                }
              }}
            >
              <X size={iconSize} />
            </div>
          )}
          {!clearable || !hasValue ? renderIcon(endAdornment, 'right') : null}
          <div className={cn('select-icon right chevron-icon', dropdownVisible ? 'open' : '')}>
            <ChevronDown size={iconSize} />
          </div>
          {label && (
            <label
              id={`${selectId}-label`}
              className="select-label"
              style={startAdornment ? { left: `${iconSize + 16}px` } : undefined}
            >
              {label}
            </label>
          )}
        </div>

        {error && (
          <div id={`${selectId}-error`} className="error-message" role="alert">
            {error}
          </div>
        )}

        {helperText && (
          <span id={`${selectId}-helper`} className="helper-text">
            {helperText}
          </span>
        )}

        {dropdownVisible && (
          <div className="dropdown-panel">
            <ul
              ref={dropdownListRef}
              className="dropdown-list"
              role="listbox"
              id={`${selectId}-listbox`}
              aria-label={`Options for ${label || 'select'}`}
              aria-multiselectable={multiple}
            >
              {renderOptions()}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default memo(Select);
