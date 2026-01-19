import type React from 'react';
export interface DatePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  outlined?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}
