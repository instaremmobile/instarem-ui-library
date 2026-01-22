import { Meta, StoryObj } from "@storybook/react";
import TextArea from "./TextArea";

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter description",
  },
};
export const PlaceHolderwithhelperText: Story = {
  args: {
    placeholder: "Enter description",
    helperText: "Max 500 characters",
  },
};
export const LabelWithHelperText: Story = {
  args: {
    label: "Description",
    helperText: "Max 500 characters",
  },
};

export const Error: Story = {
  args: {
    label: "Description",
    error: "This field is required",
  },
};

export const ErrorWithoutLabel: Story = {
  args: {
    error: "This field is required",
  },
};

export const Disabled: Story = {
  args: {
    label: "Description",
    disabled: true,
  },
};
