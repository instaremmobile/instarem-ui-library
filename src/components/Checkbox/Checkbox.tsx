import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";
import { CheckboxProps } from "./Checkbox.types";
import "./checkbox-styles.scss";
import { cn } from "@lib";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      checked = false,
      disabled = false,
      indeterminate = false,
      onChange,
      className = "",
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      required = false,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange && !disabled) {
        onChange(event.target.checked);
      }
    };

    const containerClasses = cn(
      "checkbox-container",
      disabled ? "disabled" : "",
      className,
    );
    const labelClasses = cn("checkbox-label", disabled ? "disabled" : "");

    return (
      <label className={containerClasses} htmlFor={id}>
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          className="checkbox-input"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          required={required}
        />
        <span className="checkbox-custom" aria-hidden="true" />
        <span className={labelClasses}>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
