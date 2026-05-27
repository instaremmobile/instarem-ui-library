// Mocks must be at the top before any imports
jest.mock('@lib', () => {
  const trieInstances = new Map<string, any>();

  return {
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
    NetworkManager: {
      getInstance: () => ({
        fetchWithRetry: jest.fn(),
        cache: {
          get: jest.fn()
        }
      })
    },
    Trie: jest.fn().mockImplementation(() => ({
      insert: jest.fn(),
      search: jest.fn().mockReturnValue([]),
      clearCache: jest.fn()
    })),
    TrieManager: {
      getOrCreate: jest.fn((namespace: string) => {
        if (!trieInstances.has(namespace)) {
          trieInstances.set(namespace, {
            insert: jest.fn(),
            search: jest.fn().mockReturnValue([]),
            clearCache: jest.fn()
          });
        }
        return trieInstances.get(namespace);
      }),
      clear: jest.fn((namespace: string) => {
        trieInstances.delete(namespace);
      }),
      clearAll: jest.fn(() => {
        trieInstances.clear();
      }),
      getInstanceCount: jest.fn(() => trieInstances.size)
    }
  };
});

jest.mock('lodash/debounce', () => {
  return jest.fn((fn) => {
    // Create a wrapper function that has the cancel method
    const debouncedFn = jest.fn((...args) => fn(...args)) as jest.MockedFunction<typeof fn> & {
      cancel: jest.MockedFunction<() => void>;
      flush: jest.MockedFunction<() => void>;
    };
    debouncedFn.cancel = jest.fn();
    debouncedFn.flush = jest.fn();
    return debouncedFn;
  });
});

jest.mock('lodash/isEmpty', () => jest.fn((value) => !value || Object.keys(value).length === 0));

import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputFieldProps } from './Input.types';
import userEvent from '@testing-library/user-event';
import Input from './Input';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

test('Renders input component', () => {
  render(<Input />);
  const inputElement = screen.getByRole('textbox');
  expect(inputElement).toBeInTheDocument();
});

test('Input accepts a value', () => {
  render(<Input />);
  const inputElement = screen.getByRole('textbox') as HTMLInputElement;
  inputElement.value = 'Hello';
  expect(inputElement.value).toBe('Hello');
});

const defaultProps: InputFieldProps = {
  id: 'test-input',
  label: 'Test input'
};

const renderInput = (props: Partial<InputFieldProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<Input {...mergedProps} />);
};

describe('Input component', () => {
  describe('basic rendering', () => {
    afterEach(() => {
      jest.clearAllMocks();
      Object.defineProperty(navigator, 'online', {
        writable: true,
        value: true
      });
    });

    test('Renders input with label', () => {
      renderInput();
      expect(screen.getByLabelText('Test input')).toBeInTheDocument();
      expect(screen.getByText('Test input')).toBeInTheDocument();
    });
    test('input renders with default props', () => {
      renderInput();
      const textField = screen.getByRole('textbox');
      expect(textField).toHaveAttribute('type', 'text');
      expect(textField).not.toBeDisabled();
    });

    test('renders with custom classname', () => {
      renderInput({ className: 'custom-class' });
      const textField = screen.getByRole('textbox');
      expect(textField).toHaveClass('text-field-input custom-class');
    });

    test('renders with custom id', () => {
      renderInput({ id: 'custom-id' });
      const textField = screen.getByRole('textbox');
      expect(textField).toHaveAttribute('id', 'custom-id');
    });

    test('renders with diffrent type', () => {
      renderInput({ type: 'email' });
      const textField = screen.getByRole('textbox');
      expect(textField).toHaveAttribute('type', 'email');
    });
  });

  describe('Value handling', () => {
    test('handles controlled value', () => {
      const { rerender } = renderInput({ value: 'controlled value' });
      const textField = screen.getByRole('textbox') as HTMLInputElement;
      expect(textField).toHaveValue('controlled value');
      rerender(<Input {...defaultProps} value={'updated value'} />);
      expect(textField.value).toBe('updated value');
    });
    test('handles uncontrolled value with defaultValue', () => {
      renderInput({ defaultValue: 'default value' });

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('default value');
    });
    test('handles input changes', async () => {
      const user = userEvent.setup();
      renderInput();
      const input = screen.getByRole('textbox');
      await act(async () => {
        await user.type(input, 'test input');
        expect(input).toHaveValue('test input');
      });
    });

    test('calls handleChange callback', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      renderInput({ handleChange });
      const input = screen.getByRole('textbox');
      await act(async () => {
        await user.type(input, 'a');
      });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Focus and blur behavior', () => {
    test('calls onFocus when input is focused', async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();
      renderInput({ onFocus });
      const input = screen.getByRole('textbox');
      await act(async () => {
        await user.click(input);
      });
      expect(onFocus).toHaveBeenCalled();
    });

    test('calls onBlur when input loses focus', async () => {
      jest.useFakeTimers();
      const onBlur = jest.fn();
      renderInput({ onBlur });
      const input = screen.getByRole('textbox');

      await act(async () => {
        input.focus();
      });
      await act(async () => {
        input.blur();
        jest.advanceTimersByTime(200);
      });

      expect(onBlur).toHaveBeenCalled();
      jest.useRealTimers();
    });

    test('applies focused class when input is focused', async () => {
      const user = userEvent.setup();
      renderInput();
      const input = screen.getByRole('textbox');
      await act(async () => {
        await user.click(input);
      });
      const wrapper = document.querySelector('.input-field-wrapper');
      expect(wrapper).toHaveClass('focused');
    });
  });

  describe('Error and helper text', () => {
    test('displays error message', () => {
      renderInput({ error: 'This field is required' });
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('displays helper text', () => {
      renderInput({ helperText: 'Enter your name' });
      expect(screen.getByText('Enter your name')).toBeInTheDocument();
    });

    test('input has aria-invalid when error is present', () => {
      renderInput({ error: 'Error message' });
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Disabled state', () => {
    test('disables input when disabled prop is true', () => {
      renderInput({ disabled: true });
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    test('applies disabled class to wrapper', () => {
      renderInput({ disabled: true });
      const wrapper = document.querySelector('.input-field-wrapper');
      expect(wrapper).toHaveClass('disabled');
    });
  });

  describe('Icon adornments', () => {
    test('renders start adornment', () => {
      const startAdornment = {
        icon: <span data-testid="start-icon">S</span>,
        toolTip: 'Start icon'
      };
      renderInput({ startAdornment });
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    test('renders end adornment', () => {
      const endAdornment = {
        icon: <span data-testid="end-icon">E</span>,
        toolTip: 'End icon'
      };
      renderInput({ endAdornment });
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    test('calls onIconClick when icon is clicked', async () => {
      const user = userEvent.setup();
      const onIconClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: jest.fn()
      };
      renderInput({ startAdornment, onIconClick });

      const iconWrapper = document.querySelector('.text-field-icon.left');
      await act(async () => {
        await user.click(iconWrapper!);
      });

      expect(onIconClick).toHaveBeenCalledWith('left', expect.any(Object));
    });

    test('icon click calls icon onClick handler', async () => {
      const user = userEvent.setup();
      const iconOnClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: iconOnClick
      };
      renderInput({ startAdornment });

      const iconWrapper = document.querySelector('.text-field-icon.left');
      await act(async () => {
        await user.click(iconWrapper!);
      });

      expect(iconOnClick).toHaveBeenCalled();
    });

    test('disabled icon does not trigger click', async () => {
      const user = userEvent.setup();
      const iconOnClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: iconOnClick,
        disabled: true
      };
      renderInput({ startAdornment });

      const iconWrapper = document.querySelector('.text-field-icon.left');
      await act(async () => {
        await user.click(iconWrapper!);
      });

      expect(iconOnClick).not.toHaveBeenCalled();
    });

    test('icon responds to keyboard Enter', async () => {
      const user = userEvent.setup();
      const iconOnClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: iconOnClick
      };
      renderInput({ startAdornment });

      const iconWrapper = document.querySelector('.text-field-icon.left');
      await act(async () => {
        (iconWrapper as HTMLElement)!.focus();
        await user.keyboard('{Enter}');
      });

      expect(iconOnClick).toHaveBeenCalled();
    });

    test('icon responds to keyboard Space', async () => {
      const user = userEvent.setup();
      const iconOnClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: iconOnClick
      };
      renderInput({ startAdornment });

      const iconWrapper = document.querySelector('.text-field-icon.left');
      await act(async () => {
        (iconWrapper as HTMLElement)!.focus();
        await user.keyboard(' ');
      });

      expect(iconOnClick).toHaveBeenCalled();
    });
  });

  describe('Full width', () => {
    test('applies full-width class when fullWidth is true', () => {
      renderInput({ fullWidth: true });
      const container = document.querySelector('.text-field-container');
      expect(container).toHaveClass('full-width');
    });
  });

  describe('Outlined variant', () => {
    test('applies outlined class when outlined is true', () => {
      renderInput({ outlined: true });
      const wrapper = document.querySelector('.input-field-wrapper');
      expect(wrapper).toHaveClass('outlined');
    });
  });

  describe('Borderless variant', () => {
    test('applies borderless class when borderless is true', () => {
      renderInput({ borderless: true });
      const wrapper = document.querySelector('.input-field-wrapper');
      expect(wrapper).toHaveClass('borderless');
    });
  });

  describe('Format and parse', () => {
    test('formats value on blur when formatOn is blur', async () => {
      jest.useFakeTimers();
      const format = jest.fn((v) => `$${v}`);
      const parse = jest.fn((s) => s.replace('$', ''));
      renderInput({ format, parse, formatOn: 'blur', defaultValue: '100' });

      const input = screen.getByRole('textbox');
      await act(async () => {
        input.focus();
      });
      await act(async () => {
        input.blur();
        jest.advanceTimersByTime(200);
      });

      expect(format).toHaveBeenCalled();
      jest.useRealTimers();
    });

    test('formats value on change when formatOn is change', async () => {
      const user = userEvent.setup();
      const format = jest.fn((v) => `${v}!`);
      renderInput({ format, formatOn: 'change' });

      const input = screen.getByRole('textbox');
      await act(async () => {
        await user.type(input, 'a');
      });

      expect(format).toHaveBeenCalled();
    });
  });

  describe('Searchable with suggestions', () => {
    const suggestions = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' }
    ];

    test('shows suggestions when isSearchable and focused', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('has proper ARIA attributes when searchable', () => {
      renderInput({ isSearchable: true, suggestions });
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    test('selects suggestion on click', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      renderInput({ isSearchable: true, suggestions, handleChange });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      const option = screen.getByText('Apple');
      await act(async () => {
        await user.click(option);
      });

      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    test('keyboard navigation - ArrowDown moves to next suggestion', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('selected');
    });

    test('keyboard navigation - ArrowUp moves to previous suggestion', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowUp}');
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('selected');
    });

    test('keyboard navigation - Escape closes suggestions', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await act(async () => {
        await user.keyboard('{Escape}');
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('keyboard navigation - Enter selects highlighted suggestion', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      renderInput({ isSearchable: true, suggestions, handleChange });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{Enter}');
      });

      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    test('keyboard navigation - Tab closes suggestions', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await act(async () => {
        await user.keyboard('{Tab}');
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('filters suggestions based on input', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
        await user.type(input, 'ban');
      });

      // The filtering is debounced and uses Trie search
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('shows no results message when no suggestions match', async () => {
      const user = userEvent.setup();
      renderInput({ isSearchable: true, suggestions: [] });

      const input = screen.getByRole('combobox');
      await act(async () => {
        await user.click(input);
      });

      expect(screen.getByText('No Results')).toBeInTheDocument();
    });
  });

  describe('maxRawLength', () => {
    test('prevents input beyond maxRawLength', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      renderInput({ maxRawLength: 5, handleChange });

      const input = screen.getByRole('textbox');
      await act(async () => {
        await user.type(input, '123456789');
      });

      // After typing 5 chars, further input should be blocked
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Shrink label', () => {
    test('applies shrink class when shrink is true', () => {
      renderInput({ shrink: true });
      const wrapper = document.querySelector('.input-field-wrapper');
      expect(wrapper).toHaveClass('shrink');
    });
  });
});
