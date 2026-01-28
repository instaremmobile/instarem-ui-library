import React from "react";

export interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  label?: string;
  error?: string;
  shrink?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  outlined?: boolean;
  handleChange?: (value: string) => void;
  resize?: "none" | "vertical" | "horizontal" | "both";
}
