import React from "react";
import { ButtonProps } from "./Button.types";
import "./button-styles.scss";
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export default Button;
