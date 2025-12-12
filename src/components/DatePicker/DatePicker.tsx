import React, { forwardRef, memo, useId, useState } from 'react';
import { DatePicker as MUIDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { cn } from '../../lib/utils';
import type { DatePickerProps } from './DatePicker.types';
import './date-picker.scss';

const DatePickerComponent = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      value = null,
      placeholder,
      onChange,
      disabled,
      helperText,
      error,
      fullWidth,
      className = '',
      outlined = true,
      minDate,
      maxDate,
      format = 'dd/MM/yyyy',
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || useId();
    const [open, setOpen] = useState(false);

    return (
      <div className={cn('date-picker', fullWidth ? 'full-width' : '', className)}>
        {label && (
          <label htmlFor={inputId} className="date-picker__label">
            {label}
          </label>
        )}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MUIDatePicker
            value={value}
            onChange={(newValue) => {
              onChange?.(newValue);
              setOpen(false);
            }}
            minDate={minDate}
            maxDate={maxDate}
            format={format}
            disabled={disabled}
            open={open}
            onClose={() => setOpen(false)}
            slotProps={{
              textField: {
                id: inputId,
                variant: outlined ? 'outlined' : 'standard',
                error: Boolean(error),
                helperText: error ? error : helperText,
                onClick: () => setOpen(true),
                fullWidth: true,
                className: 'date-picker__input',
                inputProps: { readOnly: true },
                placeholder
              }
            }}
          />
        </LocalizationProvider>
      </div>
    );
  }
);

DatePickerComponent.displayName = 'DatePicker';
const DatePicker = memo(DatePickerComponent);
export default DatePicker;
export { DatePicker };
