import React from "react";
import { cn } from "@lib";
import "./radio-button.scss";

export interface RadioButtonProps {
  value: string;
  name: string;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "success" | "danger";
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
  "aria-describedby"?: string;
  // additional props
  [key: string]: any;
}

const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      name,
      value,
      checked = false,
      disabled = false,
      label,
      className = "",
      size = "medium",
      variant = "primary",
      onChange,
      onFocus,
      onBlur,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const inputId = `radio-${id}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onChange) {
        onChange(e);
      }
    };

    return (
      <div
        className={cn(
          "radio-button",
          `radio-button--${size}`,
          `radio-button--${variant}`,
          disabled ? "radio-button--disabled" : "",
          checked ? "radio-button--checked" : "",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="radio-button__input"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        <label htmlFor={inputId} className="radio-button__label">
          <span className="radio-button__control">
            <span className="radio-button__indicator"></span>
          </span>
          {label && <span className="radio-button__text">{label}</span>}
        </label>
      </div>
    );
  },
);

RadioButton.displayName = "RadioButton";
export default RadioButton;
