import tseslint from 'typescript-eslint';

/** @type {import("typescript-eslint").Config} */
const config = tseslint.config(
  // Apply to all TypeScript source files across the monorepo
  {
    files: ['backend/src/**/*.ts', 'supabase/**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Ignore generated and installed files
  {
    ignores: ['node_modules/**', 'frontend/**', '**/dist/**', '**/.next/**', '**/*.tsbuildinfo'],
  }
);

export default config;
