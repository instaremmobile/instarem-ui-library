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
export const RowsAndColumns: Story = {
  args: {
    label: "Tell us your story",
    rows: 5,
    cols: 30,
    defaultValue: "It was a dark and stormy night...",
  },
};

export const ResizeVariants: Story = {
  args: {
    label: "Vertical resize",
    resize: "vertical",
    defaultValue: "It was a dark and stormy night...",
  },
};

export const BothDirections: Story = {
  args: {
    resize: "both",
    defaultValue: "It was a dark and stormy night...",
  },
};
