// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist/**'] },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: process.cwd()
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        NodeJS: true
      }
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': typescriptPlugin,
      import: importPlugin
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {}
      }
    },
    rules: {
      // Disabled due to Node.js 24 compatibility issue with structuredClone
      // 'no-console': ['error'],
      'react/display-name': 'off',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      camelcase: 'off',
      'comma-dangle': ['error', 'never'],
      'no-inline-comments': 'off',
      'max-len': ['error', { code: 140 }],
      'prefer-promise-reject-errors': 'off',
      'react/jsx-filename-extension': 'off',
      'react/prop-types': 'warn',
      'no-return-assign': 'off',
      'no-useless-escape': 'off',
      'no-param-reassign': 'off',
      'func-names': ['error', 'never'],
      'react/react-in-jsx-scope': 'off',
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }],
      'react/forbid-foreign-prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-redeclare': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off'
    }
  },
  ...storybook.configs['flat/recommended']
];
