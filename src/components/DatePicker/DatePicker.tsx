import React, { forwardRef, memo, useId, useState } from 'react';
import { MobileDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
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
      name,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const [tempValue, setTempValue] = useState<Date | null>(value);

    const handleOpen = () => {
      setTempValue(value);
      setOpen(true);
    };

    const handleClose = () => {
      setTempValue(value);
      setOpen(false);
    };

    const handleAccept = (newValue: Date | null) => {
      onChange?.(newValue);
      setOpen(false);
    };

    return (
      <div className={cn('date-picker', fullWidth ? 'full-width' : '', className)}>
        {label && (
          <label htmlFor={inputId} className="date-picker__label">
            {label}
          </label>
        )}
        {/* Hidden input for React Hook Form */}
        <input
          ref={ref}
          type="hidden"
          name={name}
          value={value ? value.toISOString() : ''}
          disabled={disabled}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MobileDatePicker
            value={open ? tempValue : value}
            onChange={(newValue) => setTempValue(newValue)}
            onAccept={handleAccept}
            minDate={minDate}
            maxDate={maxDate}
            format={format}
            disabled={disabled}
            open={open}
            onClose={handleClose}
            slotProps={{
              textField: {
                id: inputId,
                variant: outlined ? 'outlined' : 'standard',
                error: Boolean(error),
                helperText: error ? error : helperText,
                onClick: handleOpen,
                fullWidth: true,
                className: 'date-picker__input',
                inputProps: { readOnly: true },
                placeholder
              },
              actionBar: {
                actions: ['cancel', 'accept']
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
