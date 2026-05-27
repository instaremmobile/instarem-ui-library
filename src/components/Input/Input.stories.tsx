import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Search, Eye, EyeOff, Mail, Lock, Phone, User, DollarSign, X } from 'lucide-react';
import Input from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'email', 'number', 'tel'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    shrink: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    clearable: { control: 'boolean' },
    outlined: { control: 'boolean' },
    borderless: { control: 'boolean' },
    disabled: { control: 'boolean' },
    isSearchable: { control: 'boolean' },
    iconSize: { control: 'number' }
  },
  args: { onChange: fn() }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const gameOptions = [
  { label: 'Elden Ring', value: 'eldenRing' },
  { label: 'God Of War', value: 'godOfWar' },
  { label: 'Red Dead Redemption', value: 'redDeadRedemption' },
  { label: 'The Last of Us', value: 'theLastOfUs' },
  { label: 'Ghost of Tsushima', value: 'ghostOfTsushima' },
  { label: 'Assassins Creed', value: 'assassinsCreed' },
  { label: 'Spider Man', value: 'spiderMan' },
  { label: 'Grand Theft Auto 5', value: 'grandTheftAuto5' },
  { label: 'Uncharted: Among Thieves', value: 'unchartedAmongThieves' }
];

// ---------------------------------------------------------------------------
// Basic variants
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    id: 'default',
    label: 'First name',
    type: 'text'
  }
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    shrink: true
  }
};

export const ShrinkLabel: Story = {
  name: 'Shrink (label always floated)',
  args: {
    label: 'Username',
    shrink: true,
    type: 'text'
  }
};

export const FullWidth: Story = {
  args: {
    label: 'Full width input',
    fullWidth: true,
    type: 'text'
  }
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const WithError: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    error: 'Please enter a valid email address'
  }
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Must be at least 8 characters'
  }
};

export const ErrorWithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: 'Password is too short',
    helperText: 'Must be at least 8 characters'
  }
};

export const Disabled: Story = {
  args: {
    label: 'First name',
    type: 'text',
    disabled: true,
    value: 'John'
  }
};

export const DisabledEmpty: Story = {
  args: {
    label: 'First name',
    type: 'text',
    disabled: true
  }
};

// ---------------------------------------------------------------------------
// Border styles
// ---------------------------------------------------------------------------

export const Outlined: Story = {
  name: 'Outlined (underline only)',
  args: {
    label: 'First name',
    type: 'text',
    outlined: true
  }
};

export const OutlinedWithError: Story = {
  name: 'Outlined + Error',
  args: {
    label: 'First name',
    type: 'text',
    outlined: true,
    error: 'First name is required'
  }
};

export const Borderless: Story = {
  args: {
    label: 'Search',
    type: 'text',
    borderless: true,
    placeholder: 'Type to search...',
    shrink: true
  }
};

// ---------------------------------------------------------------------------
// Icons & adornments
// ---------------------------------------------------------------------------

export const LeftIcon: Story = {
  args: {
    label: 'Search',
    type: 'text',
    startAdornment: { icon: <Search /> }
  }
};

export const RightIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    endAdornment: { icon: <Eye /> }
  }
};

export const BothIcons: Story = {
  name: 'Both icons',
  args: {
    label: 'Amount',
    type: 'text',
    startAdornment: { icon: <DollarSign /> },
    endAdornment: { icon: <X />, toolTip: 'Clear' }
  }
};

export const ClickableIcon: Story = {
  name: 'Clickable icon (with tooltip)',
  args: {
    label: 'Search',
    type: 'text',
    endAdornment: {
      icon: <Search />,
      toolTip: 'Run search',
      onClick: fn()
    }
  }
};

export const DisabledIcon: Story = {
  name: 'Disabled icon',
  args: {
    label: 'Username',
    type: 'text',
    startAdornment: {
      icon: <User />,
      disabled: true,
      toolTip: 'Not available'
    }
  }
};

// ---------------------------------------------------------------------------
// Password with visibility toggle
// ---------------------------------------------------------------------------

const PasswordToggle = () => {
  const [show, setShow] = useState(false);
  return (
    <Input
      label="Password"
      type={show ? 'text' : 'password'}
      endAdornment={{
        icon: show ? <EyeOff /> : <Eye />,
        toolTip: show ? 'Hide password' : 'Show password',
        onClick: () => setShow((v) => !v)
      }}
    />
  );
};

export const PasswordWithToggle: Story = {
  name: 'Password with visibility toggle',
  render: () => <PasswordToggle />
};

// ---------------------------------------------------------------------------
// Clearable
// ---------------------------------------------------------------------------

export const Clearable: Story = {
  args: {
    label: 'First name',
    type: 'text',
    clearable: true,
    defaultValue: 'John Doe'
  }
};

export const ClearableWithIcon: Story = {
  name: 'Clearable with left icon',
  args: {
    label: 'Search',
    type: 'text',
    clearable: true,
    startAdornment: { icon: <Search /> },
    defaultValue: 'Elden Ring'
  }
};

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export const EmailInput: Story = {
  name: 'Email type',
  args: {
    label: 'Email address',
    type: 'email',
    startAdornment: { icon: <Mail /> },
    placeholder: 'you@example.com',
    shrink: true
  }
};

export const PhoneInput: Story = {
  name: 'Phone type',
  args: {
    label: 'Phone number',
    type: 'tel',
    startAdornment: { icon: <Phone /> },
    placeholder: '+1 (555) 000-0000',
    shrink: true
  }
};

export const NumberInput: Story = {
  name: 'Number type',
  args: {
    label: 'Age',
    type: 'number',
    helperText: 'Enter your age'
  }
};

// ---------------------------------------------------------------------------
// Format / parse
// ---------------------------------------------------------------------------

export const CurrencyFormatted: Story = {
  name: 'Format on blur (currency)',
  args: {
    label: 'Amount (USD)',
    type: 'text',
    helperText: 'Formatted to 2 decimal places on blur',
    format: (v: any) => {
      const n = parseFloat(v);
      return isNaN(n) ? '' : n.toFixed(2);
    },
    parse: (s: string) => s.replace(/[^0-9.]/g, ''),
    formatOn: 'blur'
  }
};

export const FormatOnChange: Story = {
  name: 'Format on change (uppercase)',
  args: {
    label: 'Country code',
    type: 'text',
    helperText: 'Automatically uppercased as you type',
    format: (v: any) => String(v ?? '').toUpperCase(),
    parse: (s: string) => s,
    formatOn: 'change',
    maxRawLength: 3
  }
};

// ---------------------------------------------------------------------------
// Max length
// ---------------------------------------------------------------------------

export const MaxLength: Story = {
  name: 'Max raw length',
  args: {
    label: 'OTP',
    type: 'text',
    maxRawLength: 6,
    helperText: 'Maximum 6 characters'
  }
};

// ---------------------------------------------------------------------------
// Searchable with suggestions
// ---------------------------------------------------------------------------

export const SearchableWithSuggestions: Story = {
  name: 'Searchable with suggestions',
  args: {
    label: 'Favourite game',
    isSearchable: true,
    suggestions: gameOptions,
    startAdornment: { icon: <Search /> },
    helperText: 'Start typing to filter suggestions'
  }
};

export const SearchablePreselected: Story = {
  name: 'Searchable with preselected value',
  args: {
    label: 'Favourite game',
    isSearchable: true,
    value: 'eldenRing',
    suggestions: gameOptions
  }
};

// ---------------------------------------------------------------------------
// Combined / real-world
// ---------------------------------------------------------------------------

export const LoginEmail: Story = {
  name: 'Real-world — Email field',
  args: {
    label: 'Email address',
    type: 'email',
    startAdornment: { icon: <Mail /> },
    clearable: true,
    helperText: 'We will never share your email',
    fullWidth: true
  }
};

export const LoginPassword: Story = {
  name: 'Real-world — Password field',
  render: () => <PasswordToggle />
};

export const SecurePin: Story = {
  name: 'Real-world — PIN field',
  args: {
    label: 'PIN',
    type: 'password',
    startAdornment: { icon: <Lock /> },
    maxRawLength: 4,
    helperText: '4-digit PIN',
    format: (v: any) => String(v ?? '').replace(/\D/g, ''),
    parse: (s: string) => s.replace(/\D/g, ''),
    formatOn: 'none'
  }
};
