# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-10-20

### Security
- **Admin API**: every handler under `/api/admin` now goes through one
  `requireAdmin()` guard. The `GET` handlers on the blog post, tag and category
  routes had no check at all, so unpublished drafts were readable by anyone.
- **Blog image upload**: the file extension came from the uploaded filename, so
  an `.html` or `.svg` could be written into a statically served directory.
  Extensions now come from an allowlist and a 5 MB cap applies.
- **Article HTML** is filtered through an allowlist (`sanitize-html`) before it
  is rendered — it is mostly raw model output.
- **Uploaded documents** (résumés) now require a session; images stay public.
  Responses carry `X-Content-Type-Options: nosniff`.
- **Cron secret** moves from the query string to an `Authorization` header, so
  it stops appearing in proxy and platform access logs.
- **Request validation**: the blog and project-board routes passed the request
  body straight into Prisma, which allowed writes to any column. They validate
  with zod like the rest of the API.

### Fixed
- **Uploads no longer vanish on deploy**: the blog upload route wrote to
  `public/uploads`, ignoring `UPLOAD_DIR`, so every blog image was lost on the
  next Railway redeploy.
- **Navbar links were invisible**: `text-white` survived the dark-to-light
  theme change, so Blog / Shop / Jobs / Welders disappeared on hover and when
  active.
- **Net 30 requests were dropped**: checkout collected `paymentMethod`,
  validated it, then discarded it. It is stored on the order and shown in the
  buyer, ops and order-detail views.
- **Sales tax** was a flat 8% — a rate that exists nowhere in Canada — applied
  to CAD orders. It is now derived from the destination province and quoted as
  an estimate, with the total recomputed as the address is typed.
- **Cancelled orders leaked stock**: checkout reserves stock, but no cancel
  path existed. Buyers (while pending) and admins can cancel; the stock goes
  back. A cancelled line no longer blocks an order from reaching `SHIPPED`.
- **Blog views were counted twice** per request and on every crawler hit.
- Low-contrast colours left over from the dark theme (`text-violet-400`,
  `text-amber-300`, `text-brand/60`, small `text-slate-300` copy).
- The undeclared `amber` accent is gone; prices and links follow the documented
  system. `backdrop-blur` removed from the navbar per "no glassmorphism".
- Content images are lazy-loaded; the article cover loads eagerly as the LCP
  element.

### Changed
- **Production migrations**: `docker-entrypoint.sh` ran
  `prisma db push --accept-data-loss` on every boot, which could silently drop
  a production column. It now applies real migrations and fails loudly.
  `prisma/migrations/0_init` is the baseline; existing databases are baselined
  automatically.
- `/jobs` and `/directory` are paginated and ordered in the database instead of
  loading every row and sorting in JavaScript.
- `robots.txt` disallows `/admin`, `/api/`, `/dashboard`, `/cart`, `/checkout`,
  `/orders`, `/login`, `/register`.
- `/admin/project` has a server-side role check like every other admin page.
- README rewritten — it described a Vite app with a `preview` script.
- Removed `hash.js`, `check_links.js` and the tracked empty `prisma/dev2.db`.

## [Unreleased] - 2026-06-01

### Added
- **About Us Section**: Introduced a comprehensive company section with three new pages:
  - `/about`: Company story, mission, and core values with glassmorphism UI.
  - `/about/product`: Detailed feature breakdown of the B2B Marketplace and Service Marketplace.
  - `/about/team`: A sleek, responsive grid displaying founders and leadership with their respective roles, descriptions, and LinkedIn profiles.
- **Team Avatars**: Added actual high-quality photos for all 5 team members (Elyas, Sarvenaz, Farid, Reza, Farjad) to the `/about/team` page.
- **Navbar Update**: Added a new "Company" dropdown menu to the main navigation (Desktop and Mobile) linking to the new About pages.

### Changed
- Translated all newly created About Us and Team pages into formal English for better accessibility and professional presentation.

### Fixed
- Addressed deployment issues on Railway related to SQLite database persistence by communicating the required changes for `.gitignore` and volume mounts.
