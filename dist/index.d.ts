import React$1 from 'react';
import { RetryConfig as RetryConfig$1 } from '@lib';
import { ClassValue } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

declare const Button: React$1.ForwardRefExoticComponent<
  ButtonProps & React$1.RefAttributes<HTMLButtonElement>
>;

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (value: boolean) => any;
  checked?: boolean;
  labelPosition?: 'left' | 'right';
}

declare const Toggle: React$1.NamedExoticComponent<
  ToggleProps & React$1.RefAttributes<HTMLInputElement>
>;

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  error?: string | undefined;
  shrink?: boolean;
  helperText?: string | undefined;
  startAdornment?: IconProps;
  endAdornment?: IconProps;
  onIconClick?: (position: 'left' | 'right', event: React.MouseEvent<HTMLDivElement>) => void;
  iconSize?: number;
  clearable?: boolean;
  fullWidth?: boolean;
  suggestions?: SuggestionType[];
  isSearchable?: boolean;
  fetchFunction?: () => Promise<unknown>;
  retryConfig?: Partial<RetryConfig$1>;
  handleChange?: (value: string) => void;
  outlined?: boolean;
  format?: (value: any) => string;
  parse?: (display: string) => any;
  formatOn?: 'change' | 'blur' | 'none';
  borderless?: boolean;
  rawOnChange?: boolean;
  maxRawLength?: number;
}
interface IconProps {
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  toolTip?: string;
  disabled?: boolean;
  className?: string;
}
interface SuggestionTypeObject {
  label: string;
  value: string;
}
type SuggestionType = SuggestionTypeObject;

declare const _default: React$1.NamedExoticComponent<
  InputFieldProps & React$1.RefAttributes<HTMLInputElement>
>;

interface CheckboxProps {
  id?: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  className?: string;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

declare const Checkbox: React$1.ForwardRefExoticComponent<
  CheckboxProps & React$1.RefAttributes<HTMLInputElement>
>;

interface RadioButtonProps {
  value: string;
  name: string;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  [key: string]: any;
}

declare const RadioButton: React$1.ForwardRefExoticComponent<
  Omit<RadioButtonProps, 'ref'> & React$1.RefAttributes<HTMLInputElement>
>;

interface DatePickerProps extends Omit<
  React$1.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  outlined?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

declare const DatePicker: React$1.NamedExoticComponent<
  DatePickerProps & React$1.RefAttributes<HTMLInputElement>
>;

declare const COLORS: {
  brandPrimary: string;
  brandPrimaryHover: string;
  colorWhite: string;
  colorBlack: string;
  colorLinkText: string;
  colorError: string;
  colorBorderGrey: string;
};

interface SearchOptions {
  maxDistance: number;
  prefixOnly?: boolean;
  caseSensitive?: boolean;
  maxResults?: number;
  matchType?: 'exact' | 'partial';
}
declare class Trie {
  private root;
  private cache;
  private static readonly CACHE_SIZE;
  private static readonly MIN_WORD_LENGTH;
  private wordCount;
  constructor();
  private getCommonPrefix;
  private createNewNode;
  private splitNode;
  insert(word: string, frequency?: number): void;
  private getLevenshtienDistance;
  private getPartialDistance;
  private calculateScore;
  search(query: string, options?: SearchOptions): string[];
  clearCache(): void;
}

declare const cn: (...inputClasses: ClassValue[]) => string;

declare class CacheManager {
  private cache;
  private readonly defaultTTL;
  constructor(defaultTTL?: number);
  set<T>(key: string, data: T, ttl?: number): void;
  get<T>(key: string): T | null;
  clear(): void;
}

interface RetryConfig {
  maxAttempt: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}
declare class NetworkManager {
  private static instance;
  private isOnline;
  private retryQueue;
  cache: CacheManager;
  private defaultRetryConfig;
  constructor();
  static getInstance(): NetworkManager;
  private setupNetworkListeners;
  private handleOnline;
  private handleOffline;
  private processRetryQueue;
  private calculateDelay;
  fetchWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T>;
}

export {
  Button,
  COLORS,
  Checkbox,
  DatePicker,
  _default as Input,
  NetworkManager,
  RadioButton,
  Toggle,
  Trie,
  cn
};
export type { RetryConfig };
