export interface CheckboxProps {
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
