import React, { useId, memo, forwardRef } from 'react';
import { cn } from '@lib';
import { ToggleProps } from './Toggle.types';
import './toggle-styles.scss';

export const ToggleComponent = forwardRef<HTMLInputElement, ToggleProps>(
  (
    { id, className, onChange, labelPosition = 'right', checked = false, label, name, ...props },
    ref
  ) => {
    const generatedId = useId();
    const toggleId = id ?? generatedId;
    return (
      <label htmlFor={toggleId} className="toggle-switch__container">
        {label && labelPosition === 'left' ? (
          <span className="toggle-switch__label">{label}</span>
        ) : null}
        <div className="toggle-switch__control">
          <input
            {...props}
            id={toggleId}
            ref={ref}
            type="checkbox"
            className={cn('toggle-switch__input', className)}
            checked={checked}
            name={name}
            onChange={(event) => onChange?.(event.target.checked)}
          />
          <div className="toggle-switch__track">
            <div className="toggle-switch__thumb"></div>
          </div>
        </div>
        {label && labelPosition === 'right' ? (
          <span className="toggle-switch__label">{label}</span>
        ) : null}
      </label>
    );
  }
);

ToggleComponent.displayName = 'Toggle';
const Toggle = memo(ToggleComponent);
export { Toggle };
