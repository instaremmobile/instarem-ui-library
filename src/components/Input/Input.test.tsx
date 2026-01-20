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
  });
});
