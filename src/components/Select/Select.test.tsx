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

import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelectProps } from './Select.types';
import userEvent from '@testing-library/user-event';
import Select from './Select';

const gameOptions = [
  { label: 'Elden Ring', value: 'eldenRing' },
  { label: 'God Of War', value: 'godOfWar' },
  { label: 'Red Dead Redemption', value: 'redDeadRedemption' },
  { label: 'The Last of Us', value: 'theLastOfUs' }
];

const defaultProps: SelectProps = {
  id: 'test-select',
  label: 'Test Select',
  options: gameOptions
};

const renderSelect = (props: Partial<SelectProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<Select {...mergedProps} />);
};

describe('Select component', () => {
  describe('basic rendering', () => {
    afterEach(() => {
      jest.clearAllMocks();
      Object.defineProperty(navigator, 'online', {
        writable: true,
        value: true
      });
    });

    test('renders select with label', () => {
      renderSelect();
      expect(screen.getByText('Test Select')).toBeInTheDocument();
    });

    test('renders with default props', () => {
      renderSelect();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).not.toHaveAttribute('disabled');
    });

    test('renders with custom className', () => {
      renderSelect({ className: 'custom-class' });
      const selectInput = document.querySelector('.select-input');
      expect(selectInput).toHaveClass('custom-class');
    });

    test('renders with custom id', () => {
      renderSelect({ id: 'custom-id' });
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-controls', 'custom-id-listbox');
    });

    test('renders with placeholder', () => {
      // Placeholder is visible when there's no label or when label is shrunk
      renderSelect({ placeholder: 'Select a game', label: undefined });
      expect(screen.getByPlaceholderText('Select a game')).toBeInTheDocument();
    });

    test('renders as disabled', () => {
      renderSelect({ disabled: true });
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    test('renders with error message', () => {
      renderSelect({ error: 'This field is required' });
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    test('renders with helper text', () => {
      renderSelect({ helperText: 'Choose your favorite game' });
      expect(screen.getByText('Choose your favorite game')).toBeInTheDocument();
    });
  });

  describe('Value handling', () => {
    test('handles controlled value', () => {
      const { rerender } = renderSelect({ value: 'godOfWar' });
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('God Of War');

      rerender(<Select {...defaultProps} value="eldenRing" />);
      expect(select).toHaveValue('Elden Ring');
    });

    test('handles uncontrolled value with defaultValue', () => {
      renderSelect({ defaultValue: 'eldenRing' });
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('Elden Ring');
    });

    test('displays placeholder when no value is selected', () => {
      // Placeholder is visible when there's no label
      renderSelect({ placeholder: 'Select a game', label: undefined });
      expect(screen.getByPlaceholderText('Select a game')).toBeInTheDocument();
    });
  });

  describe('Dropdown interaction', () => {
    test('opens dropdown on click', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('displays all options when dropdown is opened', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(screen.getByText('Elden Ring')).toBeInTheDocument();
        expect(screen.getByText('God Of War')).toBeInTheDocument();
        expect(screen.getByText('Red Dead Redemption')).toBeInTheDocument();
        expect(screen.getByText('The Last of Us')).toBeInTheDocument();
      });
    });

    test('selects an option on click', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ onChange });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      const option = await screen.findByText('God Of War');
      await act(async () => {
        await user.click(option);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('godOfWar');
      });
    });

    test('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      const option = await screen.findByText('God Of War');
      await act(async () => {
        await user.click(option);
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Search functionality', () => {
    test('displays search input when searchable is true', async () => {
      const user = userEvent.setup();
      renderSelect({ searchable: true });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toBeInTheDocument();
      });
    });

    test('does not display search input when searchable is false', async () => {
      const user = userEvent.setup();
      renderSelect({ searchable: false });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText('Search...');
        expect(searchInput).not.toBeInTheDocument();
      });
    });

    test('filters options based on search text', async () => {
      const user = userEvent.setup();
      renderSelect({ searchable: true });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      const searchInput = await screen.findByPlaceholderText('Search...');
      await act(async () => {
        await user.type(searchInput, 'war');
      });

      await waitFor(() => {
        // Check that the option with "God Of War" is shown (text may be split due to highlighting)
        const option = screen.getByRole('option');
        expect(option.textContent).toBe('God Of War');
      });
    });
  });

  describe('Clearable functionality', () => {
    test('displays clear button when clearable and has value', () => {
      renderSelect({ clearable: true, value: 'godOfWar' });
      const clearButton = screen.getByLabelText('Clear selection');
      expect(clearButton).toBeInTheDocument();
    });

    test('does not display clear button when no value', () => {
      renderSelect({ clearable: true });
      const clearButton = screen.queryByLabelText('Clear selection');
      expect(clearButton).not.toBeInTheDocument();
    });

    test('clears value on clear button click', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ clearable: true, value: 'godOfWar', onChange });

      const clearButton = screen.getByLabelText('Clear selection');
      await act(async () => {
        await user.click(clearButton);
      });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Keyboard navigation', () => {
    test('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        select.focus();
      });

      await act(async () => {
        await user.keyboard('{Enter}');
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });

      await act(async () => {
        await user.keyboard('{Escape}');
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      renderSelect();
      const select = screen.getByRole('combobox');

      expect(select).toHaveAttribute('aria-expanded', 'false');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
      expect(select).toHaveAttribute('aria-controls', 'test-select-listbox');
    });

    test('has proper ARIA attributes when error is present', () => {
      renderSelect({ error: 'Error message' });
      const select = screen.getByRole('combobox');

      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });

    test('has proper ARIA attributes for options', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'godOfWar' });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);

        const selectedOption = options.find((opt) => opt.textContent === 'God Of War');
        expect(selectedOption).toHaveAttribute('aria-selected', 'true');
      });
    });
  });
});
