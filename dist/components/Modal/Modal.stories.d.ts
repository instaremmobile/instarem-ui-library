import { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ModalProps } from './Modal';
declare const meta: {
  title: string;
  component: React.ForwardRefExoticComponent<
    ModalProps & React.RefAttributes<import('./Modal').ModalRef>
  >;
  parameters: {
    layout: string;
  };
  tags: string[];
  argTypes: {
    isOpen: {
      type: 'boolean';
      control: 'boolean';
    };
    closeOverlayClick: {
      type: 'boolean';
      control: 'boolean';
    };
    title: {
      type: 'string';
      control: 'text';
    };
    showCloseButton: {
      type: 'boolean';
      control: 'boolean';
    };
  };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const ModalWithFormStory: Story;
export declare const DefaultModal: Story;
