import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "./Button";
import userEvent from "@testing-library/user-event";

jest.mock("@lib", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveClass("btn", "btn--primary", "btn--medium");
    });

    it("renders with custom text content", () => {
      render(<Button>Custom Button Text</Button>);

      expect(
        screen.getByRole("button", { name: "Custom Button Text" }),
      ).toBeInTheDocument();
    });

    it("renders with custom type attribute", () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("Variants", () => {
    it("renders primary variant by default", () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--primary");
    });

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--secondary");
    });

    it("renders text variant", () => {
      render(<Button variant="text">Text</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--text");
    });
  });

  describe("Sizes", () => {
    it("renders medium size by default", () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--medium");
    });

    it("renders small size", () => {
      render(<Button size="small">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--small");
    });

    it("renders large size", () => {
      render(<Button size="large">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--large");
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner when isLoading is true", () => {
      render(<Button isLoading>Loading</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--loading");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");

      const spinner = screen.getByRole("button").querySelector(".btn__spinner");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-hidden", "true");
    });

    it("hides icons when loading", () => {
      const StartIcon = () => <span data-testid="start-icon">→</span>;
      const EndIcon = () => <span data-testid="end-icon">←</span>;

      render(
        <Button isLoading startIcon={<StartIcon />} endIcon={<EndIcon />}>
          Loading
        </Button>,
      );

      expect(screen.queryByTestId("start-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("end-icon")).not.toBeInTheDocument();
    });

    it("applies loading class to text when loading", () => {
      render(<Button isLoading>Loading</Button>);

      const textSpan = screen.getByRole("button").querySelector(".btn__text");
      expect(textSpan).toHaveClass("btn__text--loading");
    });
  });

  describe("Disabled State", () => {
    it("disables button when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("disables button when isLoading is true", () => {
      render(<Button isLoading>Loading</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("disables button when both disabled and isLoading are true", () => {
      render(
        <Button disabled isLoading>
          Disabled Loading
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Full Width", () => {
    it("applies full width class when fullWidth is true", () => {
      render(<Button fullWidth>Full Width</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn--full-width");
    });

    it("does not apply full width class by default", () => {
      render(<Button>Normal Width</Button>);

      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("btn--full-width");
    });
  });

  describe("Icons", () => {
    it("renders start icon", () => {
      const StartIcon = () => <span data-testid="start-icon">→</span>;

      render(<Button startIcon={<StartIcon />}>With Start Icon</Button>);

      expect(screen.getByTestId("start-icon")).toBeInTheDocument();
      const iconContainer = screen.getByTestId("start-icon").parentElement;
      expect(iconContainer).toHaveClass("btn__icon", "btn__icon--start");
      expect(iconContainer).toHaveAttribute("aria-hidden", "true");
    });

    it("renders end icon", () => {
      const EndIcon = () => <span data-testid="end-icon">←</span>;

      render(<Button endIcon={<EndIcon />}>With End Icon</Button>);

      expect(screen.getByTestId("end-icon")).toBeInTheDocument();
      const iconContainer = screen.getByTestId("end-icon").parentElement;
      expect(iconContainer).toHaveClass("btn__icon", "btn__icon--end");
      expect(iconContainer).toHaveAttribute("aria-hidden", "true");
    });

    it("renders both start and end icons", () => {
      const StartIcon = () => <span data-testid="start-icon">→</span>;
      const EndIcon = () => <span data-testid="end-icon">←</span>;

      render(
        <Button startIcon={<StartIcon />} endIcon={<EndIcon />}>
          With Both Icons
        </Button>,
      );

      expect(screen.getByTestId("start-icon")).toBeInTheDocument();
      expect(screen.getByTestId("end-icon")).toBeInTheDocument();
    });
  });

  describe("Custom ClassName", () => {
    it("applies custom className", () => {
      render(<Button className="custom-class">Custom Class</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("combines custom className with default classes", () => {
      render(
        <Button className="custom-class" variant="secondary" size="large">
          Combined Classes
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "btn",
        "btn--secondary",
        "btn--large",
        "custom-class",
      );
    });
  });

  describe("Event Handling", () => {
    it("calls onClick handler when clicked", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>,
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} isLoading>
          Click me
        </Button>,
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("handles keyboard events", () => {
      const handleKeyDown = jest.fn();

      render(<Button onKeyDown={handleKeyDown}>Press me</Button>);

      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Enter" });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref to button element", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(<Button ref={ref}>Ref Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toBe(screen.getByRole("button"));
    });

    it("allows calling focus on forwarded ref", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(<Button ref={ref}>Focus me</Button>);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe("Additional HTML Attributes", () => {
    it("passes through additional button attributes", () => {
      render(
        <Button
          id="custom-id"
          aria-label="Custom aria label"
          data-testid="custom-button"
          title="Custom title"
        >
          Custom Attributes
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("id", "custom-id");
      expect(button).toHaveAttribute("aria-label", "Custom aria label");
      expect(button).toHaveAttribute("data-testid", "custom-button");
      expect(button).toHaveAttribute("title", "Custom title");
    });

    it("handles form attributes correctly", () => {
      render(
        <Button
          form="my-form"
          formAction="/submit"
          formMethod="post"
          formTarget="_blank"
        >
          Form Button
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("form", "my-form");
      expect(button).toHaveAttribute("formAction", "/submit");
      expect(button).toHaveAttribute("formMethod", "post");
      expect(button).toHaveAttribute("formTarget", "_blank");
    });
  });

  describe("Accessibility", () => {
    it("has correct aria attributes when disabled", () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("has correct aria attributes when loading", () => {
      render(<Button isLoading>Loading Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("spinner has aria-hidden attribute", () => {
      render(<Button isLoading>Loading</Button>);

      const spinner = screen.getByRole("button").querySelector(".btn__spinner");
      expect(spinner).toHaveAttribute("aria-hidden", "true");
    });

    it("icon containers have aria-hidden attribute", () => {
      const StartIcon = () => <span>→</span>;
      const EndIcon = () => <span>←</span>;

      render(
        <Button startIcon={<StartIcon />} endIcon={<EndIcon />}>
          With Icons
        </Button>,
      );

      const iconContainers = screen
        .getByRole("button")
        .querySelectorAll(".btn__icon");
      iconContainers.forEach((container) => {
        expect(container).toHaveAttribute("aria-hidden", "true");
      });
    });
  });
});
