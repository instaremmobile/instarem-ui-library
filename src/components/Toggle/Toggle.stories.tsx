import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./Toggle";
import React from "react";
const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    label: "Toggle me",
    checked: false,
  },
};

const ToggleWithState = (props: any) => {
  const [checked, setChecked] = React.useState<boolean>(false);
  const handleChange = (value: boolean) => {
    setChecked(value);
  };
  return (
    <Toggle
      {...props}
      id="test-toggle"
      checked={checked}
      onChange={handleChange}
      labelPosition="left"
      label={`Toggle is ${checked ? "On" : "Off"}`}
    />
  );
};

export const DynamicToggle: Story = {
  render: () => <ToggleWithState />,
};
