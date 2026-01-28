import React, {
  useState,
  useCallback,
  useRef,
  forwardRef,
  memo,
  useId,
  FocusEvent,
  ChangeEvent,
} from "react";
import { cn } from "@lib";
import { TextAreaProps } from "./TextArea.types";
import "./textarea.scss";

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className = "",
      label,
      error,
      helperText,
      disabled,
      id,
      value: controlledValue,
      defaultValue = "",
      handleChange,
      fullWidth = false,
      onBlur,
      onFocus,
      resize = "none",
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputId = id || useId();

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const hasValue = Boolean(value);

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        if (!isControlled) setInternalValue(newValue);
        handleChange?.(newValue);
      },
      [isControlled, handleChange],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    return (
      <div
        className={cn(
          "textarea-container",
          fullWidth && "full-width",
          error && "error",
          disabled && "disabled",
        )}
      >
        <div
          className={cn(
            "textarea-wrapper",
            isFocused && "focused",
            hasValue && "has-value",
          )}
        >
          <textarea
            {...props}
            id={inputId}
            ref={ref || textareaRef}
            className={cn("textarea-input", className)}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            style={{ resize }}
          />

          {label && (
            <label htmlFor={inputId} className="textarea-label">
              {label}
            </label>
          )}
        </div>

        {error && (
          <div className="textarea-error" role="alert">
            {error}
          </div>
        )}

        {helperText && <div className="textarea-helper">{helperText}</div>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
export default memo(TextArea);
