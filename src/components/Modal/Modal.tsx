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
    const modalContentRef = React.useRef<HTMLDivElement>(null);
    const previousFocusRef = React.useRef<Element | null>(null);

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

    const FOCUSABLE_SELECTORS =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleFocusTrap = React.useCallback((e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalContentRef.current) return;
      const focusable = Array.from(
        modalContentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }, []);

    React.useEffect(() => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      if (isOpen) {
        setShouldRender(true);
        onOpen?.();
        timer = setTimeout(() => {
          setIsAnimating(true);
          previousFocusRef.current = document.activeElement;
          const focusable =
            modalContentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
          focusable?.[0]?.focus();
        }, 10);
        document.addEventListener('keydown', handleEscapekey);
        document.addEventListener('keydown', handleFocusTrap);
        document.body.style.overflow = 'hidden';
      } else if (shouldRender) {
        setIsAnimating(false);
        timer = setTimeout(() => {
          setShouldRender(false);
          if (previousFocusRef.current instanceof HTMLElement) {
            previousFocusRef.current.focus();
          }
        }, 300);
      }

      return () => {
        if (timer) clearTimeout(timer);
        document.removeEventListener('keydown', handleEscapekey);
        document.removeEventListener('keydown', handleFocusTrap);
        document.body.style.overflow = '';
      };
    }, [isOpen, shouldRender, handleEscapekey, handleFocusTrap]);

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
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="modal__overlay" onClick={handleOverlayClick}>
          <div className="modal__content" ref={modalContentRef}>
            {(title || showCloseButton) && (
              <div className="modal__header">
                {title && (
                  <h2 id="modal-title" className="modal__title">
                    {title}
                  </h2>
                )}
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
