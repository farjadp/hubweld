# HubWeld Launch Website

A modern HubWeld marketing site built with Vite, React, and TypeScript. It is designed as a premium launch page for a certified welding and fabrication network.

## What is included

- Premium industrial UI with responsive layout
- Conversion-focused hero, service cards, quote form, industry band, trust points, and FAQ section
- SEO metadata in `index.html`
- Open Graph and Twitter metadata
- Organization structured data JSON-LD
- AEO-friendly FAQ content
- GEO-focused copy around local and regional welding coverage
- `robots.txt` and `sitemap.xml`

## Run locally

```bash
npm install
npm run dev
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Required Environment Variables

To fully utilize all features (including Automated AI Blog Generation), you need the following in your `.env`:

```env
DATABASE_URL="file:./dev.db" # SQLite URL
NEXTAUTH_SECRET="your-super-secret"
NEXTAUTH_URL="http://localhost:3000"

# For Automated AI Article Generation
OPENAI_API_KEY="sk-..."
CRON_SECRET="your-secure-random-string"
```

## Build for production

```bash
npm run build
npm run preview
```

## Launch checklist

- Replace placeholder form behavior with CRM, email, or booking integration
- Add real company phone, address, service territories, and social profiles
- Add a real Open Graph image at `/public/og-image.jpg`
- Expand city and service landing pages for stronger local SEO
- Add customer testimonials, certifications, insurance details, and case studies
- Connect analytics, Search Console, and conversion tracking
