/**
 * Frontend ESLint flat config — minimal, fast.
 *
 * TypeScript type-checking is done separately via `tsc --noEmit`.
 * We only enforce basic JS/JSX rules here to keep linting fast on
 * low-memory machines where @typescript-eslint/eslint-plugin is slow to load.
 */
export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'off',
      'no-undef': 'off', // TypeScript handles this
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**'],
  },
];
