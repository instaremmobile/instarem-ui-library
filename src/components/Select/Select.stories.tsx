import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Search, Globe, Gamepad2, Star, Trophy, Zap } from 'lucide-react';
import Select from './Select';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    shrink: {
      control: 'boolean'
    },
    iconSize: { control: 'number' },
    helperText: { control: 'text', type: 'string' },
    fullWidth: {
      control: 'boolean',
      description: 'Controls whether the select field takes the width of 450px or not'
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality in the dropdown'
    },
    clearable: {
      control: 'boolean',
      description: 'Show clear button when a value is selected'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select field'
    },
    outlined: {
      control: 'boolean',
      description: 'Use outlined variant with bottom border only'
    }
  },
  args: { onChange: fn() }
} satisfies Meta<typeof Select>;

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

export const Default: Story = {
  args: {
    id: 'game-select',
    name: 'game',
    label: 'Favorite Game',
    placeholder: 'Select a game',
    error: '',
    shrink: false,
    fullWidth: false,
    searchable: true,
    clearable: false,
    options: gameOptions
  }
};

export const WithValue: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    searchable: true,
    value: 'godOfWar',
    options: gameOptions
  }
};

export const WithError: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    error: 'Please select a game',
    searchable: true,
    options: gameOptions
  }
};

export const Disabled: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    disabled: true,
    value: 'eldenRing',
    options: gameOptions
  }
};

export const WithClearButton: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    searchable: true,
    clearable: true,
    value: 'eldenRing',
    options: gameOptions
  }
};

export const WithoutSearch: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    searchable: false,
    options: gameOptions
  }
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search Game',
    placeholder: 'Select a game',
    searchable: true,
    startAdornment: { icon: <Search /> },
    options: gameOptions
  }
};

export const WithRightIcon: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select a country',
    searchable: true,
    endAdornment: { icon: <Globe /> },
    options: [
      { label: 'United States', value: 'US' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'Canada', value: 'CA' },
      { label: 'Australia', value: 'AU' },
      { label: 'Singapore', value: 'SG' },
      { label: 'India', value: 'IN' }
    ]
  }
};

export const WithHelperText: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    helperText: 'Choose your all-time favorite video game',
    searchable: true,
    options: gameOptions
  }
};

export const FullWidth: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    fullWidth: true,
    searchable: true,
    options: gameOptions
  }
};

export const Outlined: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    outlined: true,
    searchable: true,
    options: gameOptions
  }
};

export const Shrink: Story = {
  args: {
    label: 'Favorite Game',
    placeholder: 'Select a game',
    shrink: true,
    searchable: true,
    options: gameOptions
  }
};

const fetchCountries = async () => {
  const response = await fetch(
    'https://qa.instarem.com/api/v1/public/remitter/countries/dropdown?is_residence_activated=true',
    {
      method: 'get'
    }
  );
  if (!response.ok) {
    console.error('Could not fetch countries');
    return [];
  }
  const data = await response.json();
  return data.data;
};

export const WithAPIFetch: Story = {
  args: {
    fullWidth: true,
    fetchFunction: fetchCountries,
    label: 'Country',
    placeholder: 'Select a country',
    shrink: false,
    searchable: true,
    clearable: true
  }
};

export const WithAPIFetchAndRetry: Story = {
  args: {
    fullWidth: true,
    fetchFunction: fetchCountries,
    retryConfig: {
      maxAttempt: 3,
      baseDelay: 500,
      maxDelay: 5000,
      jitter: true
    },
    label: 'Country',
    placeholder: 'Select a country',
    searchable: true,
    clearable: true,
    helperText: 'Data will be retried up to 3 times if fetch fails'
  }
};

export const MultipleSelection: Story = {
  args: {
    label: 'Favorite Games',
    placeholder: 'Select games',
    multiple: true,
    searchable: true,
    clearable: true,
    options: gameOptions,
    defaultValue: ['godOfWar', 'eldenRing']
  }
};

export const WithCategories: Story = {
  args: {
    label: 'Select Country',
    placeholder: 'Choose a country',
    searchable: true,
    clearable: true,
    categories: [
      {
        category: 'Popular Countries',
        options: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Singapore', value: 'SG' },
          { label: 'Australia', value: 'AU' }
        ]
      },
      {
        category: 'All Countries',
        options: [
          { label: 'Canada', value: 'CA' },
          { label: 'France', value: 'FR' },
          { label: 'Germany', value: 'DE' },
          { label: 'India', value: 'IN' },
          { label: 'Japan', value: 'JP' },
          { label: 'Brazil', value: 'BR' },
          { label: 'Mexico', value: 'MX' },
          { label: 'South Korea', value: 'KR' }
        ]
      }
    ]
  }
};

export const MultipleSelectionWithCategories: Story = {
  args: {
    label: 'Select Countries',
    placeholder: 'Choose countries',
    multiple: true,
    searchable: true,
    clearable: true,
    categories: [
      {
        category: 'Popular Countries',
        options: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Singapore', value: 'SG' },
          { label: 'Australia', value: 'AU' }
        ]
      },
      {
        category: 'All Countries',
        options: [
          { label: 'Canada', value: 'CA' },
          { label: 'France', value: 'FR' },
          { label: 'Germany', value: 'DE' },
          { label: 'India', value: 'IN' },
          { label: 'Japan', value: 'JP' },
          { label: 'Brazil', value: 'BR' },
          { label: 'Mexico', value: 'MX' },
          { label: 'South Korea', value: 'KR' }
        ]
      }
    ],
    defaultValue: ['US', 'SG']
  }
};

export const WithDisabledOptions: Story = {
  args: {
    label: 'Select Game',
    placeholder: 'Choose a game',
    searchable: true,
    options: [
      { label: 'Elden Ring', value: 'eldenRing' },
      { label: 'God Of War', value: 'godOfWar', disabled: true },
      { label: 'Red Dead Redemption', value: 'redDeadRedemption' },
      { label: 'The Last of Us', value: 'theLastOfUs', disabled: true }
    ]
  }
};

export const WithIcons: Story = {
  args: {
    label: 'Select Game',
    placeholder: 'Choose a game',
    searchable: true,
    value: 'eldenRing',
    options: [
      { label: 'Elden Ring', value: 'eldenRing', icon: <Gamepad2 /> },
      { label: 'God Of War', value: 'godOfWar', icon: <Trophy /> },
      { label: 'Red Dead Redemption', value: 'redDeadRedemption', icon: <Star /> },
      { label: 'The Last of Us', value: 'theLastOfUs', icon: <Zap /> }
    ]
  }
};

export const WithImages: Story = {
  args: {
    label: 'Select Country',
    placeholder: 'Choose a country',
    searchable: true,
    clearable: true,
    value: 'US',
    options: [
      {
        label: 'United States',
        value: 'US',
        image: 'https://flagcdn.com/w40/us.png'
      },
      {
        label: 'United Kingdom',
        value: 'UK',
        image: 'https://flagcdn.com/w40/gb.png'
      },
      {
        label: 'Singapore',
        value: 'SG',
        image: 'https://flagcdn.com/w40/sg.png'
      },
      {
        label: 'Australia',
        value: 'AU',
        image: 'https://flagcdn.com/w40/au.png'
      },
      {
        label: 'India',
        value: 'IN',
        image: 'https://flagcdn.com/w40/in.png'
      }
    ]
  }
};

export const MultipleWithIcons: Story = {
  args: {
    label: 'Select Games',
    placeholder: 'Choose games',
    multiple: true,
    searchable: true,
    clearable: true,
    defaultValue: ['eldenRing', 'godOfWar'],
    options: [
      { label: 'Elden Ring', value: 'eldenRing', icon: <Gamepad2 /> },
      { label: 'God Of War', value: 'godOfWar', icon: <Trophy /> },
      { label: 'Red Dead Redemption', value: 'redDeadRedemption', icon: <Star /> },
      { label: 'The Last of Us', value: 'theLastOfUs', icon: <Zap /> }
    ]
  }
};

export const CategoriesWithIcons: Story = {
  args: {
    label: 'Select Country',
    placeholder: 'Choose a country',
    searchable: true,
    clearable: true,
    categories: [
      {
        category: 'Popular Countries',
        options: [
          { label: 'United States', value: 'US', image: 'https://flagcdn.com/w40/us.png' },
          { label: 'United Kingdom', value: 'UK', image: 'https://flagcdn.com/w40/gb.png' },
          { label: 'Singapore', value: 'SG', image: 'https://flagcdn.com/w40/sg.png' },
          { label: 'Australia', value: 'AU', image: 'https://flagcdn.com/w40/au.png' }
        ]
      },
      {
        category: 'All Countries',
        options: [
          { label: 'Canada', value: 'CA', image: 'https://flagcdn.com/w40/ca.png' },
          { label: 'France', value: 'FR', image: 'https://flagcdn.com/w40/fr.png' },
          { label: 'Germany', value: 'DE', image: 'https://flagcdn.com/w40/de.png' },
          { label: 'India', value: 'IN', image: 'https://flagcdn.com/w40/in.png' },
          { label: 'Japan', value: 'JP', image: 'https://flagcdn.com/w40/jp.png' }
        ]
      }
    ]
  }
};
