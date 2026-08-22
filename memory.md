# HubWeld Project Memory & AI Guidelines

> **AI INSTRUCTION:** Read this file carefully before making any structural, logic, or UI changes. It contains the core architecture, rules, and logic for the HubWeld platform.

## 1. Project Overview & Architecture
**HubWeld** is a dual-purpose Next.js platform designed specifically for the welding industry:
1. **B2B Equipment Marketplace:** A store where suppliers can list products, and contractors/welders can purchase equipment.
2. **Service Marketplace:** A platform where clients can post welding projects/jobs, and certified welders can bid on them.

## 2. Tech Stack
- **Framework:** Next.js (v14+) using the **App Router** (`src/app`).
- **Database ORM:** Prisma (`prisma/schema.prisma`).
- **Database Engine:** SQLite (currently using `dev.db`).
- **Authentication:** NextAuth.js (Session-based, checking roles via `session.user.role`).
- **Styling:** Tailwind CSS (configured in `tailwind.config.ts`).
- **Icons:** `lucide-react`.

## 3. Database Schema Overview (Prisma)
The database has several interconnected entities:
- `User`: Handles authentication (Email/Password or OAuth). Has a `Role` enum (`ADMIN`, `WELDER`, `SUPPLIER`, `CLIENT`, `USER`).
- `Profile`: One-to-one with User. Contains extended info like `bio`, `company`, `location`, `rating`.
- `Category`: Hierarchical (supports `parentId` for subcategories) used for products.
- `Product`: Listed by `SUPPLIER`. Contains `price`, `stock`, `description`. Linked to `Category`.
- `Order` & `OrderItem`: Handles the shopping cart and checkout process for products.
- `Job`: Posted by `CLIENT`. Represents a welding project. Includes `budget`, `location`, `status` (`OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- `Bid`: Submitted by `WELDER` on a `Job`. Contains proposed `amount` and `coverLetter`.
- `Review`: Rating system linking `reviewer` and `reviewee` (e.g., Client rating Welder after job completion).

## 4. Crucial AI Coding Rules & Guidelines
- **App Router Rules:** Always use `use client` directives at the very top of files if the component requires state (`useState`, `useEffect`) or browser APIs. Server Components (default) should handle data fetching directly using Prisma.
- **Styling Guidelines (UI/UX):** — "Forged Industrial · Daylight" system (Aug 2026)
  - The app uses a LIGHT theme. Page ground is `ink-900` (#F6F7F9); panels are white (`ink-700`) with `border-slate-200` hairlines. The `ink` scale in tailwind.config.ts is deliberately inverted (900 = lightest).
  - Primary accent is red, reserved for actions/status: `bg-brand` (#C22127), `text-brand`. Never tint whole surfaces red.
  - NO glassmorphism. Flat opaque plates with `shadow-plate` / `shadow-plate-sm`. Shared classes: `.card`, `.input`, `.btn-primary`, `.btn-secondary`, `.badge`, `.label`, `.seam` (weld-seam divider), `.hazard` (stripe).
  - Fonts via next/font: Barlow (body, `font-sans`), Barlow Condensed (headings, `font-display`, uppercase), IBM Plex Mono (`font-mono` for metadata/numbers).
  - Text colors: slate-900 headings, slate-600/700 body, slate-500 muted. Animations: `.forge-rise` (hero), `<Reveal>` component (scroll reveal).
  - Always ensure mobile responsiveness using Tailwind's `md:`, `lg:` prefixes.
- **Database & Deployment:**
  - The current database is SQLite. Do not use Postgres-specific or MySQL-specific Prisma features (like `JSON` arrays or `enum` mapping if unsupported).
  - Note for deployments (e.g., Railway): SQLite is ephemeral. To persist data, a persistent volume mount must be used, and the `DATABASE_URL` must point to that volume (e.g., `file:/data/sqlite.db`).
- **Authentication:**
  - Route protection should be done using NextAuth.
  - Client-side: use `useSession()`.
  - Server-side: use `getServerSession()`.
  - Check `role` for authorization (e.g., only `ADMIN` can access `/admin`).

## 5. Automated AI Blog Generation
- **Endpoint:** `/api/cron/generate-article`
- **Function:** Uses OpenAI API (`gpt-4o`) to automatically write and publish SEO/GEO/AIO optimized articles in Persian.
- **Trigger:** Configured to run automatically 3 times a week (Mon, Wed, Fri at 08:00 UTC) via GitHub Actions (`.github/workflows/blog-cron.yml`).
- **Required Secrets:**
  - `OPENAI_API_KEY`: Must be set in `.env` and Railway.
  - `CRON_SECRET`: Must be set in `.env` and Railway, matching the secret used in GitHub Actions.
  - `PRODUCTION_DOMAIN`: Must be set in GitHub Secrets for the Action to ping the right URL.

## 6. Directory Structure
- `src/app/`: Next.js pages and API routes (`/api/...`).
- `src/components/`: Reusable React components (e.g., `Navbar.tsx`, `Footer.tsx`, UI elements).
- `src/lib/`: Utility functions and shared instances (e.g., Prisma client instantiation).
- `prisma/`: Contains `schema.prisma` and potential migrations.
- `public/`: Static assets (images, fonts). Team images are located in `/images/team/`.
