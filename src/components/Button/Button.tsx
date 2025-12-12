import React from 'react';
import { cn } from '@lib';
import { ButtonProps } from './Button.types';
import './button-styles.scss';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      className = '',
      startIcon,
      endIcon,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const baseClass = 'btn';
    const variantClass = `${baseClass}--${variant}`;
    const sizeClass = `${baseClass}--${size}`;
    const loadingClass = isLoading ? `${baseClass}--loading` : '';
    const fullWidthClass = fullWidth ? `${baseClass}--full-width` : '';

    const combinedClassName = cn(
      baseClass,
      variantClass,
      sizeClass,
      loadingClass,
      fullWidthClass,
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClassName}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading && (
          <span className="btn__spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="btn__spinner-icon">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
          </span>
        )}
        {startIcon && !isLoading && (
          <span className="btn__icon btn__icon--start" aria-hidden="true">
            {startIcon}
          </span>
        )}
        <span className={`btn__text ${isLoading ? 'btn__text--loading' : ''}`}>{children}</span>
        {endIcon && !isLoading && (
          <span className="btn__icon btn__icon--end" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
