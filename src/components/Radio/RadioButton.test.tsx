import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RadioButton from './RadioButton';

jest.mock('@lib', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

describe('RadioButton Component', () => {
  const defaultProps = {
    name: 'test-radio',
    value: 'test-value',
    label: 'Test Radio Button'
  };

  describe('Basic Rendering', () => {
    test('renders radio button with label', () => {
      render(<RadioButton {...defaultProps} />);

      const radioButton = screen.getByRole('radio');
      const label = screen.getByText('Test Radio Button');

      expect(radioButton).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    test('renders without label when label prop is not provided', () => {
      render(<RadioButton name="test" value="test" />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toBeInTheDocument();
      expect(screen.queryByText('Test Radio Button')).not.toBeInTheDocument();
    });

    test('has correct name and value attributes', () => {
      render(<RadioButton {...defaultProps} />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toHaveAttribute('name', 'test-radio');
      expect(radioButton).toHaveAttribute('value', 'test-value');
    });

    test('generates unique id for each instance', () => {
      render(
        <div>
          <RadioButton name="test1" value="value1" label="Label 1" />
          <RadioButton name="test2" value="value2" label="Label 2" />
        </div>
      );

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons[0]).toHaveAttribute('id');
      expect(radioButtons[1]).toHaveAttribute('id');
      expect(radioButtons[0].id).not.toBe(radioButtons[1].id);
    });
  });

  describe('Checked State', () => {
    test('is unchecked by default', () => {
      render(<RadioButton {...defaultProps} />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).not.toBeChecked();
    });

    test('can be checked when checked prop is true', () => {
      render(<RadioButton {...defaultProps} checked={true} />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toBeChecked();
    });

    test('applies checked class when checked', () => {
      render(<RadioButton {...defaultProps} checked={true} />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('radio-button--checked');
    });
  });

  describe('Disabled State', () => {
    test('is enabled by default', () => {
      render(<RadioButton {...defaultProps} />);
      const radioButton = screen.getByRole('radio');
      expect(radioButton).not.toBeDisabled();
    });

    test('can be disabled when disabled prop is true', () => {
      render(<RadioButton {...defaultProps} disabled={true} />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toBeDisabled();
    });

    test('applies disabled class when disabled', () => {
      render(<RadioButton {...defaultProps} disabled={true} />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('radio-button--disabled');
    });
  });

  describe('Size and Variant Props', () => {
    test('applies default size class (medium)', () => {
      render(<RadioButton {...defaultProps} />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('radio-button--medium');
    });

    test('applies custom size class', () => {
      render(<RadioButton {...defaultProps} size="large" />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('radio-button--large');
    });

    test('applies default variant class (primary)', () => {
      render(<RadioButton {...defaultProps} />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('radio-button--primary');
    });

    test('applies custom variant class', () => {
      render(<RadioButton {...defaultProps} variant="danger" />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('radio-button--danger');
    });

    test('applies custom className', () => {
      render(<RadioButton {...defaultProps} className="custom-class" />);

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Event Handlers', () => {
    test('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<RadioButton {...defaultProps} disabled={true} onChange={mockOnChange} />);

      const radioButton = screen.getByRole('radio');
      await user.click(radioButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('calls onFocus handler when focused', async () => {
      const user = userEvent.setup();
      const mockOnFocus = jest.fn();

      render(<RadioButton {...defaultProps} onFocus={mockOnFocus} />);

      await user.tab(); // Focus on the radio button

      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    test('calls onBlur handler when blurred', async () => {
      const user = userEvent.setup();
      const mockOnBlur = jest.fn();

      render(<RadioButton {...defaultProps} onBlur={mockOnBlur} />);

      await user.tab(); // Focus
      await user.tab(); // Blur

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    test('handles keyboard interaction (Space key)', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<RadioButton {...defaultProps} checked={false} onChange={mockOnChange} />);

      const radioButton = screen.getByRole('radio');
      radioButton.focus();

      await user.keyboard(' ');

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    test('handles keyboard interaction (Arrow keys for radio group)', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      // Test with a group of radio buttons
      const RadioGroup = () => {
        const [selected, setSelected] = React.useState('option1');

        return (
          <div>
            <RadioButton
              name="group"
              value="option1"
              label="Option 1"
              checked={selected === 'option1'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSelected(e.target.value);
                mockOnChange(e);
              }}
            />
            <RadioButton
              name="group"
              value="option2"
              label="Option 2"
              checked={selected === 'option2'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSelected(e.target.value);
                mockOnChange(e);
              }}
            />
          </div>
        );
      };

      render(<RadioGroup />);

      const option1 = screen.getByLabelText('Option 1');

      option1.focus();

      await act(async () => {
        await user.keyboard('{ArrowDown}');
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: 'option2'
            })
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper accessibility attributes', () => {
      render(
        <RadioButton
          {...defaultProps}
          aria-label="Custom aria label"
          aria-describedby="description-id"
        />
      );

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toHaveAttribute('aria-label', 'Custom aria label');
      expect(radioButton).toHaveAttribute('aria-describedby', 'description-id');
    });

    test('label is properly associated with input', () => {
      render(<RadioButton {...defaultProps} />);

      const radioButton = screen.getByRole('radio');
      const label = screen.getByText('Test Radio Button');

      expect(radioButton).toHaveAttribute('id');
      expect(label.closest('label')).toHaveAttribute('for', radioButton.id);
    });

    test('can be clicked via label', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<RadioButton {...defaultProps} onChange={mockOnChange} />);

      const label = screen.getByText('Test Radio Button');
      await user.click(label);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Forward Ref', () => {
    test('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();

      render(<RadioButton {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('radio');
    });
  });

  describe('Additional Props', () => {
    test('spreads additional props to input element', () => {
      render(<RadioButton {...defaultProps} data-testid="custom-radio" title="Custom title" />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toHaveAttribute('data-testid', 'custom-radio');
      expect(radioButton).toHaveAttribute('title', 'Custom title');
    });
  });

  describe('Radio Button Group Behavior', () => {
    test('works as controlled components in a group', async () => {
      const user = userEvent.setup();
      // simulate react functional component
      const RadioButtonGroup = () => {
        const [accountType, setAccountType] = React.useState<string>('individual');

        return (
          <div>
            <RadioButton
              name="accountType"
              value="individual"
              label="Individual"
              checked={accountType === 'individual'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountType(e.target.value)}
            />
            <RadioButton
              name="accountType"
              value="business"
              label="Business"
              checked={accountType === 'business'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountType(e.target.value)}
            />
          </div>
        );
      };

      render(<RadioButtonGroup />);

      const individualOption = screen.getByLabelText('Individual');
      const businessOption = screen.getByLabelText('Business');

      // Initially individual should be selected
      expect(individualOption).toBeChecked();
      expect(businessOption).not.toBeChecked();

      // Click business option
      await act(async () => {
        await user.click(businessOption);
        expect(individualOption).not.toBeChecked();
        expect(businessOption).toBeChecked();
      });
      await act(async () => {
        await user.click(individualOption);
        expect(individualOption).toBeChecked();
        expect(businessOption).not.toBeChecked();
      });
    });

    test('maintains group behavior with external state management', async () => {
      const user = userEvent.setup();
      let currentValue = 'option1';
      const mockOnChange = jest.fn((e) => {
        currentValue = e.target.value;
      });

      const { rerender } = render(
        <div>
          <RadioButton
            name="group"
            value="option1"
            label="Option 1"
            checked={currentValue === 'option1'}
            onChange={mockOnChange}
          />
          <RadioButton
            name="group"
            value="option2"
            label="Option 2"
            checked={currentValue === 'option2'}
            onChange={mockOnChange}
          />
        </div>
      );

      const option1 = screen.getByLabelText('Option 1');
      const option2 = screen.getByLabelText('Option 2');

      // Initially option1 should be selected
      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();

      // Click option2
      await user.click(option2);
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'option2'
          })
        })
      );

      // Rerender with updated state
      rerender(
        <div>
          <RadioButton
            name="group"
            value="option1"
            label="Option 1"
            checked={currentValue === 'option1'}
            onChange={mockOnChange}
          />
          <RadioButton
            name="group"
            value="option2"
            label="Option 2"
            checked={currentValue === 'option2'}
            onChange={mockOnChange}
          />
        </div>
      );

      // Now option2 should be selected
      expect(option1).not.toBeChecked();
      expect(option2).toBeChecked();
    });
  });

  describe('CSS Classes', () => {
    test('applies all expected CSS classes', () => {
      render(
        <RadioButton
          {...defaultProps}
          size="large"
          variant="success"
          checked={true}
          className="custom-class"
        />
      );

      const container = screen.getByRole('radio').closest('.radio-button');
      expect(container).toHaveClass(
        'radio-button',
        'radio-button--large',
        'radio-button--success',
        'radio-button--checked',
        'custom-class'
      );
    });

    test('applies base classes and input class', () => {
      render(<RadioButton {...defaultProps} />);

      const radioButton = screen.getByRole('radio');
      expect(radioButton).toHaveClass('radio-button__input');

      const label = screen.getByText('Test Radio Button').closest('label');
      expect(label).toHaveClass('radio-button__label');
    });
  });
});
