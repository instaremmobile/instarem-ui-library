import { StoryObj } from "@storybook/react";
import { RadioButtonProps } from "./RadioButton.types";
import React from "react";
declare const meta: {
    title: string;
    component: React.ForwardRefExoticComponent<Omit<RadioButtonProps, "ref"> & React.RefAttributes<HTMLInputElement>>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        label: {
            control: "text";
            type: "string";
        };
    };
    args: {
        onChange: import("@storybook/addon-actions").HandlerFunction;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Group: Story;
export declare const Disabled: Story;
export declare const Unchecked: Story;
