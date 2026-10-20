# HubWeld

A dual-marketplace platform for the welding industry, built with **Next.js 14 (App Router)**, **Prisma**, **NextAuth** and **Tailwind CSS**.

1. **B2B equipment marketplace** — suppliers list products; contractors and welders buy them.
2. **Service marketplace** — customers post welding jobs; certified welders bid, message, deliver and get reviewed.

Plus an admin area (users, suppliers, products, orders, blog, project board) and an AI-assisted blog.

## Run locally

```bash
npm install
cp .env.example .env     # then fill in the values
npm run db:push          # create the SQLite dev database
npm run db:seed          # catalogue, articles, demo users
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

See [.env.example](.env.example) for the full list with comments. The minimum to boot:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

Everything else degrades gracefully: without `RESEND_API_KEY` mail is logged instead of sent, without `OPENAI_API_KEY` the AI blog tools return a clear error, and uploads fall back to `public/uploads`.

## Database

Two schemas, one codebase:

| File | Datasource | Used by |
| --- | --- | --- |
| `prisma/schema.prisma` | SQLite | local development |
| `prisma/schema.prod.prisma` | PostgreSQL | the Docker image and Railway |

Keep them in step — **a model change must be made in both files.** The Dockerfile and the entrypoint copy the prod schema over `schema.prisma` at build and boot.

Because `contains` is case-sensitive on Postgres and not on SQLite, all text search goes through `src/lib/search.ts`. Use it rather than a bare `contains`.

### Migrations

Production applies migrations explicitly — `prisma migrate deploy` in `docker-entrypoint.sh`. It used to run `db push --accept-data-loss` on every boot, which could drop a column and its data without a trace.

```bash
npm run db:migrate   # create a migration while developing (Postgres URL required)
npm run db:deploy    # apply pending migrations (what production runs)
npm run db:push      # SQLite dev shortcut, no migration history
```

`prisma/migrations/0_init` is the baseline. A database that predates migrations is baselined automatically on first boot (`migrate resolve --applied 0_init`). A migration failure stops the container on purpose: serving traffic against an unknown schema is worse than not starting.

## Deployment (Railway)

- Build is the `Dockerfile` (multi-stage, standalone output, runs as a non-root user).
- Mount a **persistent volume at `/app/data`**. `UPLOAD_DIR=/app/data/uploads` is set in the image, so uploads survive redeploys; files are served through `/api/files/<name>`.
- Set `DATABASE_URL` (Postgres), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and the optional mail/OpenAI variables.

## Money

CAD is the settlement currency: every `priceCents` and every order total is Canadian dollars. USD and EUR are display-only conversions from a stored rate table (`src/lib/currency.ts`), labelled as indicative in the UI. Override the rates with `FX_RATE_USD` / `FX_RATE_EUR`.

Sales tax comes from the destination province (`src/lib/totals.ts`), quoted as an estimate; shipping is flat CAD $15 and free over CAD $500.

**No payment gateway is connected.** Checkout records the order as `PENDING`, tells the buyer plainly that nothing has been charged, and emails the buyer, ops and each supplier. Payment is arranged out of band. Cancelling an order releases the stock it reserved.

## AI blog generation

- `POST /api/admin/blog/ai-generate` — admin-only. Writes from a topic, a draft, or a scraped URL. The URL fetcher validates every redirect hop against private address ranges (see the SSRF guard in that file).
- `GET /api/cron/generate-article` — writes and publishes one article in English. Authenticate with `Authorization: Bearer $CRON_SECRET`; the old `?secret=` form still works for one release and should then be removed (and the secret rotated, since URLs end up in logs).
- Scheduled by `.github/workflows/blog-cron.yml` (Mon/Wed/Fri 08:00 UTC). Needs `PRODUCTION_DOMAIN` and `CRON_SECRET` in GitHub secrets.

Article HTML is run through an allowlist (`src/lib/sanitize.ts`) before it reaches a reader.

## Mobile app API

The Expo app in `mobile/` uses the same API routes as the site. `getCurrentUser()` (`src/lib/current-user.ts`) accepts either the NextAuth cookie or `Authorization: Bearer <access token>`, so one handler and one set of permission rules serve both clients. **Use it, not `getServerSession`, in any non-admin route.** Admin routes stay cookie-only.

- `POST /api/mobile/auth/login` → access token (15 min) + refresh token (60 days, sliding). Refresh tokens are stored hashed in `MobileSession` and rotate on every `POST /api/mobile/auth/refresh`, so each one works once.
- `POST /api/mobile/auth/logout` revokes the device; `PUT /api/mobile/push-token` registers its Expo push token.
- Read endpoints the app needs: `/api/me`, `/api/me/jobs`, `/api/me/bids`, `/api/products`, `/api/products/[id|slug]`, `/api/categories`, `/api/jobs`, `/api/jobs/[id]`, `/api/orders`, `/api/orders/[id]`, `/api/supplier/products`, `/api/supplier/order-items`, `/api/welders`, `/api/welders/[id]`.
- Response shapes are in `src/lib/api-types.ts` (import-free, shared with the app); mappers in `src/lib/api-dto.ts`. Return a mapped shape, never a raw Prisma row.
- Push notifications go out through Expo (`src/lib/push.ts`): new bid, bid accepted, message, job status, new/cancelled order, item shipped. `notifyUsers()` never throws and is not awaited.
- `DELETE /api/account` anonymises the account (both stores require in-app deletion, and Google Play also wants a web page: `/dashboard/account#delete`). Orders are kept for tax records.

## Conventions

- Server components fetch with Prisma directly; `"use client"` only where state or browser APIs are needed.
- Every route under `/api/admin` starts with `requireAdmin()` from `src/lib/admin-guard.ts`, and every page under `/app/admin` redirects a non-admin.
- Request bodies are validated with zod before they reach Prisma.
- Client mutations go through `mutate()` in `src/lib/api.ts` so server error messages are surfaced instead of swallowed.
- UI follows the "Forged Industrial · Daylight" system described in [memory.md](memory.md): light surfaces, red reserved for action and status, no glassmorphism.

## Launch checklist

- Connect a payment gateway and remove the "card payments unavailable" notices
- Add real company phone, address, service territories, and social profiles
- Add a real Open Graph image at `/public/og-image.jpg`
- Confirm the sales-tax table against HubWeld's own registrations
- Connect analytics, Search Console, and conversion tracking
