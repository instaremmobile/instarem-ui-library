import React from 'react';
import { StoryObj } from '@storybook/react-vite';
declare const meta: {
  title: string;
  component: React.NamedExoticComponent<
    import('./Input.types').InputFieldProps & React.RefAttributes<HTMLInputElement>
  >;
  parameters: {
    layout: string;
  };
  tags: string[];
  argTypes: {
    type: {
      type: 'string';
    };
    label: {
      control: 'text';
    };
    placeholder: {
      control: 'text';
    };
    error: {
      control: 'text';
    };
    shrink: {
      control: 'boolean';
    };
    iconSize: {
      control: 'number';
    };
    helperText: {
      control: 'text';
      type: 'string';
    };
    fullWidth: {
      control: 'boolean';
      description: string;
    };
  };
  args: {
    onChange: import('@vitest/spy').Mock<(...args: any[]) => any>;
  };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Enabled: Story;
export declare const Error: Story;
export declare const Disabled: Story;
export declare const LeftIcon: Story;
export declare const RightIcon: Story;
export declare const HelperText: Story;
export declare const InputReloaded: Story;
