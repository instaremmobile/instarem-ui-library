import { RetryConfig } from '@lib';

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  disabled?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
  fullWidth?: boolean;
  outlined?: boolean;
  shrink?: boolean;
  options?: OptionType[];
  /** Array of categories to group options. Maximum recommended: 5 categories for optimal UX */
  categories?: CategoryType[];
  fetchFunction?: () => Promise<unknown>;
  retryConfig?: Partial<RetryConfig>;
  onChange?: (value: string | string[]) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  startAdornment?: IconProps;
  endAdornment?: IconProps;
  onIconClick?: (position: 'left' | 'right', event: React.MouseEvent<HTMLDivElement>) => void;
  iconSize?: number;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  name?: string;
}

export interface IconProps {
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  toolTip?: string;
  disabled?: boolean;
  className?: string;
}

export interface OptionTypeObject {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactElement;
  image?: string;
}

export type OptionType = OptionTypeObject;

export interface CategoryType {
  category: string;
  options: OptionType[];
}
