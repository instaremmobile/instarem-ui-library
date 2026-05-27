import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import DatePicker from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: {
      control: 'boolean',
      description: 'Controls whether the date picker takes the full width (450px) or not'
    },
    outlined: { control: 'boolean' },
    format: { control: 'text' }
  },
  args: {
    onChange: fn(),
    label: 'Select date',
    placeholder: 'DD/MM/YYYY',
    helperText: 'DD/MM/YYYY',
    format: 'dd/MM/yyyy',
    outlined: true,
    fullWidth: false,
    disabled: false
  }
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return <DatePicker {...args} value={date} onChange={handleChange} />;
  }
};

export const WithPreselectedDate: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(new Date());
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return <DatePicker {...args} label="Travel date" value={date} onChange={handleChange} />;
  }
};

export const WithMinDate: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const minDate = new Date();
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="Future date only"
        helperText="Can only select today or future dates"
        value={date}
        onChange={handleChange}
        minDate={minDate}
      />
    );
  }
};

export const WithMaxDate: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const maxDate = new Date();
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="Past date only"
        helperText="Can only select today or past dates"
        value={date}
        onChange={handleChange}
        maxDate={maxDate}
      />
    );
  }
};

export const WithDateRange: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(new Date());
    const minDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="Select date within 2 months"
        helperText="Date must be within next 2 months"
        value={date}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    );
  }
};

export const ErrorState: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="Date of birth"
        value={date}
        onChange={handleChange}
        error="Date of birth is required"
      />
    );
  }
};

export const Disabled: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(new Date());
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="Disabled date"
        value={date}
        onChange={handleChange}
        disabled={true}
      />
    );
  }
};

export const FullWidth: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <div style={{ width: 450 }}>
        <DatePicker
          {...args}
          label="Full width date picker"
          value={date}
          onChange={handleChange}
          fullWidth
        />
      </div>
    );
  }
};

export const WithHelperText: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="Appointment date"
        value={date}
        onChange={handleChange}
        helperText="Select your preferred appointment date"
      />
    );
  }
};

export const DifferentFormat: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    const handleChange = (newDate: Date | null) => {
      setDate(newDate);
      args.onChange?.(newDate);
    };
    return (
      <DatePicker
        {...args}
        label="US date format"
        placeholder="MM/DD/YYYY"
        value={date}
        onChange={handleChange}
        format="MM/dd/yyyy"
        helperText="MM/DD/YYYY"
      />
    );
  }
};
