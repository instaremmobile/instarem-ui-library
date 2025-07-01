import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";

afterEach(cleanup);

describe("Toggle Component", () => {
  const defaultProps = {
    label: "Test Toggle",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Rendering", () => {
    it("Renders with a label", () => {
      render(<Toggle {...defaultProps} />);

      expect(screen.getByLabelText("Test Toggle")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      render(<Toggle onChange={jest.fn()} />);

      const toggle = screen.getByRole("checkbox");
      expect(toggle).toBeInTheDocument();
      expect(toggle).not.toHaveAccessibleName();
    });
    it("renders with custom id", () => {
      render(<Toggle {...defaultProps} id="custom-toggle" />);

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "id",
        "custom-toggle",
      );
    });
    it("renders with aria-label when provided", () => {
      render(<Toggle onChange={jest.fn()} aria-label="Custom toggle label" />);

      expect(screen.getByLabelText("Custom toggle label")).toBeInTheDocument();
    });
  });

  describe("Initial State", () => {
    it("is unchecked by default", () => {
      render(<Toggle {...defaultProps} />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("renders as checked when checked prop is true", () => {
      render(<Toggle {...defaultProps} checked={true} />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("renders as enabled by default", () => {
      render(<Toggle {...defaultProps} />);

      expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("renders as disabled when disabled prop is true", () => {
      render(<Toggle {...defaultProps} disabled={true} />);

      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("User Interactions", () => {
    it("calls onChange when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Toggle {...defaultProps} onChange={handleChange} />);

      const toggle = screen.getByRole("checkbox");
      await user.click(toggle);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange with correct value when toggling from checked to unchecked", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(
        <Toggle {...defaultProps} checked={true} onChange={handleChange} />,
      );

      const toggle = screen.getByRole("checkbox");
      await user.click(toggle);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(
        <Toggle {...defaultProps} disabled={true} onChange={handleChange} />,
      );

      const toggle = screen.getByRole("checkbox");
      await user.click(toggle);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it("responds to keyboard interactions (Space key)", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Toggle {...defaultProps} onChange={handleChange} />);

      const toggle = screen.getByRole("checkbox");
      toggle.focus();
      await user.keyboard(" ");

      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
