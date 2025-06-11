import React from "react";
import { cn } from "@lib";
import "./toggle-styles.scss";

interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange?: (value: boolean) => any;
  checked?: boolean;
  labelPosition?: "left" | "right";
}

export const ToggleComponent = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      id,
      className,
      onChange,
      labelPosition = "right",
      checked,
      label,
      name,
      ...props
    },
    ref,
  ) => {
    const toggleId = id || `${name}-${label}-toggle`;
    return (
      <label htmlFor={toggleId} className="toggle-switch__container">
        {label && labelPosition === "left" ? (
          <label className="toggle-switch__label" htmlFor={toggleId}>
            {label}
          </label>
        ) : null}
        <div className="toggle-switch__container">
          <input
            {...props}
            id={toggleId}
            ref={ref}
            type="checkbox"
            className={cn("toggle-switch__input", className)}
            checked={checked}
            name={name}
            onChange={(event) => onChange?.(event.target.checked)}
          />
          <div className="toggle-switch__track">
            <div className="toggle-switch__thumb"></div>
          </div>
        </div>
        {label && labelPosition === "right" ? (
          <label className="toggle-switch__label" htmlFor={toggleId}>
            {label}
          </label>
        ) : null}
      </label>
    );
  },
);

ToggleComponent.displayName = "Toggle";
const Toggle = React.memo(ToggleComponent);
export { Toggle };
