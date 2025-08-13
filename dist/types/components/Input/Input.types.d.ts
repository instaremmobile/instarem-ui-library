import { RetryConfig } from '../../lib';
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
    retryConfig?: Partial<RetryConfig>;
    handleChange?: (value: string) => void;
    outlined?: boolean;
    format?: (value: any) => string;
    parse?: (display: string) => any;
    formatOn?: 'change' | 'blur' | 'none';
    borderless?: boolean;
}
export interface IconProps {
    icon: React.ReactElement;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    toolTip?: string;
    disabled?: boolean;
    className?: string;
}
export interface SuggestionTypeObject {
    label: string;
    value: string;
}
export type SuggestionType = SuggestionTypeObject;
