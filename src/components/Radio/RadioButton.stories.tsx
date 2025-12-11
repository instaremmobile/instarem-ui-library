import { StoryObj, Meta } from "@storybook/react-webpack5";
import { action } from "storybook/actions";
import RadioButton from "./RadioButton";
import { RadioButtonProps } from "./RadioButton.types";
import React from "react";

const meta = {
  title: "Components/RadioButton",
  component: RadioButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text", type: "string" },
  },
  args: { onChange: action("onChange") },
} satisfies Meta<RadioButtonProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Radio button",
    checked: true,
  },
};

const RadioButtonGroup = () => {
  const [currentlySelected, setCurrentlySelected] =
    React.useState<string>("option1");

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentlySelected(e.target.value);
  };
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <RadioButton
        label="Option 1"
        name="radio"
        value="option1"
        checked={currentlySelected === "option1"}
        onChange={handleOnChange}
      />
      <RadioButton
        label="Option 2"
        name="radio"
        value="option2"
        checked={currentlySelected === "option2"}
        onChange={handleOnChange}
      />
    </div>
  );
};

export const Group: Story = {
  render: () => <RadioButtonGroup />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: true,
    label: "Disabled radio",
  },
};

export const Unchecked: Story = {
  args: {
    checked: false,
    label: "Unchecked radio",
  },
};
