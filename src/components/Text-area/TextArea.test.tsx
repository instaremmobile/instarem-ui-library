import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TextArea from "./TextArea";

test("renders textarea component", () => {
  render(<TextArea label="Description" />);
  expect(screen.getByRole("textbox")).toBeInTheDocument();
});

test("accepts value", () => {
  render(<TextArea defaultValue="Hello" />);
  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  expect(textarea.value).toBe("Hello");
});

test("shows error message", () => {
  render(<TextArea label="Desc" error="Required" />);
  expect(screen.getByText("Required")).toBeInTheDocument();
});
