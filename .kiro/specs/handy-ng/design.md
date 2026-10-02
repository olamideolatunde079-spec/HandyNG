# Design Document — HandyNG Phase 0: Project Planning & Foundation

## Overview

Phase 0 establishes the monorepo skeleton for **HandyNG**, a Local Artisan & Trusted Services Marketplace for Nigeria. No application logic is written in this phase. The deliverable is a fully configured, lint-clean, type-safe, buildable workspace that all subsequent phases build upon.

The workspace is managed with **npm workspaces**, type-checked via a shared `tsconfig.base.json`, and linted/formatted with **ESLint + Prettier**.

---

## Architecture

### Monorepo Layout

```
handy-ng/                          ← Workspace Root
├── package.json                   ← npm workspaces host; root scripts
├── tsconfig.base.json             ← Shared TypeScript compiler base
├── .eslintrc.js                   ← Root ESLint config (all TS files)
├── .prettierrc                    ← Prettier formatting rules
├── .prettierignore                ← Prettier exclusion patterns
├── .gitignore                     ← Git exclusion patterns
├── .env.example                   ← Environment variable template
├── README.md                      ← Project documentation
│
├── frontend/                      ← Package: handy-ng-frontend
│   ├── package.json
│   ├── tsconfig.json              ← Extends ../../tsconfig.base.json
│   ├── .eslintrc.js               ← Extends root + React/Next.js plugins
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── styles/
│           └── globals.css
│
├── backend/                       ← Package: handy-ng-backend
│   ├── package.json
│   ├── tsconfig.json              ← Extends ../../tsconfig.base.json
│   ├── .eslintrc.js               ← Extends root + Node.js overrides
│   └── src/
│       └── index.ts               ← Minimal Express entry point
│
├── supabase/                      ← Package: handy-ng-supabase
│   ├── package.json
│   ├── tsconfig.json              ← Extends ../../tsconfig.base.json
│   ├── migrations/                ← SQL migration files (empty in Phase 0)
│   └── seed/                      ← SQL seed files (empty in Phase 0)
│
└── docs/
    └── README.md                  ← Placeholder documentation
```

### Package Dependency Graph

```
Workspace Root (npm workspaces host)
    ├── handy-ng-frontend     (Next.js, React, Tailwind CSS, Lucide React)
    ├── handy-ng-backend      (Express, ts-node)
    └── handy-ng-supabase     (Supabase CLI tooling)

Shared root-level tooling (hoisted to root node_modules):
    eslint, prettier, typescript
```

No cross-package runtime dependencies exist in Phase 0. Packages are independent; shared tooling is consumed from the hoisted root.

---

## Components

### 1. Workspace Root (`package.json`)

Central orchestrator for all workspace operations.

```json
{
  "name": "handy-ng",
  "version": "0.0.1",
  "private": true,
  "workspaces": ["frontend", "backend", "supabase"],
  "scripts": {
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\""
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "typescript": "^5.4.5"
  }
}
```

**Design notes:**

- `--if-present` ensures the root script does not fail when a package omits a given script.
- `format` runs from the root and covers the entire workspace tree.
- `private: true` prevents accidental publishing of the root package.

---

### 2. Shared TypeScript Configuration (`tsconfig.base.json`)

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "bundler",
  },
}
```

**Design notes:**

- `strict: true` enables the full strict family: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.
- `moduleResolution: "bundler"` is compatible with both Next.js (webpack/turbopack) and modern Node.js resolvers. Individual packages may override with `"node"` or `"node16"` as required.
- No `include`/`exclude` or `paths` at the base level — each package owns its own file scope.

#### Frontend `tsconfig.json`

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "allowJs": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
    },
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"],
}
```

#### Backend `tsconfig.json`

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
}
```

#### Supabase `tsconfig.json`

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "moduleResolution": "node",
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"],
}
```

---

### 3. ESLint Configuration

#### Root `.eslintrc.js` (all TypeScript files in the monorepo)

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    node: true,
    es2022: true,
  },
};
```

**Design note:** `@typescript-eslint/no-unused-vars: "error"` is set explicitly at the root so the unused-variable property (Requirement 7.6) holds across all packages. This rule fires for any variable declared but never read, regardless of name or scope.

#### Frontend `frontend/.eslintrc.js`

```js
module.exports = {
  extends: ['../../.eslintrc.js', 'plugin:react/recommended', 'next/core-web-vitals'],
  plugins: ['react'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
  },
};
```

#### Backend `backend/.eslintrc.js`

```js
module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
};
```

#### Supabase `supabase/.eslintrc.js`

```js
module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
};
```

---

### 4. Prettier Configuration

#### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

#### `.prettierignore`

```
node_modules/
.next/
dist/
build/
*.lock
```

**Design note:** `endOfLine: "lf"` is added to ensure consistent line endings across macOS, Linux, and Windows development environments.

---

### 5. Git Configuration (`.gitignore`)

```gitignore
# Dependencies
node_modules/

# Build outputs
.next/
dist/
build/
*.js.map

# Environment secrets
.env
.env.local
.env.*.local

# OS generated
.DS_Store
Thumbs.db

# IDE / editor
.idea/
.vscode/
!.vscode/extensions.json
!.vscode/settings.json

# TypeScript incremental build cache
*.tsbuildinfo
```

**Design note:** `.vscode/extensions.json` and `.vscode/settings.json` are explicitly un-ignored so shared editor recommendations can be committed.

---

### 6. Environment Variable Template (`.env.example`)

```dotenv
# ─────────────────────────────────────────────
# Supabase (Frontend + Backend)
# ─────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_postgres_connection_string

# ─────────────────────────────────────────────
# Backend (Express API)
# ─────────────────────────────────────────────
PORT=3001
NODE_ENV=development

# ─────────────────────────────────────────────
# Frontend (Next.js)
# ─────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### 7. Package Configurations

#### `frontend/package.json`

```json
{
  "name": "handy-ng-frontend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-react": "^0.378.0",
    "next": "^14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.9.0",
    "@typescript-eslint/parser": "^7.9.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.3",
    "eslint-plugin-react": "^7.34.1",
    "postcss": "^8.4.38",
    "prettier": "^3.2.5",
    "typescript": "^5.4.5"
  }
}
```

#### `backend/package.json`

```json
{
  "name": "handy-ng-backend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint 'src/**/*.ts'",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.12",
    "@typescript-eslint/eslint-plugin": "^7.9.0",
    "@typescript-eslint/parser": "^7.9.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

#### `supabase/package.json`

```json
{
  "name": "handy-ng-supabase",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "supabase": "^1.163.6",
    "typescript": "^5.4.5"
  }
}
```

---

### 8. Minimum Entry-Point Source Files

Phase 0 requires the smallest possible source files that satisfy `typecheck` and `build` without TODO stubs or placeholder logic.

#### `frontend/src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HandyNG',
  description: 'Local Artisan & Trusted Services Marketplace for Nigeria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### `frontend/src/app/page.tsx`

```tsx
export default function Home() {
  return (
    <main>
      <h1>HandyNG</h1>
    </main>
  );
}
```

#### `backend/src/index.ts`

```ts
import express from 'express';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## Data Models

Phase 0 introduces no application data models. The data layer (Supabase schema, RLS policies, TypeScript domain types) is deferred to Phase 1 and beyond.

The only structured data defined in Phase 0 is **configuration**:

| File                  | Format          | Purpose                          |
| --------------------- | --------------- | -------------------------------- |
| `package.json` (×4)   | JSON            | npm package metadata and scripts |
| `tsconfig*.json` (×4) | JSONC           | TypeScript compiler options      |
| `.eslintrc.js` (×4)   | CommonJS module | ESLint rule sets                 |
| `.prettierrc`         | JSON            | Prettier formatting rules        |
| `.env.example`        | dotenv          | Environment variable keys        |

---

## Interfaces

### Root Script Interface

All cross-package operations are invoked through four root-level npm scripts:

| Script              | Command                                       | Purpose                                     |
| ------------------- | --------------------------------------------- | ------------------------------------------- |
| `npm run lint`      | `npm run lint --workspaces --if-present`      | Static analysis across all packages         |
| `npm run typecheck` | `npm run typecheck --workspaces --if-present` | Type-checking across all packages           |
| `npm run build`     | `npm run build --workspaces --if-present`     | Compilation/build across all packages       |
| `npm run format`    | `prettier --write "**/*.{ts,tsx,js,json,md}"` | Code formatting across the entire workspace |

### Per-Package Script Contract

Each workspace package exposes a consistent subset of scripts:

| Package  | `lint`                 | `typecheck`    | `build`      |
| -------- | ---------------------- | -------------- | ------------ |
| frontend | `next lint`            | `tsc --noEmit` | `next build` |
| backend  | `eslint 'src/**/*.ts'` | `tsc --noEmit` | `tsc`        |
| supabase | —                      | `tsc --noEmit` | —            |

The `--if-present` flag on root scripts means the absence of a script in `supabase` does not cause the root `lint` or `build` commands to fail.

---

## Error Handling

### npm Script Failures

`npm run <script> --workspaces` propagates non-zero exit codes from individual packages. The npm CLI prints the failing package name as part of its standard output, satisfying Requirement 10.5 without any custom error handling code.

Example output when a package fails:

```
npm error Lifecycle script `lint` failed with error:
npm error     in workspace: handy-ng-backend@0.0.1
```

### TypeScript Errors

`tsc --noEmit` exits with code 1 and prints file-path-prefixed error messages when type errors are found. No custom error handling is required.

### ESLint Errors

ESLint exits with code 1 when lint errors are found and prints `<file>:<line>:<col>: error <message>` to stdout. The package-level script exposes these errors to the root invocation.

### Missing `.env` Variables

Phase 0 does not execute application logic, so missing `.env` variables do not cause runtime failures. The `.env.example` file documents required variables for developers. The `dotenv` library (and its error handling) is introduced in the phase that first requires environment variables at runtime.

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Unused Variables Are Always Reported as Lint Errors

_For any_ TypeScript source file in any workspace package that declares a variable, parameter, or import that is never referenced, running ESLint against that file SHALL produce at least one error and exit with a non-zero code.

**Validates: Requirements 7.6**

---

### Property 2: Prettier Formatting Is Idempotent

_For any_ file content written to a workspace source file, applying `npm run format` once and then applying it a second time SHALL produce identical file content after both runs — the second run SHALL make zero changes.

**Validates: Requirements 10.4**

---

### Property 3: Workspace Source Files Contain No TODO Markers

_For any_ source file under `frontend/src/`, `backend/src/`, or `supabase/` in the committed workspace, scanning the file content SHALL find zero occurrences of the strings `TODO`, `FIXME`, `HACK`, or `XXX`.

**Validates: Requirements 10.6**

---

## Verification Sequence

The complete Phase 0 acceptance sequence, executed at the workspace root:

```bash
# 1. Install all workspace dependencies
npm install

# 2. Verify no high-severity vulnerabilities
npm audit --audit-level=high

# 3. Format all source files
npm run format

# 4. Check lint across all packages
npm run lint

# 5. Check types across all packages
npm run typecheck

# 6. Build all packages
npm run build

# 7. Verify format idempotence (second run must report no changes)
npm run format -- --check
```

All six commands must exit with code `0` for Phase 0 to be considered complete.
