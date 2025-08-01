import React from "react";
import "./modal.scss";
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    closeOverlayClick?: boolean;
    className?: string;
    children: React.ReactNode;
}
export interface ModalRef {
    open: () => void;
    close: () => void;
}
declare const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>>;
export { Modal };
