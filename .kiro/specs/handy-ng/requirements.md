# Requirements Document

## Introduction

HandyNG is a Local Artisan & Trusted Services Marketplace for Nigeria. This document covers **Phase 0 — Project Planning & Foundation**: the complete foundational scaffolding of the monorepo before any application feature is built. The goal is to produce a properly structured, lint-clean, type-safe, and buildable workspace that all subsequent phases can build upon.

The monorepo hosts three top-level packages:

- `frontend` — Next.js + TypeScript + Tailwind CSS
- `backend` — Node.js + Express + TypeScript
- `supabase` — Supabase configuration, migrations, and seed files

It also contains a `docs/` directory for project documentation. The workspace is managed with **npm workspaces**, type-checked via a shared `tsconfig.base.json`, and linted/formatted with **ESLint + Prettier**.

---

## Glossary

- **Monorepo**: A single Git repository containing multiple related packages managed together.
- **Workspace Root**: The top-level directory of the monorepo containing `package.json` with the `workspaces` field.
- **Package**: One of the npm workspace members: `frontend`, `backend`, or `supabase`.
- **Scaffolding CLI**: The automated script or sequence of commands that initialises the project structure.
- **tsconfig.base.json**: The shared TypeScript compiler configuration file at the workspace root that all per-package `tsconfig.json` files extend.
- **ESLint**: The static analysis tool used to find and fix problems in TypeScript/JavaScript code.
- **Prettier**: The opinionated code formatter applied to TypeScript, JavaScript, JSON, and Markdown files.
- **Typecheck**: The process of running `tsc --noEmit` (or equivalent) to verify type correctness without emitting output files.
- **Lint**: The process of running ESLint across all workspace packages.
- **Build**: The process of compiling TypeScript source files to JavaScript output (or generating a production Next.js build for the frontend).
- **RLS**: Row-Level Security policies in Supabase PostgreSQL.
- **`.env.example`**: A committed file listing all required environment variable keys with placeholder values and explanatory comments, containing no real secrets.

---

## Requirements

### Requirement 1 — Monorepo Directory Structure

**User Story:** As a developer joining the project, I want a clearly defined directory structure, so that I can navigate the codebase and locate each concern without ambiguity.

#### Acceptance Criteria

1. THE Workspace Root SHALL contain the following top-level directories: `frontend/`, `backend/`, `supabase/`, and `docs/`.
2. THE `frontend/` directory SHALL contain a `src/` subdirectory as the root for all Next.js application source files.
3. THE `backend/` directory SHALL contain a `src/` subdirectory as the root for all Express application source files.
4. THE `supabase/` directory SHALL contain `migrations/` and `seed/` subdirectories.
5. THE `docs/` directory SHALL contain at minimum a `README.md` placeholder file.
6. THE Workspace Root SHALL contain a `package.json`, `tsconfig.base.json`, `.eslintrc.js` (or `.eslintrc.json`), `.prettierrc`, `.env.example`, `.gitignore`, and `README.md` at the top level.

---

### Requirement 2 — npm Workspaces Initialisation

**User Story:** As a developer, I want npm workspaces configured, so that all packages share a single `node_modules` hoisting and I can run cross-package scripts from the workspace root.

#### Acceptance Criteria

1. THE Workspace Root `package.json` SHALL declare a `"workspaces"` field listing `"frontend"`, `"backend"`, and `"supabase"` as workspace members.
2. THE `frontend/` directory SHALL contain its own `package.json` with `"name": "handy-ng-frontend"` and the required Next.js, React, TypeScript, Tailwind CSS, and Lucide React dependencies.
3. THE `backend/` directory SHALL contain its own `package.json` with `"name": "handy-ng-backend"` and the required Express and TypeScript dependencies.
4. THE `supabase/` directory SHALL contain its own `package.json` with `"name": "handy-ng-supabase"` scoped to Supabase-related tooling dependencies.
5. WHEN `npm install` is executed at the Workspace Root, THE npm CLI SHALL hoist shared dependencies into the root `node_modules/` and create symlinks for workspace packages without errors.
6. THE Workspace Root `package.json` SHALL declare root-level scripts: `lint`, `typecheck`, and `build`, each delegating to the corresponding script across all workspace packages using `npm run <script> --workspaces --if-present`.

---

### Requirement 3 — Git Initialisation

**User Story:** As a developer, I want the repository initialised with a proper `.gitignore`, so that build artefacts, secrets, and generated files are never committed to version control.

#### Acceptance Criteria

1. THE Workspace Root SHALL be a Git repository, evidenced by the presence of a `.git/` directory.
2. THE `.gitignore` file at the Workspace Root SHALL exclude `node_modules/`, `.next/`, `dist/`, `build/`, `.env`, `.env.local`, `.env.*.local`, and `*.js.map`.
3. THE `.gitignore` SHALL exclude OS-generated files including `.DS_Store` and `Thumbs.db`.
4. THE `.gitignore` SHALL exclude IDE/editor directories including `.idea/` and `.vscode/` (excluding any shared, committed VSCode settings files).
5. WHEN `git status` is run on a freshly initialised workspace with all files staged, THE Git CLI SHALL report no untracked sensitive files (e.g., `.env` files containing real secrets).

---

### Requirement 4 — Environment Variable Template

**User Story:** As a developer onboarding to the project, I want a committed `.env.example` file, so that I know every environment variable the application requires without exposing real credentials.

#### Acceptance Criteria

1. THE Workspace Root SHALL contain a `.env.example` file committed to version control.
2. THE `.env.example` SHALL list all environment variable keys required by the `frontend`, `backend`, and `supabase` packages with placeholder values (e.g., `your_value_here`).
3. THE `.env.example` SHALL include inline comments describing the purpose of each variable group (e.g., `# Supabase`, `# Backend`, `# Frontend`).
4. THE `.env.example` SHALL include at minimum: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `PORT`, and `NODE_ENV`.
5. THE `.env` file SHALL be listed in `.gitignore` so that real credentials are never committed.

---

### Requirement 5 — Project README

**User Story:** As a developer or contributor, I want a root-level README, so that I can understand the project purpose, structure, and how to set it up locally in under five minutes.

#### Acceptance Criteria

1. THE Workspace Root `README.md` SHALL contain a project title and a one-paragraph description of HandyNG.
2. THE `README.md` SHALL contain a "Project Structure" section documenting each top-level directory and its purpose.
3. THE `README.md` SHALL contain a "Getting Started" section with step-by-step instructions covering: cloning the repository, copying `.env.example` to `.env`, running `npm install`, and running `npm run lint`, `npm run typecheck`, and `npm run build`.
4. THE `README.md` SHALL contain a "Tech Stack" section listing: Next.js, Express, TypeScript, Tailwind CSS, Supabase, and Lucide React, each with a brief one-line description.
5. THE `README.md` SHALL contain a "Development Phases" section listing all 15 phases by name and indicating that Phase 0 is the current phase.

---

### Requirement 6 — Shared TypeScript Configuration

**User Story:** As a developer, I want a shared TypeScript base configuration, so that all packages enforce consistent compiler settings and type-safety rules without duplicating configuration.

#### Acceptance Criteria

1. THE Workspace Root SHALL contain a `tsconfig.base.json` file that defines shared compiler options applicable to all packages.
2. THE `tsconfig.base.json` SHALL enable at minimum: `"strict": true`, `"esModuleInterop": true`, `"skipLibCheck": true`, `"forceConsistentCasingInFileNames": true`, and `"resolveJsonModule": true`.
3. THE `frontend/tsconfig.json` SHALL extend `../../tsconfig.base.json` (or the equivalent relative path) and add Next.js-specific compiler options including `"jsx": "preserve"` and `"lib": ["dom", "dom.iterable", "esnext"]`.
4. THE `backend/tsconfig.json` SHALL extend the root `tsconfig.base.json` and set `"module": "commonjs"`, `"target": "es2020"`, and `"outDir": "./dist"`.
5. THE `supabase/tsconfig.json` SHALL extend the root `tsconfig.base.json` with options appropriate for a Node.js tooling context.
6. WHEN `npm run typecheck` is executed at the Workspace Root with only placeholder source files present, THE TypeScript compiler SHALL exit with code `0` and report zero errors.

---

### Requirement 7 — ESLint Configuration

**User Story:** As a developer, I want ESLint configured across all packages, so that code quality issues are caught consistently before code is merged.

#### Acceptance Criteria

1. THE Workspace Root SHALL contain an ESLint configuration file (`.eslintrc.js` or `.eslintrc.json`) that defines rules applicable to all TypeScript files in the monorepo.
2. THE ESLint configuration SHALL extend `eslint:recommended` and `plugin:@typescript-eslint/recommended`.
3. THE ESLint configuration SHALL use `@typescript-eslint/parser` as the parser and set `parserOptions.project` to reference the relevant `tsconfig.json` for each package.
4. THE `frontend/` package SHALL have an ESLint configuration that additionally extends `plugin:react/recommended` and `next/core-web-vitals`.
5. WHEN `npm run lint` is executed at the Workspace Root against the initial scaffolded source files, THE ESLint CLI SHALL exit with code `0` and report zero errors.
6. IF a TypeScript source file contains an unused variable, THEN THE ESLint CLI SHALL report a lint error for that file.

---

### Requirement 8 — Prettier Configuration

**User Story:** As a developer, I want Prettier configured project-wide, so that all code is automatically formatted to a consistent style regardless of editor or contributor.

#### Acceptance Criteria

1. THE Workspace Root SHALL contain a `.prettierrc` file (JSON or YAML format) defining the project's formatting rules.
2. THE `.prettierrc` SHALL specify at minimum: `"semi": true`, `"singleQuote": true`, `"tabWidth": 2`, `"trailingComma": "es5"`, and `"printWidth": 100`.
3. THE Workspace Root SHALL contain a `.prettierignore` file that excludes `node_modules/`, `.next/`, `dist/`, and `build/` from formatting.
4. THE Workspace Root `package.json` SHALL include a `"format"` script that runs `prettier --write "**/*.{ts,tsx,js,json,md}"` scoped to the workspace.
5. WHEN `npm run format` is executed, THE Prettier CLI SHALL exit with code `0` and apply formatting to all in-scope files without errors.

---

### Requirement 9 — Required Dependencies Only

**User Story:** As a developer, I want only the dependencies required for Phase 0 to be installed, so that the project starts lean and future phases add dependencies as needed.

#### Acceptance Criteria

1. THE `frontend/package.json` SHALL declare as dependencies: `next`, `react`, `react-dom`, `lucide-react`, and `tailwindcss` (with `postcss` and `autoprefixer` as devDependencies), and `typescript`, `@types/react`, `@types/react-dom`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint`, `eslint-config-next`, `prettier` as devDependencies.
2. THE `backend/package.json` SHALL declare as dependencies: `express` and as devDependencies: `typescript`, `@types/express`, `@types/node`, `ts-node`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint`, `prettier`.
3. THE `supabase/package.json` SHALL declare as devDependencies: `supabase` (the Supabase CLI package) and `typescript`.
4. THE Workspace Root `package.json` SHALL declare as devDependencies only the tools needed at the root level: `eslint`, `prettier`, and `typescript`.
5. IF a dependency is not required for Phase 0 scaffolding and verification, THEN THE corresponding `package.json` SHALL NOT include that dependency.
6. WHEN `npm install` completes, THE workspace SHALL have zero high-severity vulnerabilities as reported by `npm audit`.

---

### Requirement 10 — Project Verification

**User Story:** As a developer completing Phase 0, I want to run a single verification sequence, so that I can confirm the entire foundation is correctly set up before beginning Phase 1.

#### Acceptance Criteria

1. WHEN `npm run lint` is executed at the Workspace Root, THE ESLint CLI SHALL exit with code `0` across all workspace packages.
2. WHEN `npm run typecheck` is executed at the Workspace Root, THE TypeScript compiler SHALL exit with code `0` across all workspace packages.
3. WHEN `npm run build` is executed at the Workspace Root, THE build toolchain SHALL exit with code `0` for all workspace packages that define a `build` script.
4. WHEN `npm run format` is executed at the Workspace Root, THE Prettier CLI SHALL exit with code `0` and report no unformatted files when run a second time immediately after.
5. IF any of the verification commands (`lint`, `typecheck`, `build`, `format`) exit with a non-zero code, THEN THE corresponding npm script SHALL print an error message identifying which package failed.
6. THE completed Phase 0 workspace SHALL contain no TODO comments, placeholder logic, or stub implementations beyond the minimum entry-point files required for the typecheck and build commands to succeed.
