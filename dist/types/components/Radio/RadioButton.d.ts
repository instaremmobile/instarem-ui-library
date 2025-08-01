import React from "react";
import { RadioButtonProps } from "./RadioButton.types";
import "./radio-button.scss";
declare const RadioButton: React.ForwardRefExoticComponent<Omit<RadioButtonProps, "ref"> & React.RefAttributes<HTMLInputElement>>;
export default RadioButton;
