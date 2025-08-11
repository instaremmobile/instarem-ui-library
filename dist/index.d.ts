import React$1 from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "text";
    size?: "small" | "medium" | "large";
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    className?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

declare const Button: React$1.ForwardRefExoticComponent<ButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    label?: string;
    onChange?: (value: boolean) => any;
    checked?: boolean;
    labelPosition?: "left" | "right";
}

declare const Toggle: React$1.MemoExoticComponent<React$1.ForwardRefExoticComponent<ToggleProps & React$1.RefAttributes<HTMLInputElement>>>;

interface RetryConfig {
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
    startAdornment?: IconProps;
    endAdornment?: IconProps;
    onIconClick?: (position: "left" | "right", event: React.MouseEvent<HTMLDivElement>) => void;
    iconSize?: number;
    clearable?: boolean;
    fullWidth?: boolean;
    suggestions?: SuggestionType[];
    isSearchable?: boolean;
    fetchFunction?: () => Promise<unknown>;
    retryConfig?: Partial<RetryConfig>;
    handleChange?: (value: string) => void;
    outlined?: boolean;
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

declare const _default: React$1.MemoExoticComponent<React$1.ForwardRefExoticComponent<InputFieldProps & React$1.RefAttributes<HTMLInputElement>>>;

interface CheckboxProps {
    id?: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
    indeterminate?: boolean;
    className?: string;
    required?: boolean;
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
}

declare const Checkbox: React$1.ForwardRefExoticComponent<CheckboxProps & React$1.RefAttributes<HTMLInputElement>>;

interface RadioButtonProps {
    value: string;
    name: string;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    className?: string;
    size?: "small" | "medium" | "large";
    variant?: "primary" | "secondary" | "success" | "danger";
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    "aria-label"?: string;
    "aria-describedby"?: string;
    [key: string]: any;
}

declare const RadioButton: React$1.ForwardRefExoticComponent<Omit<RadioButtonProps, "ref"> & React$1.RefAttributes<HTMLInputElement>>;

export { Button, Checkbox, _default as Input, RadioButton, Toggle };
