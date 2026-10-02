// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['src/**/*.ts'],
  extends: [...tseslint.configs.recommended],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
});
