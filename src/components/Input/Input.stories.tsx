import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Search, Eye } from 'lucide-react';
import Input from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: { type: 'string' },
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
      description: 'Controls wether the input field takes the witdth of 450px or not'
    }
  },
  args: { onChange: fn() }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    id: 'firstName',
    name: 'firstName',
    type: 'text',
    label: 'First name',
    placeholder: '',
    error: '',
    shrink: false,
    fullWidth: false,
    isSearchable: false,
    suggestions: [
      { label: 'Elden Ring', value: 'eldenRing' },
      { label: 'God Of War', value: 'godOfWar' },
      { label: 'Red Dead Redemption', value: 'redDeadRedemption' },
      { label: 'The Last of Us', value: 'theLastOfUs' },
      { label: 'Ghost of Tsushima', value: 'ghostOfTsushima' },
      { label: 'Assassins Creed', value: 'assassinsCreed' },
      { label: 'Spider Man', value: 'spiderMan' },
      { label: 'Grand Theft Auto 5', value: 'grandTheftAuto5' },
      { label: 'Uncharted: Among Theives', value: 'unchartedAmongTheives' }
    ]
  }
};

export const Error: Story = {
  args: {
    type: 'text',
    label: 'First name',
    placeholder: '',
    error: 'First name is required',
    shrink: false
  }
};

export const Disabled: Story = {
  args: {
    type: 'text',
    disabled: true,
    label: 'First name'
  }
};

export const LeftIcon: Story = {
  args: {
    type: 'text',
    label: 'First name',
    startAdornment: { icon: <Search /> }
  }
};

export const RightIcon: Story = {
  args: {
    type: 'text',
    label: 'First name',
    endAdornment: { icon: <Eye /> }
  }
};

export const HelperText: Story = {
  args: {
    type: 'text',
    label: 'First name',
    helperText: 'Enter your legal first name'
  }
};

const ButtonWithFetchFunction = (props: any) => {
  const fetchUsers = async () => {
    const resposne = await fetch(
      'https://qa.instarem.com/api/v1/public/remitter/countries/dropdown?is_residence_activated=true',
      {
        method: 'get'
      }
    );
    if (!resposne.ok) {
      console.error('Could not fetch users');
      return;
    }
    const data = await resposne.json();

    return data.data;
  };

  return (
    <Input fetchFunction={fetchUsers} label="First name" fullWidth={true} isSearchable={true} />
  );
};

const fetchUsers = async () => {
  const resposne = await fetch(
    'https://qa.instarem.com/api/v1/public/remitter/countries/dropdown?is_residence_activated=true',
    {
      method: 'get'
    }
  );
  if (!resposne.ok) {
    console.error('Could not fetch users');
    return;
  }
  const data = await resposne.json();

  return data.data;
};
export const InputReloaded: Story = {
  args: {
    fullWidth: true,
    fetchFunction: fetchUsers,
    type: 'text',
    label: 'First name',
    shrink: true,
    isSearchable: true
  }
};
