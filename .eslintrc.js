module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index', 'type'],
          'object',
        ],
        pathGroups: [
          {
            pattern: '*\\.module',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.service',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.controller',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.model',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.interface',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.dto',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.response-dto',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.controller',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.const',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          {
            pattern: '*\\.enum',
            group: 'sibling',
            patternOptions: { matchBase: true },
            position: 'after',
          },
        ],
        'newlines-between': 'never',
      },
    ],
    'import/named': 'off',
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        patterns: ['src'],
      },
    ],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
}
