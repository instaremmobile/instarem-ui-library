import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Checkbox } from "./Checkbox";
import { CheckboxProps } from "./Checkbox.types";

describe("Checkbox Component", () => {
  const defaultProps: CheckboxProps = {
    id: "test-checkbox",
    label: "Test Label",
    checked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with required props", () => {
      render(<Checkbox {...defaultProps} />);

      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("Test Label");

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).toHaveAttribute("id", "test-checkbox");
    });

    it("renders with default unchecked state", () => {
      render(<Checkbox {...defaultProps} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("renders as checked when checked prop is true", () => {
      render(<Checkbox {...defaultProps} checked={true} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("renders as disabled when disabled prop is true", () => {
      render(<Checkbox {...defaultProps} disabled={true} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("applies custom className to container", () => {
      const { container } = render(
        <Checkbox {...defaultProps} className="custom-class" />,
      );

      const label = container.querySelector("label");
      expect(label).toHaveClass("checkbox-container", "custom-class");
    });

    it("applies disabled class when disabled", () => {
      const { container } = render(
        <Checkbox {...defaultProps} disabled={true} />,
      );

      const label = container.querySelector("label");
      const labelSpan = container.querySelector(".checkbox-label");

      expect(label).toHaveClass("disabled");
      expect(labelSpan).toHaveClass("disabled");
    });
  });

  describe("Accessibility", () => {
    it("sets aria-describedby attribute", () => {
      render(<Checkbox {...defaultProps} aria-describedby="description-id" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-describedby", "description-id");
    });

    it("sets aria-labelledby attribute", () => {
      render(<Checkbox {...defaultProps} aria-labelledby="label-id" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-labelledby", "label-id");
    });

    it("sets required attribute when required prop is true", () => {
      render(<Checkbox {...defaultProps} required={true} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeRequired();
    });

    it("has proper label association", () => {
      render(<Checkbox {...defaultProps} />);

      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("Test Label");

      expect(checkbox).toHaveAttribute("id", "test-checkbox");
      expect(label.closest("label")).toHaveAttribute("for", "test-checkbox");
    });

    it("custom span has aria-hidden attribute", () => {
      const { container } = render(<Checkbox {...defaultProps} />);

      const customSpan = container.querySelector(".checkbox-custom");
      expect(customSpan).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("User Interactions", () => {
    it("calls onChange when clicked", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(<Checkbox {...defaultProps} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange with false when unchecking", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Checkbox {...defaultProps} checked={true} onChange={mockOnChange} />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(false);
    });

    it("does not call onChange when disabled", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Checkbox {...defaultProps} disabled={true} onChange={mockOnChange} />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("can be clicked via label", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(<Checkbox {...defaultProps} onChange={mockOnChange} />);

      const label = screen.getByText("Test Label");
      await user.click(label);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("responds to keyboard navigation (Space key)", async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(<Checkbox {...defaultProps} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();

      // Use userEvent for more realistic keyboard interaction
      await user.keyboard(" ");

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Indeterminate State", () => {
    it("sets indeterminate property on input element", () => {
      render(<Checkbox {...defaultProps} indeterminate={true} />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it("updates indeterminate property when prop changes", () => {
      const { rerender } = render(
        <Checkbox {...defaultProps} indeterminate={false} />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);

      rerender(<Checkbox {...defaultProps} indeterminate={true} />);
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  describe("Ref Handling", () => {
    it("forwards ref to input element", () => {
      const ref = React.createRef<HTMLInputElement>();

      render(<Checkbox {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe("checkbox");
    });

    it("ref allows direct manipulation of input", () => {
      const ref = React.createRef<HTMLInputElement>();

      render(<Checkbox {...defaultProps} ref={ref} />);

      expect(ref.current?.checked).toBe(false);

      if (ref.current) {
        ref.current.checked = true;
        expect(ref.current.checked).toBe(true);
      }
    });
  });

  describe("Edge Cases", () => {
    it("handles missing onChange gracefully", async () => {
      const user = userEvent.setup();

      render(<Checkbox {...defaultProps} />);

      const checkbox = screen.getByRole("checkbox");

      // Should not throw error when clicked without onChange
      expect(() => user.click(checkbox)).not.toThrow();
    });

    it("handles empty label", () => {
      render(<Checkbox {...defaultProps} label="" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("displays correct displayName", () => {
      expect(Checkbox.displayName).toBe("Checkbox");
    });
  });
});
