import React, { useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Search, Eye } from "lucide-react";
import Input from "./Input";
import { Button } from "../Button";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: { type: "string" },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    shrink: {
      control: "boolean",
    },
    iconSize: { control: "number" },
    fullWidth: {
      control: "boolean",
      description:
        "Controls wether the input field takes the witdth of 450px or not",
    },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    id: "firstName",
    name: "firstName",
    type: "text",
    label: "First name",
    placeholder: "",
    error: "",
    shrink: false,
    fullWidth: false,
    isSearchable: false,
    suggestions: [
      "Elden Ring",
      "God Of War",
      "Red Dead Redemption",
      "The Last of Us",
      "Ghost of Tsushima",
      "Assassins Creed",
      "Spider Man",
      "Grand Theft Auto 5",
      "Uncharted: Among Theives",
    ],
  },
};

export const Error: Story = {
  args: {
    type: "text",
    label: "First name",
    placeholder: "",
    error: "First name is required",
    shrink: false,
  },
};

export const Disabled: Story = {
  args: {
    type: "text",
    disabled: true,
    label: "First name",
  },
};

export const LeftIcon: Story = {
  args: {
    type: "text",
    label: "First name",
    startAdornment: { icon: <Search /> },
  },
};

export const RightIcon: Story = {
  args: {
    type: "text",
    label: "First name",
    endAdorenment: { icon: <Eye /> },
  },
};

export const HelperText: Story = {
  args: {
    type: "text",
    label: "First name",
    helperText: "Enter your legal first name",
  },
};

const ButtonWithFetchFunction = (props: any) => {
  const fetchUsers = async () => {
    const resposne = await fetch("https://jsonplaceholder.typicode.com/users", {
      method: "get",
    });
    if (!resposne.ok) {
      console.error("Could not fetch users");
      return;
    }
    const data = await resposne.json();
    const names = data.map((user: Record<string, any>) => user.username);
    return names;
  };

  return (
    <Input
      {...props}
      fetchFunction={fetchUsers}
      label="First name"
      fullWidth
      isSearchable
    />
  );
};

export const InputReloaded: Story = {
  render: () => <ButtonWithFetchFunction />,
};
