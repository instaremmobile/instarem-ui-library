import React from 'react';
import { cn } from '../../lib';

import './modal.scss';

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

const Modal = React.forwardRef<ModalRef, ModalProps>(
  ({ isOpen, onClose, title, closeOverlayClick, className, children }, ref) => {
    const handleOverlayClick = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOverlayClick, onClose]
    );

    const handleEscapekey = React.useCallback(
      (e: KeyboardEvent) => {
        if (isOpen && e.key === 'Escape') {
          onClose();
        }
      },
      [isOpen, onClose]
    );

    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleEscapekey);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscapekey);
        document.body.style.overflow = '';
      };
    }, [isOpen, handleEscapekey]);

    React.useImperativeHandle(ref, () => ({
      open: () => {},
      close: () => {
        onClose();
      }
    }));

    if (!isOpen) return null;
    return (
      <div
        className={cn('modal', isOpen ? 'modal--open' : '', className)}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__overlay" onClick={handleOverlayClick}>
          <div className="modal__content">
            {title && (
              <div className="modal__header">
                <h2 className="modal__title">{title}</h2>
                <button className="modal__close-button" onClick={onClose} aria-label="Close">
                  &times;
                </button>
              </div>
            )}
            <div className="modal__body">{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal Popup';

export { Modal };
