import React from "react";
import { KeySquare, KeySquareIcon, LogIn, Plus, PlusIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Button from "./Button";
// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: { onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    children: "Add",
    variant: "secondary",
  },
};

export const Text: Story = {
  args: {
    children: "Text Button",
    variant: "text",
  },
};

export const Large: Story = {
  args: {
    children: "Button",
    size: "large",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Button",
    fullWidth: true,
  },
};
export const WithStartIcon: Story = {
  args: {
    children: "Text Button",
    variant: "primary",
    startIcon: <KeySquareIcon />,
  },
};

export const WithEndIcon: Story = {
  args: {
    children: "Text Button",
    variant: "primary",
    endIcon: <KeySquareIcon />,
  },
};

export const IsLoading: Story = {
  args: {
    children: "Text Button",
    variant: "primary",
    isLoading: true,
  },
};
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="text">Text</Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button variant="primary" isLoading>
          Loading
        </Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="text" startIcon={<PlusIcon />}>
          With Icon
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All button variants and states showcase",
      },
    },
  },
};
export const AccessibilityExamples: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "450px",
      }}
    >
      <Button
        variant="primary"
        aria-label="Submit form"
        title="Submit the current form"
      >
        Submit
      </Button>
      <Button variant="secondary" aria-describedby="help-text" disabled>
        Disabled Action
      </Button>
      <p id="help-text" style={{ fontSize: "14px", color: "#666", margin: 0 }}>
        This button is disabled because the form is incomplete.
      </p>
      <Button variant="text" isLoading aria-label="Saving changes, please wait">
        Save Changes
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Examples showing proper accessibility attributes and ARIA labels",
      },
    },
  },
};
export const ResponsiveShowcase: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      <Button variant="primary" size="small" fullWidth>
        Small Full Width
      </Button>
      <Button variant="primary" size="medium" fullWidth>
        Medium Full Width
      </Button>
      <Button variant="primary" size="large" fullWidth>
        Large Full Width
      </Button>
      <Button variant="secondary" startIcon={<LogIn />} fullWidth>
        Sign in
      </Button>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Responsive button showcase with different sizes and full width",
      },
    },
  },
};
