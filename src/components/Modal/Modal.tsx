import React from 'react';
import { cn } from '../../lib';

import './modal.scss';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title?: string;
  closeOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ModalRef {
  open: () => void;
  close: () => void;
}

const Modal = React.forwardRef<ModalRef, ModalProps>(
  (
    {
      isOpen,
      onClose,
      onOpen,
      title,
      closeOverlayClick,
      showCloseButton = true,
      className,
      children
    },
    ref
  ) => {
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [shouldRender, setShouldRender] = React.useState(false);

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
        setShouldRender(true);
        onOpen?.();
        // Small delay to ensure DOM is ready before starting animation
        const timer = setTimeout(() => setIsAnimating(true), 10);
        document.addEventListener('keydown', handleEscapekey);
        document.body.style.overflow = 'hidden';
        return () => clearTimeout(timer);
      } else if (shouldRender) {
        setIsAnimating(false);
        // Wait for animation to complete before unmounting
        const timer = setTimeout(() => setShouldRender(false), 300);
        return () => clearTimeout(timer);
      }

      return () => {
        document.removeEventListener('keydown', handleEscapekey);
        document.body.style.overflow = '';
      };
    }, [isOpen, shouldRender, handleEscapekey]);

    React.useImperativeHandle(ref, () => ({
      open: () => {},
      close: () => {
        onClose();
      }
    }));

    if (!shouldRender) return null;
    return (
      <div
        className={cn(
          'modal',
          isAnimating ? 'modal--open' : '',
          'modal--spring-animation',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__overlay" onClick={handleOverlayClick}>
          <div className="modal__content">
            {(title || showCloseButton) && (
              <div className="modal__header">
                {title && <h2 className="modal__title">{title}</h2>}
                {!title && showCloseButton && <div />}
                {showCloseButton && (
                  <button className="modal__close-button" onClick={onClose} aria-label="Close">
                    &times;
                  </button>
                )}
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
