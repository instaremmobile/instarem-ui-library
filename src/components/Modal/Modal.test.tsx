import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Modal, ModalProps, ModalRef } from './Modal';

const defaultProps: ModalProps = {
  isOpen: true,
  onClose: jest.fn(),
  children: <div>Modal Content</div>
};

const renderModal = (props: Partial<ModalProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<Modal {...mergedProps} />);
};

describe('Modal component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    document.body.style.overflow = '';
  });

  describe('Basic rendering', () => {
    it('renders modal when isOpen is true', () => {
      renderModal({ isOpen: true });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      renderModal({ isOpen: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders with title', () => {
      renderModal({ title: 'Test Title' });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderModal({ className: 'custom-modal' });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
    });

    it('renders close button by default', () => {
      renderModal();
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      renderModal({ showCloseButton: false });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      renderModal({ children: <p>Custom children</p> });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      expect(screen.getByText('Custom children')).toBeInTheDocument();
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked and closeOverlayClick is true', () => {
      const onClose = jest.fn();
      renderModal({ onClose, closeOverlayClick: true });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      const overlay = document.querySelector('.modal__overlay');
      fireEvent.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when overlay is clicked and closeOverlayClick is false', () => {
      const onClose = jest.fn();
      renderModal({ onClose, closeOverlayClick: false });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      const overlay = document.querySelector('.modal__overlay');
      fireEvent.click(overlay!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when modal content is clicked', () => {
      const onClose = jest.fn();
      renderModal({ onClose, closeOverlayClick: true });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      const content = document.querySelector('.modal__content');
      fireEvent.click(content!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other keys', () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Animation', () => {
    it('applies open class after delay when opened', () => {
      renderModal({ isOpen: true });

      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(screen.getByRole('dialog')).toHaveClass('modal--open');
    });

    it('removes modal from DOM after closing animation', () => {
      const { rerender } = renderModal({ isOpen: true });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={false} />);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Body overflow', () => {
    it('sets body overflow to hidden when modal opens', () => {
      renderModal({ isOpen: true });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('onOpen callback', () => {
    it('calls onOpen when modal opens', () => {
      const onOpen = jest.fn();
      renderModal({ isOpen: true, onOpen });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(onOpen).toHaveBeenCalled();
    });

    it('does not call onOpen when modal is closed', () => {
      const onOpen = jest.fn();
      renderModal({ isOpen: false, onOpen });

      expect(onOpen).not.toHaveBeenCalled();
    });
  });

  describe('Ref handling', () => {
    it('exposes close method via ref', () => {
      const onClose = jest.fn();
      const ref = React.createRef<ModalRef>();

      render(
        <Modal isOpen={true} onClose={onClose} ref={ref}>
          <div>Content</div>
        </Modal>
      );
      act(() => {
        jest.advanceTimersByTime(10);
      });

      ref.current?.close();

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('exposes open method via ref', () => {
      const ref = React.createRef<ModalRef>();

      render(
        <Modal isOpen={true} onClose={jest.fn()} ref={ref}>
          <div>Content</div>
        </Modal>
      );
      act(() => {
        jest.advanceTimersByTime(10);
      });

      // open method exists but is a no-op in current implementation
      expect(() => ref.current?.open()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderModal();
      act(() => {
        jest.advanceTimersByTime(10);
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('close button has aria-label', () => {
      renderModal();
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  describe('Header rendering', () => {
    it('renders header when title is provided', () => {
      renderModal({ title: 'Modal Title' });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(document.querySelector('.modal__header')).toBeInTheDocument();
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('renders header when showCloseButton is true without title', () => {
      renderModal({ showCloseButton: true, title: undefined });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(document.querySelector('.modal__header')).toBeInTheDocument();
    });

    it('does not render header when no title and showCloseButton is false', () => {
      renderModal({ showCloseButton: false, title: undefined });
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(document.querySelector('.modal__header')).not.toBeInTheDocument();
    });
  });
});
