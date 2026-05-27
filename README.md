# instarem-ui-library

A React component library for Instarem's form elements — built with TypeScript, SCSS, and Material-UI.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
  - [Button](#button)
  - [Input](#input)
  - [Select](#select)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Toggle](#toggle)
  - [DatePicker](#datepicker)
  - [Modal](#modal)
- [Utilities](#utilities)
- [Design Tokens](#design-tokens)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Storybook](#storybook)
- [Code Quality](#code-quality)

---

## Installation

```bash
npm install instarem-ui-library
```

**Peer dependencies** — make sure these are installed in your project:

```bash
npm install react@19
```

---

## Usage

Import components directly from the package:

```tsx
import {
  Button,
  Input,
  Select,
  Checkbox,
  Toggle,
  RadioButton,
  DatePicker,
  Modal
} from 'instarem-ui-library';
```

---

## Components

### Button

A flexible button component supporting multiple variants, sizes, loading state, and icons.

```tsx
import { Button } from 'instarem-ui-library';

<Button variant="primary" size="medium" onClick={handleClick}>
  Submit
</Button>

<Button variant="secondary" isLoading>
  Processing...
</Button>

<Button variant="text" startIcon={<SomeIcon />} fullWidth>
  Learn More
</Button>
```

| Prop        | Type                                 | Default     | Description                    |
| ----------- | ------------------------------------ | ----------- | ------------------------------ |
| `variant`   | `'primary' \| 'secondary' \| 'text'` | `'primary'` | Visual style                   |
| `size`      | `'small' \| 'medium' \| 'large'`     | `'medium'`  | Button size                    |
| `isLoading` | `boolean`                            | `false`     | Shows a loading spinner        |
| `disabled`  | `boolean`                            | `false`     | Disables interaction           |
| `fullWidth` | `boolean`                            | `false`     | Stretches to container width   |
| `startIcon` | `React.ReactNode`                    | —           | Icon rendered before the label |
| `endIcon`   | `React.ReactNode`                    | —           | Icon rendered after the label  |
| `className` | `string`                             | —           | Additional CSS class           |

Extends all native `<button>` HTML attributes.

---

### Input

An advanced text input with support for suggestions, search, network-fetched data, value formatting, adornments, and more.

```tsx
import { Input } from 'instarem-ui-library';

// Basic
<Input label="Email" placeholder="Enter email" />

// With suggestions
<Input
  label="Country"
  suggestions={[{ label: 'Singapore', value: 'SG' }, { label: 'India', value: 'IN' }]}
  isSearchable
/>

// With network fetch
<Input
  label="Currency"
  fetchFunction={fetchCurrencies}
  retryConfig={{ retries: 3, delay: 500 }}
/>

// With value formatting (e.g. amount)
<Input
  label="Amount"
  format={(val) => `$${parseFloat(val).toFixed(2)}`}
  parse={(display) => display.replace('$', '')}
  formatOn="blur"
/>
```

| Prop             | Type                           | Default | Description                                              |
| ---------------- | ------------------------------ | ------- | -------------------------------------------------------- |
| `label`          | `string`                       | —       | Floating label text                                      |
| `error`          | `string`                       | —       | Error message shown below the field                      |
| `helperText`     | `string`                       | —       | Helper text shown below the field                        |
| `shrink`         | `boolean`                      | —       | Forces label to shrink                                   |
| `startAdornment` | `IconProps`                    | —       | Icon config for the left side                            |
| `endAdornment`   | `IconProps`                    | —       | Icon config for the right side                           |
| `iconSize`       | `number`                       | —       | Size of adornment icons in px                            |
| `clearable`      | `boolean`                      | —       | Shows a clear button when field has value                |
| `fullWidth`      | `boolean`                      | —       | Stretches to container width                             |
| `suggestions`    | `SuggestionType[]`             | —       | Static list of autocomplete suggestions                  |
| `isSearchable`   | `boolean`                      | —       | Enables Trie-based prefix search on suggestions          |
| `fetchFunction`  | `() => Promise<unknown>`       | —       | Async function to load suggestions from a network source |
| `retryConfig`    | `Partial<RetryConfig>`         | —       | Retry configuration for `fetchFunction`                  |
| `handleChange`   | `(value: string) => void`      | —       | Callback with the raw string value                       |
| `outlined`       | `boolean`                      | —       | Outlined style variant                                   |
| `borderless`     | `boolean`                      | —       | Removes border styling                                   |
| `format`         | `(value: any) => string`       | —       | Transforms internal value to display string              |
| `parse`          | `(display: string) => any`     | —       | Transforms display string back to internal value         |
| `formatOn`       | `'change' \| 'blur' \| 'none'` | —       | When to apply the format function                        |
| `rawOnChange`    | `boolean`                      | —       | Passes raw (unformatted) value to `onChange`             |
| `maxRawLength`   | `number`                       | —       | Max length of the raw (pre-format) value                 |

Extends all native `<input>` HTML attributes. `IconProps`: `{ icon, onClick?, toolTip?, disabled?, className? }`.

---

### Select

A feature-rich dropdown with search, multi-select, categories, async loading, and icon adornments.

```tsx
import { Select } from 'instarem-ui-library';

// Basic
<Select
  label="Country"
  options={[{ label: 'Singapore', value: 'SG' }, { label: 'India', value: 'IN' }]}
  onChange={(val) => console.log(val)}
/>

// Searchable multi-select with categories
<Select
  label="Currencies"
  multiple
  searchable
  clearable
  categories={[
    { category: 'Asia', options: [{ label: 'SGD', value: 'SGD' }] },
    { category: 'Europe', options: [{ label: 'EUR', value: 'EUR' }] },
  ]}
/>

// Network-loaded options
<Select
  label="Banks"
  fetchFunction={fetchBanks}
  retryConfig={{ retries: 2 }}
/>
```

| Prop             | Type                                  | Default | Description                                    |
| ---------------- | ------------------------------------- | ------- | ---------------------------------------------- |
| `options`        | `OptionType[]`                        | —       | Flat list of options                           |
| `categories`     | `CategoryType[]`                      | —       | Grouped options (max 5 categories recommended) |
| `value`          | `string \| string[]`                  | —       | Controlled value                               |
| `defaultValue`   | `string \| string[]`                  | —       | Uncontrolled default value                     |
| `multiple`       | `boolean`                             | —       | Enables multi-select                           |
| `searchable`     | `boolean`                             | —       | Shows a search field inside the dropdown       |
| `clearable`      | `boolean`                             | —       | Shows a clear button                           |
| `fetchFunction`  | `() => Promise<unknown>`              | —       | Async function to load options                 |
| `retryConfig`    | `Partial<RetryConfig>`                | —       | Retry config for `fetchFunction`               |
| `label`          | `string`                              | —       | Floating label                                 |
| `error`          | `string`                              | —       | Error message                                  |
| `helperText`     | `string`                              | —       | Helper text                                    |
| `placeholder`    | `string`                              | —       | Placeholder text                               |
| `fullWidth`      | `boolean`                             | —       | Stretches to container width                   |
| `outlined`       | `boolean`                             | —       | Outlined style variant                         |
| `shrink`         | `boolean`                             | —       | Forces label to shrink                         |
| `disabled`       | `boolean`                             | —       | Disables the select                            |
| `startAdornment` | `IconProps`                           | —       | Left icon                                      |
| `endAdornment`   | `IconProps`                           | —       | Right icon                                     |
| `onChange`       | `(value: string \| string[]) => void` | —       | Change callback                                |
| `onFocus`        | `FocusEventHandler`                   | —       | Focus callback                                 |
| `onBlur`         | `FocusEventHandler`                   | —       | Blur callback                                  |

`OptionType`: `{ label, value, disabled?, icon?, image? }`. `CategoryType`: `{ category, options: OptionType[] }`.

---

### Checkbox

An accessible checkbox with indeterminate state support.

```tsx
import { Checkbox } from 'instarem-ui-library';

<Checkbox
  label="Accept Terms"
  checked={accepted}
  onChange={(checked) => setAccepted(checked)}
/>

// Indeterminate (e.g. select-all with partial selection)
<Checkbox
  label="Select All"
  checked={false}
  indeterminate={someSelected}
  onChange={handleSelectAll}
/>
```

| Prop               | Type                         | Default | Description                        |
| ------------------ | ---------------------------- | ------- | ---------------------------------- |
| `label`            | `string`                     | —       | **(required)** Label text          |
| `checked`          | `boolean`                    | —       | **(required)** Checked state       |
| `onChange`         | `(checked: boolean) => void` | —       | Change callback                    |
| `indeterminate`    | `boolean`                    | `false` | Renders indeterminate visual state |
| `disabled`         | `boolean`                    | `false` | Disables interaction               |
| `required`         | `boolean`                    | —       | Marks field as required            |
| `name`             | `string`                     | —       | Input name attribute               |
| `id`               | `string`                     | —       | Input id attribute                 |
| `className`        | `string`                     | —       | Additional CSS class               |
| `aria-describedby` | `string`                     | —       | ARIA description reference         |
| `aria-labelledby`  | `string`                     | —       | ARIA label reference               |

---

### Radio

A styled radio button with variant and size options.

```tsx
import { RadioButton } from 'instarem-ui-library';

<RadioButton
  name="paymentMethod"
  value="card"
  label="Credit Card"
  checked={selected === 'card'}
  onChange={(e) => setSelected(e.target.value)}
/>;
```

| Prop               | Type                                                | Default | Description                     |
| ------------------ | --------------------------------------------------- | ------- | ------------------------------- |
| `value`            | `string`                                            | —       | **(required)** Radio value      |
| `name`             | `string`                                            | —       | **(required)** Radio group name |
| `label`            | `string`                                            | —       | Label text                      |
| `checked`          | `boolean`                                           | —       | Checked state                   |
| `disabled`         | `boolean`                                           | —       | Disables interaction            |
| `size`             | `'small' \| 'medium' \| 'large'`                    | —       | Size variant                    |
| `variant`          | `'primary' \| 'secondary' \| 'success' \| 'danger'` | —       | Color variant                   |
| `onChange`         | `ChangeEventHandler`                                | —       | Change callback                 |
| `onFocus`          | `FocusEventHandler`                                 | —       | Focus callback                  |
| `onBlur`           | `FocusEventHandler`                                 | —       | Blur callback                   |
| `aria-label`       | `string`                                            | —       | ARIA label                      |
| `aria-describedby` | `string`                                            | —       | ARIA description reference      |

---

### Toggle

A toggle switch component.

```tsx
import { Toggle } from 'instarem-ui-library';

<Toggle
  label="Enable notifications"
  checked={enabled}
  onChange={(value) => setEnabled(value)}
  labelPosition="right"
/>;
```

| Prop            | Type                      | Default | Description                            |
| --------------- | ------------------------- | ------- | -------------------------------------- |
| `label`         | `string`                  | —       | Label text                             |
| `checked`       | `boolean`                 | —       | Checked state                          |
| `onChange`      | `(value: boolean) => any` | —       | Change callback                        |
| `labelPosition` | `'left' \| 'right'`       | —       | Label placement relative to the toggle |

Extends all native `<input>` HTML attributes (except `onChange`).

---

### DatePicker

A mobile-first date picker built on Material-UI X Date Pickers with `date-fns`.

```tsx
import { DatePicker } from 'instarem-ui-library';

<DatePicker
  label="Date of Birth"
  value={date}
  onChange={(val) => setDate(val)}
  minDate={new Date('1900-01-01')}
  maxDate={new Date()}
  format="dd/MM/yyyy"
/>;
```

| Prop          | Type                            | Default | Description                                    |
| ------------- | ------------------------------- | ------- | ---------------------------------------------- |
| `value`       | `Date \| null`                  | —       | Controlled date value                          |
| `onChange`    | `(value: Date \| null) => void` | —       | Change callback                                |
| `label`       | `string`                        | —       | Floating label                                 |
| `placeholder` | `string`                        | —       | Placeholder text                               |
| `error`       | `string`                        | —       | Error message                                  |
| `helperText`  | `string`                        | —       | Helper text                                    |
| `disabled`    | `boolean`                       | —       | Disables the picker                            |
| `fullWidth`   | `boolean`                       | —       | Stretches to container width                   |
| `outlined`    | `boolean`                       | —       | Outlined style variant                         |
| `minDate`     | `Date`                          | —       | Earliest selectable date                       |
| `maxDate`     | `Date`                          | —       | Latest selectable date                         |
| `format`      | `string`                        | —       | Display format string (date-fns format tokens) |
| `className`   | `string`                        | —       | Additional CSS class                           |

---

### Modal

A dialog component with animation, keyboard dismissal, and imperative ref API.

```tsx
import { Modal } from 'instarem-ui-library';

// Controlled usage
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Transfer" closeOverlayClick>
  <p>Are you sure you want to proceed?</p>
</Modal>;

// Imperative ref usage
const modalRef = useRef<ModalRef>(null);

<Modal ref={modalRef} isOpen={isOpen} onClose={onClose}>
  <p>Content here</p>
</Modal>;

// Open/close programmatically
modalRef.current?.close();
```

| Prop                | Type              | Default | Description                                   |
| ------------------- | ----------------- | ------- | --------------------------------------------- |
| `isOpen`            | `boolean`         | —       | **(required)** Controls visibility            |
| `onClose`           | `() => void`      | —       | **(required)** Called when modal should close |
| `onOpen`            | `() => void`      | —       | Called when modal opens                       |
| `title`             | `string`          | —       | Header title text                             |
| `showCloseButton`   | `boolean`         | `true`  | Shows the × close button                      |
| `closeOverlayClick` | `boolean`         | —       | Closes on overlay click                       |
| `className`         | `string`          | —       | Additional CSS class                          |
| `children`          | `React.ReactNode` | —       | **(required)** Modal body content             |

The component also accepts a `ref` typed as `ModalRef` with `open()` and `close()` methods. Pressing `Escape` always closes the modal.

---

## Utilities

The library also exports utility modules for use in consuming applications:

```tsx
import { COLORS, cn, NetworkManager, Trie, TrieManager } from 'instarem-ui-library';
```

| Export           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `COLORS`         | Design token colour map (see [Design Tokens](#design-tokens)) |
| `cn`             | Class name utility — thin wrapper around `clsx`               |
| `NetworkManager` | Axios-based HTTP client with configurable retry logic         |
| `Trie`           | Prefix-tree data structure for efficient string search        |
| `TrieManager`    | Higher-level manager for Trie operations                      |

---

## Design Tokens

```ts
import { COLORS } from 'instarem-ui-library';

// Available tokens
COLORS.brandPrimary; // '#fe0095' — Instarem brand pink
COLORS.brandPrimaryHover; // '#bf0070' — Hover state
COLORS.colorWhite; // '#fff'
COLORS.colorBlack; // '#000'
COLORS.colorLinkText; // '#007AFF' — Link blue
COLORS.colorError; // '#f92929' — Error red
COLORS.colorBorderGrey; // '#a9a9a9' — Border grey
```

---

## Development

```bash
# Install dependencies
npm install

# Start Storybook (hot-reload dev environment on port 6006)
npm run storybook
```

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

Coverage thresholds enforced:

| Metric     | Threshold |
| ---------- | --------- |
| Branches   | 70%       |
| Functions  | 75%       |
| Lines      | 80%       |
| Statements | 80%       |

Tests are co-located with components (`ComponentName.test.tsx`) and use Jest + React Testing Library.

---

## Building

```bash
npm run build
```

The build pipeline:

1. Removes `dist/`
2. Emits TypeScript declaration files via `tsc`
3. Resolves path aliases with `tsc-alias`
4. Bundles with Rollup into `dist/bundle.js` (ES module)

Output files:

| File              | Description                 |
| ----------------- | --------------------------- |
| `dist/bundle.js`  | ES module bundle            |
| `dist/index.d.ts` | TypeScript type definitions |

---

## Storybook

```bash
# Development server (port 6006)
npm run storybook

# Build static Storybook
npm run storybook-build
```

Stories are co-located with each component (`ComponentName.stories.tsx`) and use `autodocs` for automatic prop documentation. Visual regression testing is supported via Chromatic.

---

## Code Quality

```bash
# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Type check
npm run type-check

# Format source files
npm run format
```

Pre-commit hooks (Husky) automatically run linting, type-checking, tests, and coverage checks before every commit.

---

## Project Structure

```
instarem-ui-library/
├── src/
│   ├── components/          # UI components
│   │   ├── Button/
│   │   ├── Checkbox/
│   │   ├── DatePicker/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Radio/
│   │   ├── Select/
│   │   └── Toggle/
│   ├── lib/                 # Utilities (Trie, NetworkManager, COLORS, cn)
│   ├── styles/              # Global SCSS and styled-components
│   └── index.ts             # Package entry point
├── .storybook/              # Storybook configuration
├── .github/                 # GitHub Actions workflows
├── .husky/                  # Pre-commit hooks
├── rollup.config.js         # Build configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.ts           # Test configuration
└── eslint.config.js         # Lint configuration
```

Each component follows the same structure:

```
ComponentName/
├── ComponentName.tsx          # Component implementation
├── ComponentName.types.ts     # TypeScript interfaces
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
└── component-styles.scss      # Component styles
```

---

## License

MIT
