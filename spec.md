# HandyNG — Project Specification

> **Repository:** [olamideolatunde079-spec/HandyNG](https://github.com/olamideolatunde079-spec/HandyNG)  
> **Last Updated:** Phase 0 — Project Planning & Foundation

---

## 1. Project Overview

**Project Name:** HandyNG  
**Project Type:** Local Artisan & Trusted Services Marketplace  
**Target Market:** Nigeria, starting with one city/area and expanding gradually.

### Vision

HandyNG is a platform that connects people who need local services with skilled artisans and service providers around them.

The platform should make it easier for customers to:

- Find nearby artisans.
- Search for specific services.
- View artisan profiles.
- See verification status.
- See ratings and reviews.
- Request a service.
- Contact an artisan.
- Compare different service providers.
- Report problematic users.

Artisans should be able to:

- Create professional profiles.
- List their services.
- Set their service areas.
- Receive service requests.
- Communicate with customers.
- Build ratings and reviews.
- Submit verification information.
- Manage their availability.

The long-term goal is to make HandyNG a trusted local-services marketplace.

---

## 2. Important Development Rule

**DO NOT BUILD THE ENTIRE APPLICATION AT ONCE.**

The application must be developed in small, clearly defined phases.

Kiro must:

1. Complete one phase.
2. Run tests.
3. Check for errors.
4. Fix all discovered problems.
5. Explain what was built.
6. Confirm the phase works.
7. Only then proceed to the next phase.

Do not create fake functionality simply to make the UI appear complete.

If a feature is not implemented yet, clearly mark it as unavailable or keep it out of the UI.

---

## 3. Target Users

HandyNG has three primary user types.

### 3.1 Customer

A customer is someone looking for an artisan or local service.

Customers can:

- Register.
- Login.
- Manage their profile.
- Search for services.
- Search for artisans.
- Filter results.
- View artisan profiles.
- Request services.
- Communicate with artisans.
- Leave reviews after completed services.
- Report artisans.
- Manage their service requests.

### 3.2 Artisan

An artisan is a service provider.

Examples:

- Plumber, Electrician, Carpenter, Painter, Cleaner
- Mechanic, Welder, Tiler, Bricklayer
- AC technician, Generator technician
- Phone technician, Laptop technician
- Tailor, Barber, Hair stylist, Makeup artist
- Photographer, Caterer, Appliance repairer, Furniture maker

Artisans can:

- Register.
- Create a professional profile.
- Add services.
- Set service locations.
- Upload profile/portfolio images.
- Receive service requests.
- Accept or reject requests.
- Communicate with customers.
- Complete jobs.
- Receive reviews.
- Submit verification information.

### 3.3 Administrator

Administrators manage the platform.

Admins can:

- View users and artisans.
- Verify artisans.
- Reject verification requests.
- Suspend accounts.
- Manage service categories.
- Manage reports.
- View service requests.
- Manage reviews.
- View platform statistics.

---

## 4. MVP Scope

The first production-ready MVP should contain:

**Authentication**

- Customer and artisan registration
- Login, logout, password reset, email verification
- Role-based access

**Customer**

- Dashboard, profile, service search, artisan search, filters
- Artisan profile view, service request, request history, reviews

**Artisan**

- Dashboard, profile management, services, service area, portfolio
- Service requests, request status, reviews, verification application

**Admin**

- Dashboard, user management, artisan verification
- Category management, reports, reviews moderation

---

## 5. Technology Stack

### Frontend

- **Next.js** — React framework with App Router
- **TypeScript** — Type-safe JavaScript
- **React** — UI library
- **Tailwind CSS** — Utility-first CSS
- **Font Awesome** — Icon library ([fontawesome.com/icons](https://fontawesome.com/icons))

> **Note:** Font Awesome replaces Lucide React as the icon library for this project. Use `@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`, and `@fortawesome/free-regular-svg-icons`.

Use the latest stable versions compatible with the project environment.

Do not introduce unnecessary libraries.

### Backend

- **Node.js** — Runtime
- **Express** — HTTP framework
- **TypeScript** — Type-safe JavaScript

Backend responsibilities:

- API endpoints, authentication verification, authorization
- Business logic, validation, error handling
- Service requests, reviews, admin operations

### Database

- **Supabase PostgreSQL**

Supabase handles:

- PostgreSQL database
- Authentication
- Storage
- Row Level Security (RLS)

Do not expose the Supabase service-role key to the frontend.

### Storage

Use Supabase Storage for:

- Profile pictures
- Artisan portfolio images
- Verification documents

Private documents must not be publicly accessible.

---

## 6. Environment Variables

### Required Variables

```dotenv
# ─────────────────────────────────────────────
# Supabase (Frontend — public, safe to expose)
# ─────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ─────────────────────────────────────────────
# Supabase (Backend — NEVER expose to frontend)
# ─────────────────────────────────────────────
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json

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

> **Security rule:** `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWKS_URL` are backend-only. Never prefix them with `NEXT_PUBLIC_`. Never commit `.env` to Git.

### Supabase Key Types

| Variable                        | Scope        | Notes                            |
| ------------------------------- | ------------ | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Frontend     | Public project URL               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend     | Publishable key — safe to expose |
| `SUPABASE_URL`                  | Backend      | Same URL, server-side reference  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Backend only | Secret key — never expose        |
| `SUPABASE_JWKS_URL`             | Backend only | Used to verify JWT tokens        |

---

## 7. Project Architecture

Monorepo-style structure managed with **npm workspaces**:

```
handyng/
│
├── frontend/                  ← handy-ng-frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── postcss.config.js
│
├── backend/                   ← handy-ng-backend (Express)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/                  ← handy-ng-supabase
│   ├── migrations/
│   ├── seed/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│
├── package.json               ← Workspace root (npm workspaces host)
├── tsconfig.base.json         ← Shared TypeScript base
├── .eslintrc.js               ← Root ESLint config
├── .prettierrc
├── .prettierignore
├── .gitignore
├── .env.example
├── README.md
└── spec.md                    ← This file
```

Keep frontend and backend responsibilities separate.

---

## 8. Frontend Pages

### Public Pages

```
/
/services
/artisans
/artisans/[id]
/about
/how-it-works
/contact
/login
/register
/forgot-password
```

### Customer Pages

```
/dashboard
/dashboard/profile
/dashboard/requests
/dashboard/requests/[id]
/dashboard/reviews
/dashboard/settings
```

### Artisan Pages

```
/artisan/dashboard
/artisan/profile
/artisan/services
/artisan/portfolio
/artisan/requests
/artisan/requests/[id]
/artisan/reviews
/artisan/verification
/artisan/settings
```

### Admin Pages

```
/admin
/admin/users
/admin/artisans
/admin/verification
/admin/categories
/admin/requests
/admin/reports
/admin/reviews
/admin/settings
```

Admin routes must be protected.

---

## 9. Homepage

The homepage should immediately communicate:

> **Find trusted local artisans near you.**

Primary search interface:

```
What service do you need?
[ Search for a service... ]

Where?
[ Enter your location ]

[ Find an Artisan ]
```

Example categories (display using Font Awesome icons):

- Plumbing (`fa-wrench`)
- Electrical (`fa-bolt`)
- Cleaning (`fa-broom`)
- Carpentry (`fa-hammer`)
- Painting (`fa-paint-roller`)
- Mechanics (`fa-car`)
- AC Repair (`fa-wind`)
- Generator Repair (`fa-plug`)
- Phone Repair (`fa-mobile-screen`)
- Tailoring (`fa-scissors`)

Homepage sections:

1. Hero
2. Search
3. Popular services
4. How HandyNG works
5. Featured artisans
6. Why trust HandyNG
7. Customer reviews
8. CTA
9. Footer

---

## 10. UI/UX Requirements

The UI must look like a modern Nigerian technology startup.

**Design goals:** Professional, clean, trustworthy, simple, fast, mobile-first, accessible, responsive.

**Use:**

- Consistent spacing
- Rounded cards
- Clear typography
- Good hierarchy
- Strong CTA buttons
- Skeleton loading states
- Empty states
- Error states
- Success notifications
- Font Awesome icons throughout

**Avoid:**

- Excessive animations
- Huge unnecessary cards
- Excessive gradients
- Cluttered dashboards
- Horizontal overflow
- Tiny text
- Poor contrast

---

## 11. Responsive Design

The application must work correctly on mobile phones, tablets, laptops, and desktop monitors.

Minimum breakpoints:

```
Mobile      (< 640px)
Tablet      (640px – 1024px)
Desktop     (1024px – 1280px)
Large       (> 1280px)
```

Never allow accidental horizontal scrolling. Every page must be tested at different screen sizes.

---

## 12. Authentication

Use **Supabase Authentication**.

Support:

- Email/password registration
- Email/password login
- Email verification
- Password reset
- Logout

Phone authentication can be added later.

---

## 13. User Roles

```
customer
artisan
admin
```

Never trust the role supplied by the frontend. Roles must be validated on the backend and through Supabase RLS policies. JWT tokens are verified using `SUPABASE_JWKS_URL`.

---

## 14. Database Design

### Core Tables

**profiles**

```
id, user_id, first_name, last_name, phone, avatar_url,
role, city, state, address, created_at, updated_at
```

**artisan_profiles**

```
id, user_id, business_name, bio, years_experience,
verification_status (pending | verified | rejected),
verification_submitted_at, verified_at, service_radius,
average_rating, total_reviews, completed_jobs, created_at, updated_at
```

**service_categories**

```
id, name, slug, description, icon, is_active, created_at, updated_at
```

**services**

```
id, artisan_id, category_id, name, description,
price_from, price_to, pricing_type (fixed | starting_from | negotiable | inspection_required),
is_active, created_at, updated_at
```

**service_areas**

```
id, artisan_id, city, state, area, latitude, longitude, radius_km, created_at, updated_at
```

**portfolio_items**

```
id, artisan_id, title, description, image_url, created_at, updated_at
```

**service_requests**

```
id, customer_id, artisan_id, service_id, title, description,
location, preferred_date, preferred_time,
status (pending | accepted | rejected | in_progress | completed | cancelled),
estimated_price, created_at, updated_at
```

**reviews**

```
id, customer_id, artisan_id, service_request_id,
rating (1–5), comment, created_at, updated_at
```

Only customers who completed a service request may review that service.

**reports**

```
id, reporter_id, reported_user_id, service_request_id, reason, description,
status (open | investigating | resolved | dismissed), created_at, updated_at
```

**verification_requests**

```
id, artisan_id, document_type, document_url, status,
admin_notes, submitted_at, reviewed_at, reviewed_by
```

Verification documents must not be publicly accessible.

---

## 15. Database Security

Supabase Row Level Security (RLS) must be enabled.

**Customer policies:** Read public artisan profiles; create/view own service requests; update own profile; create reviews for eligible completed requests.

**Artisan policies:** Manage own profile, services, and portfolio; view and update requests assigned to them.

**Admin policies:** Full access to administrative resources.

Never use `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

---

## 16. API Structure

Base path: `/api/v1`

### Endpoints

```
# Auth
GET    /api/v1/auth/me

# Users
GET    /api/v1/users/me
PATCH  /api/v1/users/me

# Categories (admin-only mutations)
GET    /api/v1/categories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id

# Artisans
GET    /api/v1/artisans
GET    /api/v1/artisans/:id
PATCH  /api/v1/artisans/me

# Services
GET    /api/v1/services
POST   /api/v1/services
PATCH  /api/v1/services/:id
DELETE /api/v1/services/:id

# Service Requests
POST   /api/v1/requests
GET    /api/v1/requests
GET    /api/v1/requests/:id
PATCH  /api/v1/requests/:id

# Reviews
POST   /api/v1/reviews
GET    /api/v1/artisans/:id/reviews

# Verification
POST   /api/v1/verification
GET    /api/v1/verification/status
GET    /api/v1/admin/verification
PATCH  /api/v1/admin/verification/:id
```

### Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

Do not expose internal stack traces.

---

## 17. Validation

Validate all incoming data using **Zod**.

Validate: email, phone, password, names, service descriptions, prices, ratings, IDs, dates, uploaded files.

Never rely only on frontend validation.

---

## 18. Search & Filtering

**Search by:** Service, artisan name, business name, location.

**Filters:** Category, location, rating, verification status, price, availability.

Do not implement advanced search before basic artisan listing works.

---

## 19. Artisan Profile

Display:

- Profile picture, name/business name, verified badge
- Main services, description, years of experience
- Service areas, ratings, number of reviews, completed jobs
- Portfolio, services, pricing, contact/request button

---

## 20. Verification System

Artisans can submit:

- Government-issued ID
- Phone number, email
- Profile and service information
- Supporting documents

Verification status is clearly displayed. Do not claim an artisan is professionally certified unless the platform has verified the relevant credential.

---

## 21. Reviews & Ratings

- Rating: 1–5 stars
- Only eligible customers can review
- One review per completed service request
- Users cannot review their own account
- Reviews must belong to actual service requests
- Admins can moderate reviews

---

## 22. Service Request Workflow

```
Customer: Find Artisan → View Profile → Select Service → Submit Request → Pending
Artisan:  Receive Request → Accept / Reject
If accepted: Accepted → In Progress → Completed
Customer can cancel where permitted.
```

---

## 23. Notifications

Initial: in-app notifications.

Later: email, SMS, push notifications.

Events:

```
New service request, Request accepted, Request rejected,
Request completed, New review, Verification approved, Verification rejected
```

Do not implement external SMS/email providers in Phase 1 unless required.

---

## 24. Messaging

Added after core service-request workflow works.

Structure: `conversations`, `messages`. Users may only communicate when they have an active service request relationship.

---

## 25. Location

Initial: State → City → Area (e.g., Lagos → Ikeja → Allen).

Later: GPS, map view, distance calculation, Mapbox/Google Maps.

Do not make maps a dependency for the MVP.

---

## 26. Admin Dashboard

Statistics: Total Users, Total Artisans, Verified Artisans, Pending Verification, Service Requests, Completed Jobs, Reports, Reviews.

Navigation: Dashboard, Users, Artisans, Verification, Categories, Service Requests, Reports, Reviews, Settings.

---

## 27. Admin Verification Workflow

Admin views pending verification requests with: artisan info, submitted documents, services, service areas, portfolio, submission date.

Actions: Approve or Reject (with mandatory rejection reason).

---

## 28. Security Requirements

Implement:

- Authentication, authorization, RBAC
- Input validation (Zod), database RLS
- Secure environment variables
- Rate limiting, CORS configuration
- Secure HTTP headers
- Proper error handling
- File upload validation and size limits

Never expose: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`, or any database passwords to the frontend.

---

## 29. File Upload Security

Allowed image types: JPEG, PNG, WEBP.

- Set reasonable file size limits.
- Validate MIME type and extension.
- Verification documents use private storage.
- Never trust filenames supplied by users.

---

## 30. Error Handling

Frontend states: Loading, Success, Empty, Error.

Backend HTTP codes:

```
404 — Not found
400 — Invalid request
401 — Unauthorized
403 — Forbidden
409 — Conflict
422 — Validation error
429 — Too many requests
500 — Server error
```

---

## 31. Testing

**Frontend:** Forms, validation, auth UI, search, filters, service requests, responsive layout.

**Backend:** API endpoints, authentication, authorization, validation, request workflow, reviews, admin permissions.

**Database:** RLS policies, user isolation, artisan isolation, admin access.

Do not mark a phase complete if its tests are failing.

---

## 32. Development Scripts

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "start": "...",
    "lint": "...",
    "test": "...",
    "typecheck": "...",
    "format": "..."
  }
}
```

---

## 33. Git Workflow

Use logical commits:

```
chore: initialize project
feat: add authentication
feat: add artisan profiles
feat: add service categories
feat: add service requests
fix: resolve authentication issue
```

Do not make one enormous commit containing the entire application.

---

## 34. Documentation

Maintain: `README.md`, `spec.md`, `docs/`.

Document: setup, environment variables, database setup, API endpoints, authentication, development commands, testing, deployment.

---

## 35. Development Phases

| Phase | Name                          | Status      |
| ----- | ----------------------------- | ----------- |
| 0     | Project Planning & Foundation | **Current** |
| 1     | Basic Application Setup       | Pending     |
| 2     | Supabase Setup                | Pending     |
| 3     | Authentication                | Pending     |
| 4     | User Profiles                 | Pending     |
| 5     | Service Categories            | Pending     |
| 6     | Artisan Services              | Pending     |
| 7     | Artisan Discovery             | Pending     |
| 8     | Service Requests              | Pending     |
| 9     | Reviews                       | Pending     |
| 10    | Verification                  | Pending     |
| 11    | Admin Dashboard               | Pending     |
| 12    | Notifications                 | Pending     |
| 13    | Messaging                     | Pending     |
| 14    | Advanced Search & Location    | Pending     |
| 15    | Production Hardening          | Pending     |

### Phase Descriptions

**PHASE 0 — Project Planning & Foundation**

- Review specification, identify architecture, confirm dependencies
- Create directory structure, README, `.env.example`, configure Git

**PHASE 1 — Basic Application Setup**

- Next.js frontend, Express backend, TypeScript, Tailwind
- Basic API health endpoint, environment configuration
- Test: `GET /api/v1/health` → `{ "success": true, "message": "HandyNG API is running" }`

**PHASE 2 — Supabase Setup**

- Supabase connection, database migrations, initial tables, RLS policies, seed categories

**PHASE 3 — Authentication**

- Registration, login, logout, email verification, password reset, user roles, protected routes

**PHASE 4 — User Profiles**

- Customer profile, artisan profile, profile editing, avatar upload

**PHASE 5 — Service Categories**

- Category list, category page, artisan category assignment, admin category management

**PHASE 6 — Artisan Services**

- Add/edit/delete service, pricing, description, service category

**PHASE 7 — Artisan Discovery**

- Artisan listing, search, category filtering, location filtering, artisan profile view

**PHASE 8 — Service Requests**

- Request form, customer requests, artisan requests, full status state machine

**PHASE 9 — Reviews**

- Rating, review, artisan rating calculation, review listing

**PHASE 10 — Verification**

- Verification submission, document upload, admin review, approve/reject, verified badge

**PHASE 11 — Admin Dashboard**

- Dashboard, user management, artisan management, verification, reports, categories, reviews

**PHASE 12 — Notifications**

- In-app notifications for requests, verification, and reviews

**PHASE 13 — Messaging**

- Conversations, messages, realtime updates, conversation permissions

**PHASE 14 — Advanced Search & Location**

- GPS, distance, nearby artisans, map view, advanced filtering

**PHASE 15 — Production Hardening**

- Security audit, performance testing, API testing, database policy review, accessibility review, rate limiting, logging, production environment configuration

---

## 36. Definition of Done

A phase is only complete when:

- Feature works.
- UI works.
- API works.
- Database works.
- Authorization works.
- Validation works.
- Error states work.
- Loading states work.
- Responsive design works.
- Tests pass.
- TypeScript has no errors.
- Linter passes.
- Build succeeds.
- No obvious console errors remain.

---

## 37. Kiro Development Rules

1. Do not build the entire project in one operation.
2. Start with **PHASE 0 only**.
3. Before writing code, inspect the current project directory.
4. After each phase: run tests → lint → typecheck → build → fix errors → explain what changed → explain how to test manually.
5. Do not move to the next phase until the current phase passes.
6. Do not create fake APIs.
7. Do not hardcode production data.
8. Never expose private secrets.
9. Keep the code beginner-friendly — clear names, helpful comments, no unnecessary abstraction.
10. Do not install packages unless they are actually required; explain why before installing.

---

## 38. Code Quality Rules

**Use:** TypeScript, strong typing, reusable components, small functions, clear naming, consistent formatting, centralized error handling, environment configuration.

**Avoid:** `any` unless absolutely necessary, duplicate code, giant components, giant controllers, hardcoded secrets, hardcoded user data, unnecessary dependencies.

---

## 39. Accessibility

Support:

- Keyboard navigation
- Proper labels
- Semantic HTML
- Accessible buttons and forms
- Good color contrast
- Focus states
- Meaningful error messages
- Alt text on all images

---

## 40. Performance

- Optimize images, database queries, API responses, frontend bundles.
- Use pagination for large lists (default: 20 artisans per page).
- Avoid loading thousands of records at once.

---

## 41. Future Features (Post-MVP)

Online payments, escrow, booking calendar, GPS tracking, push notifications, SMS, WhatsApp integration, artisan subscriptions, featured listings, business accounts, service packages, emergency services, job bidding, customer loyalty, referral system, analytics, AI-assisted service matching, multi-city expansion.

---

## 42. Product Trust Principles

The UI must clearly distinguish between:

```
Verified
Unverified
Pending verification
Rejected
```

Do not imply that every artisan is professionally certified simply because they have an account. Reviews must represent actual completed service interactions. Users must be able to report suspicious activity.

---

## 43. Initial Service Categories

Seed the database with:

```
Plumbing, Electrical, Carpentry, Painting, Cleaning,
Mechanic, AC & Refrigeration, Generator Repair,
Phone Repair, Computer Repair, Welder, Tiler, Mason,
Furniture, Tailoring, Barber, Hair Styling, Makeup,
Photography, Catering, Appliance Repair, Gardening,
Moving & Relocation
```

Admins can add additional categories later.

---

## 44. Sample Development Data

**Sample Artisan (development only):**

```
Business: Ola Electrical Services
Category: Electrical
Location: Lagos
Experience: 7 years
Services: Electrical Installation, Electrical Repairs,
          Generator Wiring, Home Electrical Maintenance
```

**Sample Customer (development only):**

```
Name: Test Customer
Role: customer
```

Never use fake accounts in production.

---

## 45. Production Deployment Architecture

```
Customer
   ↓
Next.js Frontend
   ↓
Express API Backend
   ↓
Supabase (PostgreSQL + Auth + Storage)
```

---

## 46. Final Development Goal

**Complete customer flow:**

```
Create account → Login → Search for service → Find artisan →
View artisan profile → Request service → Artisan receives request →
Accept request → Complete service → Customer leaves review →
Artisan rating updates
```

**Complete artisan flow:**

```
Create account → Create profile → Add services → Set service area →
Submit verification → Admin reviews → Verified →
Appear in verified artisan searches
```

---

## 47. Phase 0 — Implementation Plan

### Overview

Scaffold the complete monorepo skeleton for HandyNG. No application logic is written. The deliverable is a workspace where `npm install → npm run format → npm run lint → npm run typecheck → npm run build → npm run format --check` all exit with code `0`.

### Tasks

- [ ] 1. Initialise Git and create the monorepo directory skeleton
  - Run `git init` at the workspace root
  - Create: `frontend/src/app/`, `frontend/src/styles/`, `backend/src/`, `supabase/migrations/`, `supabase/seed/`, `docs/`
  - Write root `.gitignore`

- [ ] 2. Create workspace root and per-package `package.json` files
  - [ ] 2.1 Root `package.json` — workspaces, scripts (lint, typecheck, build, format), devDeps
  - [ ] 2.2 `frontend/package.json` — Next.js, React, Tailwind, Font Awesome, TypeScript
  - [ ] 2.3 `backend/package.json` — Express, TypeScript, ts-node
  - [ ] 2.4 `supabase/package.json` — Supabase CLI, TypeScript

- [ ] 3. Write TypeScript configuration
  - [ ] 3.1 Root `tsconfig.base.json` (strict, esModuleInterop, skipLibCheck, etc.)
  - [ ] 3.2 `frontend/tsconfig.json` (extends base, Next.js options)
  - [ ] 3.3 `backend/tsconfig.json` (extends base, commonjs, es2020)
  - [ ] 3.4 `supabase/tsconfig.json` (extends base, Node.js context)

- [ ] 4. Write ESLint configuration
  - [ ] 4.1 Root `.eslintrc.js` (TS plugin, no-unused-vars: error)
  - [ ] 4.2 `frontend/.eslintrc.js` (React + Next.js plugins)
  - [ ] 4.3 `backend/.eslintrc.js`
  - [ ] 4.4 `supabase/.eslintrc.js`

- [ ] 5. Write Prettier configuration
  - Root `.prettierrc` and `.prettierignore`

- [ ] 6. Write docs and environment template
  - [ ] 6.1 `.env.example` with all required keys and comments
  - [ ] 6.2 Root `README.md` with project overview and 15-phase roadmap
  - [ ] 6.3 `docs/README.md` placeholder

- [ ] 7. Checkpoint — install dependencies
  - Run `npm install`; run `npm audit --audit-level=high`

- [ ] 8. Write minimum entry-point source files
  - [ ] 8.1 `frontend/src/styles/globals.css` (Tailwind directives)
  - [ ] 8.2 `frontend/next.config.js`, `tailwind.config.ts`, `postcss.config.js`
  - [ ] 8.3 `frontend/src/app/layout.tsx`
  - [ ] 8.4 `frontend/src/app/page.tsx`
  - [ ] 8.5 `backend/src/index.ts` (Express health endpoint)

- [ ] 9. Checkpoint — full toolchain verification
  - `npm run format` → `npm run lint` → `npm run typecheck` → `npm run build` → `npm run format -- --check`

- [ ] 10. Correctness property tests (optional*)
  - [ ]* 10.1 Unused variables reported as lint errors
  - [ ]* 10.2 Prettier formatting is idempotent
  - [ ]* 10.3 No TODO/FIXME markers in source files

- [ ] 11. Final checkpoint — full verification sequence end-to-end

### Task Dependency Graph

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

---

## 48. Phase 0 — Design Reference

### Architecture Diagram

```
handy-ng/                          ← Workspace Root
├── package.json                   ← npm workspaces host; root scripts
├── tsconfig.base.json             ← Shared TypeScript compiler base
├── .eslintrc.js                   ← Root ESLint config (all TS files)
├── .prettierrc                    ← Prettier formatting rules
├── .prettierignore                ← Prettier exclusion patterns
├── .gitignore
├── .env.example
├── README.md
│
├── frontend/                      ← Package: handy-ng-frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js
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
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   └── src/
│       └── index.ts
│
├── supabase/                      ← Package: handy-ng-supabase
│   ├── package.json
│   ├── tsconfig.json
│   ├── migrations/
│   └── seed/
│
└── docs/
    └── README.md
```

### Root Script Interface

| Script              | Command                                       | Purpose                               |
| ------------------- | --------------------------------------------- | ------------------------------------- |
| `npm run lint`      | `npm run lint --workspaces --if-present`      | Static analysis across all packages   |
| `npm run typecheck` | `npm run typecheck --workspaces --if-present` | Type-checking across all packages     |
| `npm run build`     | `npm run build --workspaces --if-present`     | Compilation/build across all packages |
| `npm run format`    | `prettier --write "**/*.{ts,tsx,js,json,md}"` | Code formatting across workspace      |

### Correctness Properties

1. **Unused variables are always reported as lint errors** — ESLint exits non-zero for any unused declaration in any package.
2. **Prettier formatting is idempotent** — Running `npm run format` twice produces identical output.
3. **Source files contain no TODO markers** — Zero occurrences of `TODO`, `FIXME`, `HACK`, or `XXX` in any source file.

### Verification Sequence

```bash
npm install
npm audit --audit-level=high
npm run format
npm run lint
npm run typecheck
npm run build
npm run format -- --check
```

All commands must exit `0` for Phase 0 to be complete.

---

_End of HandyNG Project Specification_
