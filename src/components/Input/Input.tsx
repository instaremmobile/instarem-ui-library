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
  ChangeEvent,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
} from "react";
import { LoaderCircle } from "lucide-react";
import isEmpty from "lodash/isEmpty";
import debounce from "lodash/debounce";
import { cn, NetworkManager, Trie } from "@lib";
import { InputFieldProps, IconProps } from "./Input.types";
import "./input.scss";

const globalTrie = new Trie();

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className = "",
      helperText,
      type = "text",
      label,
      error,
      shrink,
      value: controlledValue,
      startAdornment,
      endAdornment,
      disabled,
      id,
      defaultValue = "",
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
      outlined = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
      useState<number>(-1);
    const [filteredSuggestions, setFilteredSuggestions] =
      useState<string[]>(suggestions);
    const [originalFetchedSuggestions, setOriginalFetchedSuggestions] =
      useState<string[]>([]);
    const [suggestionsVisible, setSuggestionsVisible] =
      useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
    const [retryAttempt, setRetryAttempt] = useState<number>(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionListRef = useRef<HTMLUListElement>(null);

    const currentValue =
      controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = Boolean(currentValue);
    const isControlled = controlledValue !== undefined;

    const networkManager = useMemo(() => NetworkManager.getInstance(), []);

    const handleOnIconClick = useCallback(
      (
        position: "left" | "right",
        iconProps: IconProps | undefined,
        event: MouseEvent<HTMLDivElement>,
      ) => {
        if (iconProps?.disabled) return;
        iconProps?.onClick?.(event);
        onIconClick?.(position, event);
      },
      [onIconClick],
    );

    const renderIcon = useCallback(
      (iconProps: IconProps | undefined, position: "left" | "right") => {
        if (isEmpty(iconProps) || !iconProps) return null;

        const { icon, onClick, toolTip, disabled, className = "" } = iconProps;

        const handleKeyDown = (e: ReactKeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOnIconClick(position, iconProps, e as any);
          }
        };

        return (
          <div
            className={cn(
              "text-field-icon",
              position,
              disabled ? "disabled" : "",
              className,
              onClick ? "clickable" : "",
            )}
            onClick={(e) => handleOnIconClick(position, iconProps, e)}
            onKeyDown={handleKeyDown}
            title={toolTip}
            role={onClick ? "button" : "presentation"}
            tabIndex={onClick && !disabled ? 0 : -1}
            aria-label={toolTip}
          >
            {cloneElement(icon, {
              size: iconSize,
              className: cn("icon", disabled ? "disabled" : ""),
            })}
          </div>
        );
      },
      [handleOnIconClick, iconSize],
    );

    const inputStyles = useMemo(() => {
      const style: CSSProperties = {};
      if (startAdornment) {
        style.paddingLeft = `${iconSize + 20}px`;
      }
      if (endAdornment || (clearable && currentValue)) {
        style.paddingRight = `${iconSize + 16}px`;
      }
      return style;
    }, [startAdornment, endAdornment, clearable, currentValue, iconSize]);

    const handleFilterSuggestions = useMemo(
      () =>
        debounce((newValue: string) => {
          if (newValue) {
            const newSuggestions = globalTrie.search(newValue, {
              maxDistance: 4,
              matchType: "partial",
            });
            setFilteredSuggestions(newSuggestions);
          } else {
            const fallbackSuggestions =
              suggestions.length > 0 && !fetchFunction
                ? suggestions
                : originalFetchedSuggestions;
            setFilteredSuggestions(fallbackSuggestions);
          }
        }, 300),
      [suggestions, fetchFunction, originalFetchedSuggestions],
    );

    const handleKeyPress = useCallback(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (!isSearchable || !suggestionsVisible) return;

        switch (event.key) {
          case "ArrowUp": {
            event.preventDefault();
            setSelectedSuggestionIndex((prev) => {
              const newIndex =
                prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
              // Scroll into view
              setTimeout(() => {
                const selectedItem = suggestionListRef.current?.children[
                  newIndex
                ] as HTMLElement;
                selectedItem?.scrollIntoView({ block: "nearest" });
              }, 0);
              return newIndex;
            });
            break;
          }
          case "ArrowDown": {
            event.preventDefault();
            setSelectedSuggestionIndex((prev) => {
              const newIndex =
                prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
              // Scroll into view
              setTimeout(() => {
                const selectedItem = suggestionListRef.current?.children[
                  newIndex
                ] as HTMLElement;
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
            if (
              selectedSuggestionIndex >= 0 &&
              filteredSuggestions[selectedSuggestionIndex]
            ) {
              handleSuggestionSelect(
                filteredSuggestions[selectedSuggestionIndex],
              );
            }
            break;
          }
          case "Tab": {
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
      ],
    );

    const handleSuggestionSelect = useCallback(
      (selectedSuggestion: string) => {
        const newValue = selectedSuggestion;

        if (!isControlled) {
          setInternalValue(newValue);
        }

        handleChange?.(newValue);
        setSuggestionsVisible(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.focus();
      },
      [isControlled, handleChange],
    );

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
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
      },
      [isControlled, isSearchable, handleFilterSuggestions, handleChange],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
          setIsFocused(false);
          setSuggestionsVisible(false);
          setSelectedSuggestionIndex(-1);
          onBlur?.(event);
        }, 150);
      },
      [onBlur],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(event);

        if (isSearchable && (filteredSuggestions.length > 0 || isLoading)) {
          setSuggestionsVisible(true);
        }
      },
      [onFocus, isSearchable, filteredSuggestions.length, isLoading],
    );

    // Fetch suggestions function
    const fetchSuggestions = useCallback(async () => {
      if (!fetchFunction || retryAttempt > retryConfig.maxAttempt!) return;

      const cacheKey = `suggestions-${currentValue}`;

      try {
        setIsLoading(true);
        const suggestionsResults = (await networkManager.fetchWithRetry(
          cacheKey,
          fetchFunction,
          retryConfig,
        )) as string[];

        setFilteredSuggestions(suggestionsResults);
        setOriginalFetchedSuggestions(suggestionsResults);
        setRetryAttempt(0); // Reset retry attempt on success

        suggestionsResults.forEach((word) => globalTrie.insert(word));
      } catch (exception) {
        console.error("Error fetching suggestions:", exception);
        setRetryAttempt((prev) => prev + 1);

        // Try to use cached suggestions when offline
        if (isOffline) {
          const cachedSuggestions = networkManager.cache.get(
            cacheKey,
          ) as string[];
          if (cachedSuggestions?.length > 0) {
            setFilteredSuggestions(cachedSuggestions);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }, [
      fetchFunction,
      retryAttempt,
      retryConfig,
      currentValue,
      networkManager,
      isOffline,
    ]);

    // Render highlighted suggestions
    const renderSuggestions = useCallback(
      (suggestion: string, query: string) => {
        if (!query) return <span>{suggestion}</span>;

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedQuery})`, "gi");
        const parts = suggestion.split(regex);

        return (
          <span>
            {parts.map((part, index) => {
              const isHighlighted = index % 2 === 1;
              return isHighlighted ? (
                <span className="highlight" key={index}>
                  {part}
                </span>
              ) : (
                <span key={index}>{part}</span>
              );
            })}
          </span>
        );
      },
      [],
    );

    useEffect(() => {
      const focusOnInput = (event: KeyboardEvent) => {
        if (event.key === "/" && !isFocused) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      };

      window.addEventListener("keydown", focusOnInput);
      return () => window.removeEventListener("keydown", focusOnInput);
    }, [isFocused]);

    useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        handleFilterSuggestions.cancel();
      };
    }, [handleFilterSuggestions]);

    useEffect(() => {
      if (fetchFunction) {
        fetchSuggestions();
      }
    }, [fetchSuggestions]);

    useEffect(() => {
      if (suggestions.length > 0) {
        suggestions.forEach((word) => globalTrie.insert(word));
        setFilteredSuggestions(suggestions);
      }
    }, [suggestions]);

    const inputId = id || useId();
    return (
      <div
        className={cn("text-field-container", fullWidth ? "full-width" : "")}
      >
        <div
          className={cn(
            "input-field-wrapper",
            shrink ? "shrink" : "",
            error ? "error" : "",
            isFocused ? "focused" : "",
            disabled ? "disabled" : "",
            hasValue ? "has-value" : "",
            startAdornment ? "has-left-icon" : "",
            endAdornment || clearable ? "has-right-icon" : "",
            outlined ? "outlined" : "",
          )}
        >
          {renderIcon(startAdornment, "left")}
          <input
            {...props}
            id={inputId}
            ref={ref || inputRef}
            className={cn(
              "text-field-input",
              disabled ? "disabled" : "",
              className,
            )}
            type={type}
            value={currentValue}
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
                helperText ? `${inputId}-helper` : undefined,
              ).trim() || undefined
            }
            aria-expanded={isSearchable ? suggestionsVisible : undefined}
            aria-haspopup={isSearchable ? "listbox" : undefined}
            aria-autocomplete={isSearchable ? "list" : undefined}
            role={isSearchable ? "combobox" : undefined}
          />
          {renderIcon(endAdornment, "right")}
          {label && (
            <label
              htmlFor={inputId}
              className="text-field-label"
              style={
                startAdornment ? { left: `${iconSize + 16}px` } : undefined
              }
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
            aria-label={`Suggestions for ${label || "input"}`}
          >
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion}-${index}`}
                  role="option"
                  className={cn(
                    "suggestion-item",
                    index === selectedSuggestionIndex ? "selected" : "",
                  )}
                  aria-selected={index === selectedSuggestionIndex}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {renderSuggestions(suggestion, currentValue as string)}
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
                  "No Results"
                )}
              </li>
            )}
          </ul>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default memo(InputField);
