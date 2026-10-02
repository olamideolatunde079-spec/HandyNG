// @ts-check
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    plugins: {
      react: pluginReact,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Next.js core web vitals
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    ignores: ['node_modules/**', '.next/**'],
  }
);
