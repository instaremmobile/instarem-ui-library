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

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

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

  describe('Multiple selection', () => {
    test('allows selecting multiple options', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ multiple: true, onChange });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      const option1 = await screen.findByText('Elden Ring');
      await act(async () => {
        await user.click(option1);
      });

      expect(onChange).toHaveBeenCalledWith(['eldenRing']);
    });

    test('displays selected items as tags when multiple items selected', () => {
      renderSelect({ multiple: true, value: ['eldenRing', 'godOfWar'] });
      expect(screen.getByText('Elden Ring')).toBeInTheDocument();
      expect(screen.getByText('God Of War')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveValue('');
    });

    test('clears all values in multiple mode', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ multiple: true, value: ['eldenRing', 'godOfWar'], clearable: true, onChange });

      const clearButton = screen.getByLabelText('Clear selection');
      await act(async () => {
        await user.click(clearButton);
      });

      expect(onChange).toHaveBeenCalledWith([]);
    });

    test('deselects option when clicked again in multiple mode', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ multiple: true, value: ['eldenRing'], onChange });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      const option = await screen.findByRole('option', { name: 'Elden Ring' });
      await act(async () => {
        await user.click(option);
      });

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Icon adornments', () => {
    test('renders start adornment', () => {
      const startAdornment = {
        icon: <span data-testid="start-icon">S</span>,
        toolTip: 'Start icon'
      };
      renderSelect({ startAdornment });
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    test('renders end adornment', () => {
      const endAdornment = {
        icon: <span data-testid="end-icon">E</span>,
        toolTip: 'End icon'
      };
      renderSelect({ endAdornment });
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    test('calls onIconClick when icon is clicked', async () => {
      const user = userEvent.setup();
      const onIconClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: jest.fn()
      };
      renderSelect({ startAdornment, onIconClick });

      const iconWrapper = document.querySelector('.select-icon.left');
      await act(async () => {
        await user.click(iconWrapper!);
      });

      expect(onIconClick).toHaveBeenCalledWith('left', expect.any(Object));
    });

    test('disabled icon does not trigger click', async () => {
      const user = userEvent.setup();
      const iconOnClick = jest.fn();
      const startAdornment = {
        icon: <span>Icon</span>,
        onClick: iconOnClick,
        disabled: true
      };
      renderSelect({ startAdornment });

      const iconWrapper = document.querySelector('.select-icon.left');
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
      renderSelect({ startAdornment });

      const iconWrapper = document.querySelector('.select-icon.left');
      await act(async () => {
        (iconWrapper as HTMLElement)!.focus();
        await user.keyboard('{Enter}');
      });

      expect(iconOnClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation extended', () => {
    test('ArrowDown navigates to next option', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('selected');
    });

    test('ArrowUp navigates to previous option', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowUp}');
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('selected');
    });

    test('ArrowDown opens dropdown when closed', async () => {
      const user = userEvent.setup();
      renderSelect();

      const select = screen.getByRole('combobox');
      await act(async () => {
        select.focus();
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('Tab closes dropdown', async () => {
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
        await user.keyboard('{Tab}');
      });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });

    test('Enter selects highlighted option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ onChange });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await act(async () => {
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{Enter}');
      });

      expect(onChange).toHaveBeenCalledWith('eldenRing');
    });
  });

  describe('Full width and outlined', () => {
    test('applies full-width class when fullWidth is true', () => {
      renderSelect({ fullWidth: true });
      const container = document.querySelector('.select-container');
      expect(container).toHaveClass('full-width');
    });

    test('applies outlined class when outlined is true', () => {
      renderSelect({ outlined: true });
      const wrapper = document.querySelector('.select-wrapper');
      expect(wrapper).toHaveClass('outlined');
    });

    test('applies shrink class when shrink is true', () => {
      renderSelect({ shrink: true });
      const wrapper = document.querySelector('.select-wrapper');
      expect(wrapper).toHaveClass('shrink');
    });
  });

  describe('Disabled options', () => {
    test('does not select disabled option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const optionsWithDisabled = [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled', disabled: true }
      ];
      renderSelect({ options: optionsWithDisabled, onChange });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      const disabledOption = await screen.findByText('Disabled');
      await act(async () => {
        await user.click(disabledOption);
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Categories', () => {
    const categorizedOptions = [
      {
        category: 'Action',
        options: [
          { label: 'God Of War', value: 'godOfWar' },
          { label: 'Devil May Cry', value: 'devilMayCry' }
        ]
      },
      {
        category: 'RPG',
        options: [
          { label: 'Elden Ring', value: 'eldenRing' },
          { label: 'Final Fantasy', value: 'finalFantasy' }
        ]
      }
    ];

    test('renders category headers', async () => {
      const user = userEvent.setup();
      renderSelect({ categories: categorizedOptions, options: [] });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('RPG')).toBeInTheDocument();
      });
    });

    test('renders options within categories', async () => {
      const user = userEvent.setup();
      renderSelect({ categories: categorizedOptions, options: [] });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(screen.getByText('God Of War')).toBeInTheDocument();
        expect(screen.getByText('Elden Ring')).toBeInTheDocument();
      });
    });
  });

  describe('Focus and blur', () => {
    test('calls onFocus when focused', async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();
      renderSelect({ onFocus });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      expect(onFocus).toHaveBeenCalled();
    });

    test('calls onBlur when blurred', async () => {
      jest.useFakeTimers();
      const onBlur = jest.fn();
      renderSelect({ onBlur });

      const select = screen.getByRole('combobox');
      await act(async () => {
        select.focus();
      });

      await act(async () => {
        select.blur();
        jest.advanceTimersByTime(200);
      });

      expect(onBlur).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('Clear button keyboard', () => {
    test('clear button responds to Enter key', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ clearable: true, value: 'godOfWar', onChange });

      const clearButton = screen.getByLabelText('Clear selection');
      await act(async () => {
        (clearButton as HTMLElement).focus();
        await user.keyboard('{Enter}');
      });

      expect(onChange).toHaveBeenCalledWith('');
    });

    test('clear button responds to Space key', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ clearable: true, value: 'godOfWar', onChange });

      const clearButton = screen.getByLabelText('Clear selection');
      await act(async () => {
        (clearButton as HTMLElement).focus();
        await user.keyboard(' ');
      });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Options with icons and images', () => {
    test('renders option with icon', async () => {
      const user = userEvent.setup();
      const optionsWithIcons = [
        { label: 'With Icon', value: 'withIcon', icon: <span data-testid="option-icon">🎮</span> }
      ];
      renderSelect({ options: optionsWithIcons });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(screen.getByTestId('option-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    test('shows no results when options array is empty', async () => {
      const user = userEvent.setup();
      renderSelect({ options: [] });

      const select = screen.getByRole('combobox');
      await act(async () => {
        await user.click(select);
      });

      await waitFor(() => {
        expect(screen.getByText('No Results')).toBeInTheDocument();
      });
    });
  });
});
