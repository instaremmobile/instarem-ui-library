import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
    fullWidth: { control: 'boolean' },
    outlined: { control: 'boolean' },
    format: { control: 'text' }
  },
  args: {
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
    return <DatePicker {...args} value={date} onChange={setDate} />;
  }
};

export const WithBounds: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(new Date());
    const min = new Date();
    const max = new Date();
    max.setMonth(max.getMonth() + 2);
    return (
      <DatePicker
        {...args}
        label="Bounded date"
        value={date}
        onChange={setDate}
        minDate={min}
        maxDate={max}
      />
    );
  }
};

export const ErrorState: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    return (
      <DatePicker {...args} label="Birthday" value={date} onChange={setDate} error="Invalid date" />
    );
  }
};

export const FullWidth: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    return (
      <div style={{ width: 450 }}>
        <DatePicker {...args} label="Full width" value={date} onChange={setDate} fullWidth />
      </div>
    );
  }
};
