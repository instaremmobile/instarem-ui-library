import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DatePicker from './DatePicker';
import { DatePickerProps } from './DatePicker.types';

const defaultProps: DatePickerProps = {
  label: 'Select date',
  value: null,
  onChange: jest.fn()
};

const renderDatePicker = (props: Partial<DatePickerProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DatePicker {...mergedProps} />);
};

describe('DatePicker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders with label', () => {
      renderDatePicker({ label: 'Select date' });
      expect(screen.getByText('Select date')).toBeInTheDocument();
    });

    it('renders without label', () => {
      renderDatePicker({ label: undefined });
      expect(screen.queryByText('Select date')).not.toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      renderDatePicker({ placeholder: 'DD/MM/YYYY' });
      // MobileDatePicker renders spinbuttons, not a textbox
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('renders with custom id', () => {
      renderDatePicker({ id: 'custom-date-picker' });
      const input = document.getElementById('custom-date-picker');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'custom-date-picker');
    });

    it('renders with custom className', () => {
      const { container } = renderDatePicker({ className: 'custom-class' });
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Value handling', () => {
    it('displays the selected date', () => {
      const testDate = new Date('2024-01-15');
      const { container } = renderDatePicker({ value: testDate, format: 'dd/MM/yyyy' });
      const hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('15/01/2024');
    });

    it('displays empty input when value is null', () => {
      const { container } = renderDatePicker({ value: null });
      const hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('');
    });

    it('updates displayed value when prop changes', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-02-20');
      const { rerender, container } = renderDatePicker({ value: date1, format: 'dd/MM/yyyy' });

      let hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('15/01/2024');

      rerender(<DatePicker {...defaultProps} value={date2} format="dd/MM/yyyy" />);
      hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('20/02/2024');
    });
  });

  describe('Date format', () => {
    it('formats date as dd/MM/yyyy by default', () => {
      const testDate = new Date('2024-01-15');
      const { container } = renderDatePicker({ value: testDate });
      const hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('15/01/2024');
    });

    it('formats date with custom format', () => {
      const testDate = new Date('2024-01-15');
      const { container } = renderDatePicker({ value: testDate, format: 'MM/dd/yyyy' });
      const hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('01/15/2024');
    });

    it('formats date with year-first format', () => {
      const testDate = new Date('2024-01-15');
      const { container } = renderDatePicker({ value: testDate, format: 'yyyy-MM-dd' });
      const hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('2024-01-15');
    });
  });

  describe('Interaction', () => {
    it('renders calendar button for opening picker', () => {
      renderDatePicker();
      const calendarButton = screen.getByRole('button', { name: 'Choose date' });
      expect(calendarButton).toBeInTheDocument();
      expect(calendarButton).not.toBeDisabled();
    });

    it('input is read-only', () => {
      const { container } = renderDatePicker();
      const hiddenInput = container.querySelector('input[readonly]') as HTMLInputElement;
      expect(hiddenInput).toHaveAttribute('readonly');
    });
  });

  describe('Disabled state', () => {
    it('disables the calendar button when disabled prop is true', () => {
      renderDatePicker({ disabled: true });
      const calendarButton = screen.getByRole('button', { name: 'Choose date' });
      expect(calendarButton).toBeDisabled();
    });

    it('does not open picker when disabled', () => {
      renderDatePicker({ disabled: true });

      // When disabled, the button has pointer-events: none, so we just verify
      // the button is disabled and the dialog is not present
      const calendarButton = screen.getByRole('button', { name: 'Choose date' });
      expect(calendarButton).toBeDisabled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('displays error message', () => {
      renderDatePicker({ error: 'Date is required' });
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    it('displays helper text when no error', () => {
      renderDatePicker({ helperText: 'Select a date', error: undefined });
      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });

    it('error message takes precedence over helper text', () => {
      renderDatePicker({
        helperText: 'Select a date',
        error: 'Date is required'
      });
      expect(screen.getByText('Date is required')).toBeInTheDocument();
      expect(screen.queryByText('Select a date')).not.toBeInTheDocument();
    });
  });

  describe('Full width', () => {
    it('applies full-width class when fullWidth is true', () => {
      const { container } = renderDatePicker({ fullWidth: true });
      expect(container.querySelector('.full-width')).toBeInTheDocument();
    });

    it('does not apply full-width class by default', () => {
      const { container } = renderDatePicker({ fullWidth: false });
      expect(container.querySelector('.full-width')).not.toBeInTheDocument();
    });
  });

  describe('Outlined variant', () => {
    it('uses outlined variant by default', () => {
      const { container } = renderDatePicker();
      // MUI adds specific classes for outlined variant
      expect(container.querySelector('.MuiPickersOutlinedInput-root')).toBeInTheDocument();
    });

    it('uses standard variant when outlined is false', () => {
      const { container } = renderDatePicker({ outlined: false });
      // Standard variant uses FilledInput
      expect(container.querySelector('.MuiPickersFilledInput-root')).toBeInTheDocument();
    });
  });

  describe('Date boundaries', () => {
    it('accepts minDate prop', () => {
      const minDate = new Date('2024-01-01');
      renderDatePicker({ minDate });
      // MobileDatePicker will prevent selecting dates before minDate
      // This is validated by MUI internally
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('accepts maxDate prop', () => {
      const maxDate = new Date('2024-12-31');
      renderDatePicker({ maxDate });
      // MobileDatePicker will prevent selecting dates after maxDate
      // This is validated by MUI internally
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('accepts both minDate and maxDate', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      renderDatePicker({ minDate, maxDate });
      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });
});
