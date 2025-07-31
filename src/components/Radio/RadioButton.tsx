import React from "react";
import { cn } from "@lib";
import { RadioButtonProps } from "./RadioButton.types";
import "./radio-button.scss";

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
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle arrow key navigation within radio groups
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();

        const radioGroup = document.querySelectorAll(`input[name="${name}"]`);
        const radioArray = Array.from(radioGroup) as HTMLInputElement[];
        const currentIndex = radioArray.findIndex(
          (radio) => radio === event.target,
        );

        let nextIndex;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : radioArray.length - 1;
        } else {
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
          onKeyDown={handleKeyDown}
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
