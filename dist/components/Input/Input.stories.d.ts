import { StoryObj } from '@storybook/react-vite';
declare const meta: {
  title: string;
  component: import('react').NamedExoticComponent<
    import('./Input.types').InputFieldProps & import('react').RefAttributes<HTMLInputElement>
  >;
  parameters: {
    layout: string;
  };
  tags: string[];
  argTypes: {
    type: {
      control: 'select';
      options: string[];
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
    helperText: {
      control: 'text';
    };
    shrink: {
      control: 'boolean';
    };
    fullWidth: {
      control: 'boolean';
    };
    clearable: {
      control: 'boolean';
    };
    outlined: {
      control: 'boolean';
    };
    borderless: {
      control: 'boolean';
    };
    disabled: {
      control: 'boolean';
    };
    isSearchable: {
      control: 'boolean';
    };
    iconSize: {
      control: 'number';
    };
  };
  args: {
    onChange: import('@vitest/spy').Mock<(...args: any[]) => any>;
  };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const WithPlaceholder: Story;
export declare const ShrinkLabel: Story;
export declare const FullWidth: Story;
export declare const WithError: Story;
export declare const WithHelperText: Story;
export declare const ErrorWithHelperText: Story;
export declare const Disabled: Story;
export declare const DisabledEmpty: Story;
export declare const Outlined: Story;
export declare const OutlinedWithError: Story;
export declare const Borderless: Story;
export declare const LeftIcon: Story;
export declare const RightIcon: Story;
export declare const BothIcons: Story;
export declare const ClickableIcon: Story;
export declare const DisabledIcon: Story;
export declare const PasswordWithToggle: Story;
export declare const Clearable: Story;
export declare const ClearableWithIcon: Story;
export declare const EmailInput: Story;
export declare const PhoneInput: Story;
export declare const NumberInput: Story;
export declare const CurrencyFormatted: Story;
export declare const FormatOnChange: Story;
export declare const MaxLength: Story;
export declare const SearchableWithSuggestions: Story;
export declare const SearchablePreselected: Story;
export declare const LoginEmail: Story;
export declare const LoginPassword: Story;
export declare const SecurePin: Story;
