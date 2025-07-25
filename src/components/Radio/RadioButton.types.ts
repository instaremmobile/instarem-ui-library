export interface RadioButtonProps {
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
  // additional props
  [key: string]: any;
}
