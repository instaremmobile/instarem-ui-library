import type { Meta, StoryObj } from '@storybook/react-vite';
import DatePicker from './DatePicker';
declare const meta: Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof DatePicker>;
export declare const Default: Story;
export declare const WithBounds: Story;
export declare const ErrorState: Story;
export declare const FullWidth: Story;
