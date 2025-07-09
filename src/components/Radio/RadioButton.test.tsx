import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import RadioButton from "./RadioButton";

test("Renders input component", () => {
  render(<RadioButton />);
  const inputElement = screen.getByRole("radio");
  expect(inputElement).toBeInTheDocument();
});
