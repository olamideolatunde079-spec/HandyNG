# Implementation Plan: HandyNG — Phase 0: Project Planning & Foundation

## Overview

Scaffold the complete monorepo skeleton for HandyNG: directory structure, npm workspaces, shared TypeScript / ESLint / Prettier configuration, minimum entry-point source files, and all root-level documentation. No application logic is written. The deliverable is a workspace where `npm install → npm run format → npm run lint → npm run typecheck → npm run build → npm run format --check` all exit with code `0`.

---

## Tasks

- [ ] 1. Initialise Git and create the monorepo directory skeleton
  - Run `git init` at the workspace root to create `.git/`
  - Create top-level directories: `frontend/src/app/`, `frontend/src/styles/`, `backend/src/`, `supabase/migrations/`, `supabase/seed/`, `docs/`
  - Write root `.gitignore` excluding `node_modules/`, `.next/`, `dist/`, `build/`, `*.js.map`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/` (un-ignoring `!.vscode/extensions.json` and `!.vscode/settings.json`), and `*.tsbuildinfo`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Create workspace root `package.json` and per-package `package.json` files
  - [ ] 2.1 Write root `package.json` with `"name": "handy-ng"`, `"private": true`, `"workspaces": ["frontend", "backend", "supabase"]`, scripts (`lint`, `typecheck`, `build`, `format`), and root devDependencies (`eslint`, `prettier`, `typescript`)
    - Use exact versions from the design: eslint `^8.57.0`, prettier `^3.2.5`, typescript `^5.4.5`
    - `format` script: `prettier --write "**/*.{ts,tsx,js,json,md}"`
    - `lint`, `typecheck`, `build` scripts delegate via `npm run <script> --workspaces --if-present`
    - _Requirements: 2.1, 2.6, 8.4, 9.4_
  - [ ] 2.2 Write `frontend/package.json` with `"name": "handy-ng-frontend"`, all dependencies and devDependencies from the design, and scripts (`dev`, `build`, `start`, `lint`, `typecheck`)
    - _Requirements: 2.2, 9.1_
  - [ ] 2.3 Write `backend/package.json` with `"name": "handy-ng-backend"`, all dependencies and devDependencies from the design, and scripts (`dev`, `build`, `start`, `lint`, `typecheck`)
    - _Requirements: 2.3, 9.2_
  - [ ] 2.4 Write `supabase/package.json` with `"name": "handy-ng-supabase"`, devDependencies (`supabase`, `typescript`), and `typecheck` script
    - _Requirements: 2.4, 9.3_

- [ ] 3. Write shared TypeScript configuration and per-package `tsconfig.json` files
  - [ ] 3.1 Create root `tsconfig.base.json` with shared compiler options: `strict`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`, `resolveJsonModule`, `declaration`, `declarationMap`, `sourceMap`, `moduleResolution: "bundler"`
    - _Requirements: 6.1, 6.2_
  - [ ] 3.2 Create `frontend/tsconfig.json` extending `../../tsconfig.base.json` with Next.js-specific options: `target: "es2017"`, `lib: ["dom", "dom.iterable", "esnext"]`, `jsx: "preserve"`, `allowJs`, `incremental`, `plugins: [{ "name": "next" }]`, `paths: { "@/*": ["./src/*"] }`, `include`/`exclude` for Next.js conventions
    - _Requirements: 6.3_
  - [ ] 3.3 Create `backend/tsconfig.json` extending `../../tsconfig.base.json` with `target: "es2020"`, `module: "commonjs"`, `moduleResolution: "node"`, `outDir: "./dist"`, `rootDir: "./src"`
    - _Requirements: 6.4_
  - [ ] 3.4 Create `supabase/tsconfig.json` extending `../../tsconfig.base.json` with `target: "es2020"`, `module: "commonjs"`, `moduleResolution: "node"`
    - _Requirements: 6.5_

- [ ] 4. Write ESLint configuration files
  - [ ] 4.1 Create root `.eslintrc.js` with `root: true`, `@typescript-eslint/parser`, `plugin:@typescript-eslint/recommended`, `eslint:recommended`, and explicit rules `@typescript-eslint/no-unused-vars: "error"` and `@typescript-eslint/no-explicit-any: "warn"`
    - _Requirements: 7.1, 7.2, 7.3, 7.6_
  - [ ] 4.2 Create `frontend/.eslintrc.js` extending `../../.eslintrc.js`, `plugin:react/recommended`, and `next/core-web-vitals`; add `react/react-in-jsx-scope: "off"` and `settings.react.version: "detect"`
    - _Requirements: 7.4_
  - [ ] 4.3 Create `backend/.eslintrc.js` extending `../../.eslintrc.js` with `parserOptions.project: "./tsconfig.json"`
    - _Requirements: 7.1, 7.3_
  - [ ] 4.4 Create `supabase/.eslintrc.js` extending `../../.eslintrc.js` with `parserOptions.project: "./tsconfig.json"`
    - _Requirements: 7.1, 7.3_

- [ ] 5. Write Prettier configuration files
  - Create root `.prettierrc` with: `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`, `endOfLine: "lf"`
  - Create root `.prettierignore` excluding `node_modules/`, `.next/`, `dist/`, `build/`, `*.lock`
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 6. Write root `.env.example` and project `README.md`
  - [ ] 6.1 Create `.env.example` with all required keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `PORT`, `NODE_ENV`, `NEXT_PUBLIC_API_URL`) grouped under `# Supabase`, `# Backend (Express API)`, and `# Frontend (Next.js)` comment headers; use placeholder values
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 6.2 Create root `README.md` with: project title, one-paragraph HandyNG description, "Project Structure" section, "Getting Started" section (clone → copy `.env.example` → `npm install` → `npm run lint` / `typecheck` / `build`), "Tech Stack" section (Next.js, Express, TypeScript, Tailwind CSS, Supabase, Lucide React), and "Development Phases" section listing all 15 phases with Phase 0 marked as current
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 6.3 Create `docs/README.md` as a placeholder file (single heading, no TODO/FIXME markers)
    - _Requirements: 1.5_

- [ ] 7. Checkpoint — install dependencies and verify no high-severity vulnerabilities
  - Run `npm install` at the workspace root; confirm it completes without errors and creates `node_modules/` with workspace symlinks
  - Run `npm audit --audit-level=high`; confirm exit code `0`
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 2.5, 9.6_

- [ ] 8. Write minimum entry-point source files
  - [ ] 8.1 Create `frontend/src/styles/globals.css` with a minimal Tailwind CSS directive block (`@tailwind base; @tailwind components; @tailwind utilities;`)
    - _Requirements: 1.2_
  - [ ] 8.2 Create `frontend/next.config.js`, `frontend/tailwind.config.ts`, and `frontend/postcss.config.js` with the minimal content required for `next build` to succeed
    - _Requirements: 2.2_
  - [ ] 8.3 Create `frontend/src/app/layout.tsx` as the minimal Next.js root layout (exports `metadata`, renders `{children}` inside `<html lang="en"><body>`)
    - No TODO/FIXME markers; no unused imports
    - _Requirements: 1.2, 10.6_
  - [ ] 8.4 Create `frontend/src/app/page.tsx` as the minimal Next.js home page (returns `<main><h1>HandyNG</h1></main>`)
    - No TODO/FIXME markers; no unused imports
    - _Requirements: 1.2, 10.6_
  - [ ] 8.5 Create `backend/src/index.ts` as the minimal Express entry point: import `express`, create `app`, add `express.json()` middleware, register `GET /health` route returning `{ status: 'ok' }`, call `app.listen`
    - No TODO/FIXME markers; no unused variables (use `_req` convention for unused request parameter)
    - _Requirements: 1.3, 10.6_

- [ ] 9. Checkpoint — verify full toolchain passes
  - Run `npm run format` — Prettier must exit `0`
  - Run `npm run lint` — ESLint must exit `0` across all packages
  - Run `npm run typecheck` — TypeScript must exit `0` across all packages
  - Run `npm run build` — build toolchain must exit `0` for all packages defining a `build` script
  - Run `npm run format -- --check` — must exit `0` (idempotence check)
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Write correctness property tests
  - [ ]* 10.1 Write property test for Property 1: Unused variables are always reported as lint errors
    - **Property 1: Unused Variables Are Always Reported as Lint Errors**
    - Create a temporary TypeScript file containing a declared-but-unused variable, run ESLint against it programmatically, and assert that the result contains at least one error with rule `@typescript-eslint/no-unused-vars` and that the exit code is non-zero
    - Clean up the temporary file after the test
    - **Validates: Requirements 7.6**
  - [ ]* 10.2 Write property test for Property 2: Prettier formatting is idempotent
    - **Property 2: Prettier Formatting Is Idempotent**
    - For each source file under `frontend/src/`, `backend/src/`, and `docs/`, read the file content, format it once with the Prettier API using the project's `.prettierrc`, format the result a second time, and assert that the two outputs are byte-for-byte identical
    - **Validates: Requirements 10.4**
  - [ ]* 10.3 Write property test for Property 3: Source files contain no TODO/FIXME markers
    - **Property 3: Workspace Source Files Contain No TODO Markers**
    - Recursively scan all files under `frontend/src/`, `backend/src/`, and `supabase/` and assert zero occurrences of the strings `TODO`, `FIXME`, `HACK`, or `XXX` in any file
    - **Validates: Requirements 10.6**

- [ ] 11. Final checkpoint — confirm Phase 0 is complete
  - Re-run the full verification sequence: `npm install → npm audit --audit-level=high → npm run format → npm run lint → npm run typecheck → npm run build → npm run format -- --check`
  - All commands must exit with code `0`
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP scaffold
- Property tests (10.1–10.3) use the Prettier API and ESLint's Node.js API directly — no separate test framework is required unless one is already in place
- Each task references specific requirement sub-clauses for full traceability
- The `--if-present` flag on root workspace scripts means the absence of a `lint` or `build` script in `supabase/` does not cause root commands to fail (Requirement 2.6)
- Entry-point source files must contain no TODO/FIXME/HACK/XXX markers (Requirement 10.6) — the property test in task 10.3 verifies this
- Checkpoints at tasks 7, 9, and 11 provide incremental validation gates; do not skip them

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["8.1", "8.2"] },
    { "id": 6, "tasks": ["8.3", "8.4", "8.5"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
