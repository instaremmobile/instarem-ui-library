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
import { ChevronDown, LoaderCircle, X, Check } from 'lucide-react';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
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
    const [filteredOptions, setFilteredOptions] = useState<OptionType[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>([]);
    const [originalFetchedOptions, setOriginalFetchedOptions] = useState<OptionType[]>([]);
    const [originalFetchedCategories, setOriginalFetchedCategories] = useState<CategoryType[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
    const [retryAttempt, setRetryAttempt] = useState<number>(0);
    const [hasFetchedInitialData, setHasFetchedInitialData] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');

    const selectRef = useRef<HTMLDivElement>(null);
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
      if (multiple && Array.isArray(currentValue)) {
        return currentValue.length > 0 ? `${currentValue.length} selected` : '';
      }
      return selectedOptions[0]?.label ?? '';
    }, [dropdownVisible, searchable, searchText, multiple, currentValue, selectedOptions]);

    const getFlattenedOptions = useCallback((cats: CategoryType[]): OptionType[] => {
      return cats.flatMap((cat) => cat.options);
    }, []);

    const handleFilterOptions = useMemo(() => {
      return debounce((query: string) => {
        const currentTrie = TrieManager.getOrCreate(trieNamespace);
        if (useCategories) {
          const allCats =
            originalFetchedCategories.length > 0 ? originalFetchedCategories : categories;
          if (query.trim()) {
            const q = query.toLowerCase().trim();
            const searchResults = currentTrie.search(query.trim(), {
              maxDistance: 4,
              matchType: 'partial'
            });

            // Collect all matching options with their scores
            const allMatchedOptions: Array<{
              option: OptionType;
              category: string;
              score: number;
            }> = [];

            allCats.forEach((cat) => {
              cat.options.forEach((opt) => {
                let score = 0;
                const labelLower = opt.label.toLowerCase();
                const valueLower = opt.value.toLowerCase();

                // Exact match gets highest score
                if (labelLower === q || valueLower === q) {
                  score = 100;
                }
                // Starts with query gets high score
                else if (labelLower.startsWith(q) || valueLower.startsWith(q)) {
                  score = 80;
                }
                // Trie match gets medium-high score
                else if (
                  searchResults.some(
                    (resultLabel) =>
                      opt.label === resultLabel ||
                      labelLower === resultLabel.toLowerCase() ||
                      labelLower.includes(resultLabel.toLowerCase()) ||
                      resultLabel.toLowerCase().includes(labelLower)
                  )
                ) {
                  score = 60;
                }
                // Contains query gets medium score
                else if (labelLower.includes(q) || valueLower.includes(q)) {
                  score = 40;
                }

                if (score > 0) {
                  allMatchedOptions.push({ option: opt, category: cat.category, score });
                }
              });
            });

            // Sort by score descending
            allMatchedOptions.sort((a, b) => b.score - a.score);

            // During search, show flat sorted list without category headers
            // This ensures best matches appear at the top
            const flatSortedOptions = allMatchedOptions.map(({ option }) => option);
            setFilteredOptions(flatSortedOptions);
            setFilteredCategories([]);
          } else {
            setFilteredCategories(allCats);
            setFilteredOptions([]);
          }
        } else {
          const allOpts =
            originalFetchedOptions.length > 0 ? originalFetchedOptions : normalizeOptions(options);
          if (query.trim()) {
            const searchResults = currentTrie.search(query.trim(), {
              maxDistance: 4,
              matchType: 'partial'
            });
            const matched: OptionType[] = [];
            if (searchResults.length > 0) {
              searchResults.forEach((resultLabel) => {
                const hit = allOpts.find(
                  (item) =>
                    item.label === resultLabel ||
                    item.label.toLowerCase() === resultLabel.toLowerCase() ||
                    item.label.toLowerCase().includes(resultLabel.toLowerCase()) ||
                    resultLabel.toLowerCase().includes(item.label.toLowerCase())
                );
                if (hit && !matched.find((o) => o.value === hit.value)) matched.push(hit);
              });
            }
            if (matched.length === 0) {
              const q = query.toLowerCase().trim();
              setFilteredOptions(
                allOpts.filter(
                  (i) => i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)
                )
              );
            } else {
              setFilteredOptions(matched);
            }
          } else {
            setFilteredOptions(allOpts);
          }
        }
      }, 300);
    }, [
      useCategories,
      originalFetchedCategories,
      originalFetchedOptions,
      categories,
      options,
      trieNamespace
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

    const handleKeyPress = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement | HTMLInputElement>) => {
        const allOpts = useCategories ? getFlattenedOptions(filteredCategories) : filteredOptions;

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
            if (dropdownVisible && selectedOptionIndex >= 0 && allOpts[selectedOptionIndex]) {
              event.preventDefault();
              handleOptionSelect(allOpts[selectedOptionIndex]);
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
          if (!multiple) {
            setDropdownVisible(false);
          }
          setSelectedOptionIndex(-1);
          setSearchText('');
          onBlur?.(event as FocusEvent<HTMLDivElement>);
        }, 150);
      },
      [onBlur, multiple]
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
        const query = event.target.value;
        setSearchText(query);
        setDropdownVisible(true);
        handleFilterOptions(query);
        setSelectedOptionIndex(-1);
      },
      [searchable, handleFilterOptions]
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
          setFilteredCategories(normalizedCats);
          normalizedCats.forEach((cat) => {
            cat.options.forEach((item) => currentTrie.insert(item.label));
          });
        } else {
          const normalized = normalizeOptions(
            Array.isArray(optionsResults) ? optionsResults : optionsResults?.data || []
          );
          setOriginalFetchedOptions(normalized);
          setFilteredOptions(normalized);
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
            setFilteredCategories(normalizedCached);
          } else if (cached?.length > 0) {
            const normalizedCached = normalizeOptions(cached);
            setOriginalFetchedOptions(normalizedCached);
            setFilteredOptions(normalizedCached);
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
        handleFilterOptions.cancel();
      };
    }, [handleFilterOptions]);

    useEffect(() => {
      if (fetchFunction && !hasFetchedInitialData) fetchOptions();
    }, [fetchFunction, hasFetchedInitialData, fetchOptions]);

    useEffect(() => {
      if (!fetchFunction && !hasInitializedOptions.current) {
        hasInitializedOptions.current = true;
        if (useCategories) {
          const currentTrie = TrieManager.getOrCreate(trieNamespace);
          categories.forEach((cat) => {
            cat.options.forEach((item) => currentTrie.insert(item.label));
          });
          setFilteredCategories(categories);
        } else if (options.length > 0) {
          const currentTrie = TrieManager.getOrCreate(trieNamespace);
          const normalized = normalizeOptions(options);
          normalized.forEach((item) => currentTrie.insert(item.label));
          setFilteredOptions(normalized);
        }
      }
    }, [options, categories, fetchFunction, trieNamespace, useCategories]);

    useEffect(() => {
      return () => {
        TrieManager.clear(trieNamespace);
      };
    }, [trieNamespace]);

    const renderOptions = () => {
      if (useCategories) {
        if (filteredCategories.length === 0) {
          return (
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
        }

        let globalIndex = 0;
        return filteredCategories.map((category, catIndex) => (
          <React.Fragment key={`category-${catIndex}`}>
            <li className="dropdown-item category-header" role="presentation">
              {category.category}
            </li>
            {category.options.map((option) => {
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
                  {multiple && (
                    <div className="checkbox-indicator">
                      {isSelected(option.value) && <Check size={14} />}
                    </div>
                  )}
                  {renderOptionIcon(option)}
                  {renderHighlight(option.label, searchText)}
                </li>
              );
            })}
          </React.Fragment>
        ));
      }

      if (filteredOptions.length === 0) {
        return (
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
      }

      return filteredOptions.map((option, index) => (
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
          {multiple && (
            <div className="checkbox-indicator">
              {isSelected(option.value) && <Check size={14} />}
            </div>
          )}
          {renderOptionIcon(option)}
          {renderHighlight(option.label, searchText)}
        </li>
      ));
    };

    return (
      <div className={cn('select-container', fullWidth ? 'full-width' : '')}>
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
