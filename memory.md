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
  - Local development is SQLite (`prisma/schema.prisma`); production is PostgreSQL (`prisma/schema.prod.prisma`). **A model change must be made in BOTH files.** Avoid features one of them lacks (e.g. `JSON` arrays, native enums).
  - Case-insensitive text search differs between the two, so always filter through `contains()` in `src/lib/search.ts`, never a bare Prisma `contains`.
  - Production applies **migrations** (`prisma migrate deploy` in `docker-entrypoint.sh`), not `db push`. Never reintroduce `--accept-data-loss` on a boot path: it can drop a column and its data silently. `prisma/migrations/0_init` is the baseline.
  - Uploads live on the Railway volume via `UPLOAD_DIR=/app/data/uploads` and are served by `/api/files/<name>`. Always write uploads with `saveUpload()` from `src/lib/uploads.ts` — never straight to `public/`, which is wiped on redeploy.
- **Authentication & Authorization:**
  - Client-side: `useSession()`. Server-side: `getServerSession(authOptions)`.
  - `middleware.ts` only proves someone is **signed in** — it does not check roles. Authorization is per route:
    - Every page under `src/app/admin` must redirect a non-admin (`if (me.role !== "ADMIN") redirect("/dashboard")`). A client-component page needs a server wrapper to do it (see `admin/project/page.tsx`).
    - Every handler under `src/app/api/admin` must start with `requireAdmin()` from `src/lib/admin-guard.ts` — **including `GET`**. Unguarded GETs leaked unpublished drafts once; do not hand-roll a new guard.
  - Validate request bodies with zod before they reach Prisma, and never spread a request body into a Prisma `data` object.

## 5. Automated AI Blog Generation
- **Endpoint:** `/api/cron/generate-article`
- **Function:** Uses OpenAI API (`gpt-4o`) to write and publish SEO/GEO/AIO optimized articles **in English** (the prompt has always been English — this file used to say Persian).
- **Auth:** `Authorization: Bearer $CRON_SECRET`. The legacy `?secret=` query form still works for one release; remove it and rotate the secret, because URLs are written to access logs.
- **Trigger:** 3 times a week (Mon, Wed, Fri at 08:00 UTC) via GitHub Actions (`.github/workflows/blog-cron.yml`).
- **Rendering:** article HTML is passed through an allowlist in `src/lib/sanitize.ts` before it reaches a reader. Model output is not trusted markup.
- **Required Secrets:**
  - `OPENAI_API_KEY`: Must be set in `.env` and Railway.
  - `CRON_SECRET`: Must be set in `.env` and Railway, matching the secret used in GitHub Actions.
  - `PRODUCTION_DOMAIN`: Must be set in GitHub Secrets for the Action to ping the right URL.

## 6. Money, Orders & Tax
- **CAD is the settlement currency.** Every `priceCents` and order total is Canadian dollars. USD/EUR are display-only conversions (`src/lib/currency.ts`) and must always be labelled indicative.
- **No payment gateway is connected.** Checkout records an order as `PENDING`, says plainly that nothing was charged, and emails buyer + ops + suppliers. Do not add a UI that implies a card was taken.
- `paymentMethod` on `Order` is the buyer's request: `contact` or `net30`. Ops acts on it, so it must stay visible in the admin list and the order detail.
- **Stock is reserved at checkout.** Anything that cancels must give it back — use `restoreStockFor()` in `src/lib/orders.ts`. Order status rolls up from its items via `orderStatusFromItems()`.
- **Sales tax** comes from the destination province (`src/lib/totals.ts`) and is an estimate, confirmed on the follow-up call. Shipping: flat CAD $15, free over CAD $500.
- Job budgets and bid amounts are whole dollars (Int), not cents — use `formatDollars`, not `formatCents`.

## 7. Directory Structure
- `src/app/`: Next.js pages and API routes (`/api/...`).
- `src/components/`: Reusable React components (e.g., `Navbar.tsx`, `Footer.tsx`, UI elements).
- `src/lib/`: Utility functions and shared instances (e.g., Prisma client instantiation).
- `prisma/`: Contains `schema.prisma` and potential migrations.
- `public/`: Static assets (images, fonts). Team images are located in `/images/team/`.
