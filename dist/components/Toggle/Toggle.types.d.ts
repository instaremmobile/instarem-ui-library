export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (value: boolean) => any;
  checked?: boolean;
  labelPosition?: 'left' | 'right';
}
