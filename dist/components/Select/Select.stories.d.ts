import React from 'react';
import { StoryObj } from '@storybook/react-vite';
declare const meta: {
  title: string;
  component: React.NamedExoticComponent<
    import('./Select.types').SelectProps & React.RefAttributes<HTMLInputElement>
  >;
  parameters: {
    layout: string;
  };
  tags: string[];
  argTypes: {
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
    searchable: {
      control: 'boolean';
      description: string;
    };
    clearable: {
      control: 'boolean';
      description: string;
    };
    disabled: {
      control: 'boolean';
      description: string;
    };
    outlined: {
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
export declare const Default: Story;
export declare const WithValue: Story;
export declare const WithError: Story;
export declare const Disabled: Story;
export declare const WithClearButton: Story;
export declare const WithoutSearch: Story;
export declare const WithLeftIcon: Story;
export declare const WithRightIcon: Story;
export declare const WithHelperText: Story;
export declare const FullWidth: Story;
export declare const Outlined: Story;
export declare const Shrink: Story;
export declare const WithAPIFetch: Story;
export declare const WithAPIFetchAndRetry: Story;
export declare const MultipleSelection: Story;
export declare const WithCategories: Story;
export declare const MultipleSelectionWithCategories: Story;
export declare const WithDisabledOptions: Story;
export declare const WithIcons: Story;
export declare const WithImages: Story;
export declare const MultipleWithIcons: Story;
export declare const CategoriesWithIcons: Story;
