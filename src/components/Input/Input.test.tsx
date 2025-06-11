import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Input from "./Input";

test("Renders input component", () => {
  render(<Input />);
  const inputElement = screen.getByRole("textbox");
  expect(inputElement).toBeInTheDocument();
});

test("Input accepts a value", () => {
  render(<Input />);
  const inputElement = screen.getByRole("textbox") as HTMLInputElement;
  inputElement.value = "Hello";
  expect(inputElement.value).toBe("Hello");
});
