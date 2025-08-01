export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
