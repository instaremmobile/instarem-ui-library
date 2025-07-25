import React from "react";
import { LoaderCircle } from "lucide-react";
import isEmpty from "lodash/isEmpty";
import { cn, NetworkManager, Trie } from "@lib";
import { InputFieldProps, IconProps } from "./Input.types";
import "./input.scss";
import debounce from "lodash/debounce";

const trie = new Trie();

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
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
    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const [value, setValue] = React.useState(defaultValue);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
      React.useState<number>(-1);
    const [filteredSuggestions, setFilteredSuggestions] =
      React.useState<string[]>(suggestions);
    const [originalFetchedSuggestions, setOriginalFetchedSuggestions] =
      React.useState<string[]>([]);
    const [suggestionsVisible, setSuggestionsVisible] =
      React.useState<boolean>(false);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isOffline, setIsOffline] = React.useState<boolean>(
      !navigator.onLine,
    );
    const [retryAttempt, setRetryAttempt] = React.useState<number>(0);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const currentValue = controlledValue || value;
    const hasValue = !!currentValue;

    const networkManager = NetworkManager.getInstance();

    const handleOnIconClick = React.useCallback(
      (
        position: "left" | "right",
        iconProps: IconProps | undefined,
        event: React.MouseEvent<HTMLDivElement>,
      ) => {
        if (iconProps?.disabled) return;
        iconProps?.onClick?.(event);
        onIconClick?.(position, event);
      },
      [onIconClick],
    );

    const renderIcon = React.useCallback(
      (iconProps: IconProps | undefined, position: "left" | "right") => {
        if (isEmpty(iconProps) || !iconProps) return;

        const { icon, onClick, toolTip, disabled, className = "" } = iconProps;
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
            title={toolTip}
            role={onClick ? "button" : "presentation"}
            tabIndex={onClick && !disabled ? 0 : -1}
            aria-label={toolTip}
          >
            {React.cloneElement(icon, {
              size: iconSize,
              className: cn("icon", disabled ? "disabled" : ""),
            })}
          </div>
        );
      },
      [handleOnIconClick],
    );

    const getInputStyles = () => {
      const style: React.CSSProperties = {};
      if (startAdornment) {
        style.paddingLeft = `${iconSize + 20}px`;
      }

      if (endAdornment || (clearable && currentValue)) {
        style.paddingRight = `${iconSize + 16}px`;
      }

      return style;
    };

    const handleFilterSuggestions = debounce((newValue: string) => {
      if (newValue) {
        const newSuggestions = trie.search(newValue, {
          maxDistance: 4,
          matchType: "partial",
        });
        setFilteredSuggestions(newSuggestions);
      } else {
        if (suggestions.length > 0 && !fetchFunction) {
          setFilteredSuggestions(suggestions);
        } else {
          setFilteredSuggestions(originalFetchedSuggestions);
        }
      }
    }, 300);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions || !isSearchable) return;
      switch (event.key) {
        case "ArrowUp": {
          event.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        }

        case "Escape": {
          setSuggestionsVisible(false);
          setSelectedSuggestionIndex(-1);
          break;
        }
        case "Enter": {
          setValue(filteredSuggestions[selectedSuggestionIndex]);
          setSuggestionsVisible(false);
          break;
        }
      }
    };

    const handleSuggestionSelect = (selectedSuggestion: string) => {
      setValue(selectedSuggestion);
      handleChange?.(selectedSuggestion);
      inputRef?.current?.focus();
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSuggestionsVisible(true);
      setValue(event.target.value);
      handleFilterSuggestions(event.target.value);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        setIsFocused(false);
        onBlur?.(event);
        setSuggestionsVisible(false);
      }, 200);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
      setSuggestionsVisible(true);
    };

    const fetchSuggestions = React.useCallback(async () => {
      if (!fetchFunction) return;
      if (retryAttempt > retryConfig.maxAttempt!) return;
      const cacheKey = `suggestions-${value}`;
      try {
        setIsLoading(true);
        const suggestionsResults = (await networkManager.fetchWithRetry(
          cacheKey,
          fetchFunction!,
          retryConfig,
        )) as string[];
        setFilteredSuggestions(suggestionsResults);
        setOriginalFetchedSuggestions(suggestionsResults);
        suggestionsResults.forEach((word) => trie.insert(word));
      } catch (exception) {
        console.error("Error fetching suggestions with error", exception);
        setRetryAttempt((prev) => prev + 1);
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
    }, []);

    const renderSuggestions = (suggestion: string, query: string) => {
      if (!query) return suggestion;
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\\s]/g, "\\$&");
      const regex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = suggestion.split(regex);
      return parts.map((part, index) => {
        console.log(part);
        if (index % 2 === 1) {
          return (
            <span className="highlight" key={index}>
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      });
    };

    const focusOnInput = (event: KeyboardEvent) => {
      if (event.key === "/") {
        // This is to prevent "/" character to get typed in
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    React.useEffect(() => {
      window.addEventListener("keydown", focusOnInput);
      return () => window.removeEventListener("keydown", focusOnInput);
    }, []);

    React.useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      if (fetchFunction) {
        fetchSuggestions();
      }
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        handleFilterSuggestions.cancel();
      };
    }, [isOffline]);

    React.useEffect(() => {
      if (suggestions.length > 0) {
        suggestions.forEach((word) => trie.insert(word));
      }
    }, [suggestions.length]);
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
            id={id}
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
            style={getInputStyles()}
            onKeyDown={handleKeyPress}
          />
          {renderIcon(endAdornment, "right")}
          <label
            htmlFor={id}
            className={cn("text-field-label")}
            style={startAdornment ? { left: `${iconSize + 16}px` } : undefined}
          >
            {label}
          </label>
        </div>
        {error ? (
          <div id={`${id}-error`} className="error-message">
            {error}
          </div>
        ) : null}
        {helperText ? <span className="helper-text">{helperText}</span> : null}
        {isSearchable && suggestionsVisible ? (
          <ul
            className="suggestions-list"
            role="listbox"
            aria-label={`Suggestions for ${label}`}
          >
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <li
                  aria-selected={index === selectedSuggestionIndex}
                  key={suggestion + index + Math.random() * 1000}
                  role="option"
                  className={cn(
                    "suggestion-item",
                    index === selectedSuggestionIndex ? "selected" : "",
                  )}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {renderSuggestions(suggestion, currentValue as string)}
                </li>
              ))
            ) : (
              <li role="option" className="suggestion-item">
                {isLoading ? <LoaderCircle /> : "No Results"}
              </li>
            )}
          </ul>
        ) : null}
      </div>
    );
  },
);

InputField.displayName = "Input";
const Input = React.memo(InputField);
export default Input;
