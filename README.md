# HandyNG

> **Repository:** [olamideolatunde079-spec/HandyNG](https://github.com/olamideolatunde079-spec/HandyNG)

HandyNG is a local artisan and trusted services marketplace for Nigeria. It connects people who need local services — plumbing, electrical, cleaning, carpentry, and more — with skilled, verified artisans in their area. The platform is built to be trustworthy, fast, and mobile-first, starting with one city and expanding across Nigeria.

---

## Project Structure

```
handyng/
├── frontend/        Next.js application (App Router, TypeScript, Tailwind CSS, Font Awesome)
├── backend/         Express API (TypeScript, Node.js)
├── supabase/        Database migrations, seed data, and RLS policies
├── docs/            Project documentation
├── .env.example     Environment variable template — copy to .env and fill in real values
├── spec.md          Full project specification
└── README.md        This file
```

---

## Tech Stack

| Layer    | Technology                                    | Purpose                                           |
| -------- | --------------------------------------------- | ------------------------------------------------- |
| Frontend | [Next.js](https://nextjs.org)                 | React framework with App Router and SSR           |
| UI       | [React](https://react.dev)                    | Component-based UI library                        |
| Styling  | [Tailwind CSS](https://tailwindcss.com)       | Utility-first CSS framework                       |
| Icons    | [Font Awesome](https://fontawesome.com/icons) | Icon library                                      |
| Backend  | [Express](https://expressjs.com)              | Minimal Node.js HTTP framework                    |
| Language | [TypeScript](https://www.typescriptlang.org)  | Type-safe JavaScript across the full stack        |
| Database | [Supabase](https://supabase.com)              | PostgreSQL, Auth, Storage, and Row Level Security |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/olamideolatunde079-spec/HandyNG.git
cd HandyNG
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your real Supabase and API values. Never commit `.env` to Git.

### 3. Install dependencies

```bash
npm install
```

### 4. Verify the setup

```bash
npm run lint        # ESLint across all packages
npm run typecheck   # TypeScript across all packages
npm run build       # Build all packages
```

All three commands should exit with code `0` before proceeding.

### 5. Start development servers

In separate terminals:

```bash
# Frontend (Next.js)
cd frontend && npm run dev

# Backend (Express)
cd backend && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Development Phases

| Phase | Name                              | Status     |
| ----- | --------------------------------- | ---------- |
| **0** | **Project Planning & Foundation** | ✅ Current |
| 1     | Basic Application Setup           | Pending    |
| 2     | Supabase Setup                    | Pending    |
| 3     | Authentication                    | Pending    |
| 4     | User Profiles                     | Pending    |
| 5     | Service Categories                | Pending    |
| 6     | Artisan Services                  | Pending    |
| 7     | Artisan Discovery                 | Pending    |
| 8     | Service Requests                  | Pending    |
| 9     | Reviews                           | Pending    |
| 10    | Verification                      | Pending    |
| 11    | Admin Dashboard                   | Pending    |
| 12    | Notifications                     | Pending    |
| 13    | Messaging                         | Pending    |
| 14    | Advanced Search & Location        | Pending    |
| 15    | Production Hardening              | Pending    |

See [`spec.md`](./spec.md) for the full project specification and phase details.

---

## Available Scripts

Run these from the workspace root:

| Script                 | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run lint`         | Run ESLint across all packages                |
| `npm run typecheck`    | Run TypeScript type-check across all packages |
| `npm run build`        | Build all packages                            |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing changes      |

---

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWKS_URL` are **backend-only** — never prefix them with `NEXT_PUBLIC_`
- Never commit `.env` to version control
- Row Level Security (RLS) is enforced on all database tables
- JWT tokens are verified server-side using `SUPABASE_JWKS_URL`
