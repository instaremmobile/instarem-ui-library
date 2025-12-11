import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Checkbox } from "./Checkbox";
const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A WCAG-compliant checkbox component with custom styling.",
      },
    },
  },
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    indeterminate: {
      control: "boolean",
    },
    label: {
      control: "text",
    },
    onChange: {
      action: "changed",
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    id: "checkbox-default",
    label: "Default checkbox",
    checked: false,
  },
};
export const Checked: Story = {
  args: {
    id: "checkbox-checked",
    label: "Checked checkbox",
    checked: true,
  },
};
export const Disabled: Story = {
  args: {
    id: "checkbox-disabled",
    label: "Disabled checkbox",
    disabled: true,
  },
};
export const DisabledChecked: Story = {
  args: {
    id: "checkbox-disabled-checked",
    label: "Disabled checked checkbox",
    checked: true,
    disabled: true,
  },
};
export const Indeterminate: Story = {
  args: {
    id: "checkbox-indeterminate",
    label: "Indeterminate checkbox",
    indeterminate: true,
  },
};
export const Required: Story = {
  args: {
    id: "checkbox-required",
    label: "Required checkbox",
    required: true,
  },
};
