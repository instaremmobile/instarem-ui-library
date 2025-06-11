import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Toggle } from "./Toggle";

test("Toggle renders on the screen", () => {
  render(<Toggle />);
  const toggle = screen.getByRole("checkbox");
  expect(toggle).toBeInTheDocument();
});
