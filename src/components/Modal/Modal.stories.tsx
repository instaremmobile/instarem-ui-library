import { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { Modal, ModalProps } from "./Modal";

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: { type: "boolean", control: "boolean" },
    closeOverlayClick: { type: "boolean", control: "boolean" },
    title: { type: "string", control: "text" },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

const DefaultModalComponent = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const handleOnClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <Modal title="Title" isOpen={isOpen} onClose={handleOnClose}>
        <div>Hello</div>
      </Modal>
    </>
  );
};
//@ts-ignore
export const DefaultModal: Story = {
  render: () => <DefaultModalComponent />,
};
