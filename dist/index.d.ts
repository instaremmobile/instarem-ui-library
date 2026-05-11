import React$1 from 'react';
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
  radius?: 'default' | 'pill';
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

interface RetryConfig$1 {
  maxAttempt: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  error?: string | undefined;
  shrink?: boolean;
  helperText?: string | undefined;
  startAdornment?: IconProps$1;
  endAdornment?: IconProps$1;
  onIconClick?: (position: 'left' | 'right', event: React.MouseEvent<HTMLDivElement>) => void;
  iconSize?: number;
  clearable?: boolean;
  fullWidth?: boolean;
  suggestions?: SuggestionType[];
  isSearchable?: boolean;
  fetchFunction?: () => Promise<unknown>;
  retryConfig?: Partial<RetryConfig$1>;
  handleChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  enableShortcut?: boolean;
  outlined?: boolean;
  format?: (value: any) => string;
  parse?: (display: string) => any;
  formatOn?: 'change' | 'blur' | 'none';
  borderless?: boolean;
  rawOnChange?: boolean;
  maxRawLength?: number;
}
interface IconProps$1 {
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

declare const _default$1: React$1.NamedExoticComponent<
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
  name?: string;
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
  name?: string;
  id?: string;
}

declare const DatePicker: React$1.NamedExoticComponent<
  DatePickerProps & React$1.RefAttributes<HTMLInputElement>
>;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title?: string;
  closeOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: React$1.ReactNode;
}
interface ModalRef {
  open: () => void;
  close: () => void;
}
declare const Modal: React$1.ForwardRefExoticComponent<
  ModalProps & React$1.RefAttributes<ModalRef>
>;

interface SelectProps {
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
  retryConfig?: Partial<RetryConfig$1>;
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
interface IconProps {
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  toolTip?: string;
  disabled?: boolean;
  className?: string;
}
interface OptionTypeObject {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactElement;
  image?: string;
}
type OptionType = OptionTypeObject;
interface CategoryType {
  category: string;
  options: OptionType[];
}

declare const _default: React$1.NamedExoticComponent<
  SelectProps & React$1.RefAttributes<HTMLInputElement>
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
  private uniqueWords;
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

/**
 * TrieManager provides namespaced Trie instances to prevent memory leaks
 * and namespace collisions when multiple components use Trie for search.
 *
 * Each namespace gets its own Trie instance, and instances can be cleaned up
 * when components unmount.
 */
declare class TrieManager {
  private static instances;
  /**
   * Get or create a Trie instance for the given namespace
   * @param namespace - Unique identifier for the Trie instance
   * @returns Trie instance associated with the namespace
   */
  static getOrCreate(namespace: string): Trie;
  /**
   * Clear a specific Trie instance by namespace
   * @param namespace - Namespace to clear
   */
  static clear(namespace: string): void;
  /**
   * Clear all Trie instances (useful for testing)
   */
  static clearAll(): void;
  /**
   * Get the number of active Trie instances
   */
  static getInstanceCount(): number;
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
  _default$1 as Input,
  Modal,
  NetworkManager,
  RadioButton,
  _default as Select,
  Toggle,
  Trie,
  TrieManager,
  cn
};
export type { RetryConfig };
