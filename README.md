# INVECS Autocentrum: redesign concept

> **Unofficial redesign concept by David Tulio. Not affiliated with INVECS Autocentrum.**
> For the real dealer, visit [invecs.ph](https://www.invecs.ph/).

A full-stack, mobile-first redesign of a Philippine used-car dealer's website, built for my portfolio.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Zod · Cloudflare Turnstile · Vitest · Vercel

## Status

- [x] Phase 1: setup, design tokens, layout, header/footer, home page (temporary local data)
- [ ] Phase 2: database and public pages
- [ ] Phase 3: loan calculator and inquiries
- [ ] Phase 4: admin
- [ ] Phase 5: polish, security check and case study

## Run it locally

```bash
npm install
cp .env.example .env.local   # values needed from Phase 2 onward
npm run dev                  # http://localhost:3000
```

`npm run build` and `npm run lint` must pass before every commit.

## Concept safeguards

- A banner on every page says this is an unofficial concept and links to the official site.
- Every page sends `noindex, nofollow` (meta tag and `X-Robots-Tag` header), and `robots.txt` disallows all crawlers.
- The logo is a plain text wordmark; no logo or photos are copied from the dealer.
- Inquiry forms run in demo mode and don't reach the dealer.

## Sample data

All cars, prices and mileages are **sample data**, modelled on the kinds of cars the dealer lists. They are not real listings.

## Photo credits

Car photos come from Unsplash and Pexels under their free licences. Credits are added here in Phase 2.
