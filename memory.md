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
- **Styling Guidelines (UI/UX):** 
  - The app uses a dark theme. The main background color is `#0a0c0e`.
  - The primary accent color is Red (e.g., `text-red-400`, `bg-red-600`).
  - Use glassmorphism effects for cards and dropdowns (`bg-white/5`, `border-white/10`, `backdrop-blur-md`).
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
