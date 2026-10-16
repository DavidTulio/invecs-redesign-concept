# INVECS Autocentrum: redesign concept

> **Unofficial redesign concept by David Tulio. Not affiliated with INVECS Autocentrum.**
> For the real dealer, visit [invecs.ph](https://www.invecs.ph/).

A full-stack, mobile-first redesign of a Philippine used-car dealer's website, built for my portfolio.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Zod · Cloudflare Turnstile · Vitest · Vercel

## Status

- [x] Phase 1: setup, design tokens, layout, header/footer, home page
- [x] Phase 2: database, Row Level Security, seed data, inventory filters, car pages
- [x] Phase 3: loan calculator, inquiry form with spam protection, branches page
- [ ] Phase 4: admin
- [ ] Phase 5: polish, security check and case study

## Run it locally

1. Create a Supabase project. Turn **off** "Automatically expose new tables"; the migrations grant access table by table.
2. In Supabase → SQL Editor, run each file in [`supabase/migrations/`](supabase/migrations/) once, in number order (`0003` is optional).
3. Create a Cloudflare Turnstile widget (hostname `localhost` for development).
4. Copy `.env.example` to `.env.local` and fill in the Supabase URL, publishable key and secret key (Project Settings → API Keys) and the Turnstile site and secret keys.
5. Then:

```bash
npm install
npm run db:seed   # loads the sample cars and uploads their photos
npm run dev       # http://localhost:3000
npm test          # unit tests (loan maths, form rules, filters)
```

`npm run build`, `npm run lint` and `npm test` must pass before every commit.

## Inquiry form security

Each layer was tested with real attack attempts (direct API calls, tampered requests, bots and floods).

| Threat | Protection |
|---|---|
| Bypassing the website and writing to the database directly | Visitors have no insert permission on `inquiries`; only the server (secret key) saves, after every check below |
| SQL injection | Values are sent separately from the query (parameterised by Supabase/PostgREST); no SQL is built from input |
| Spam bots | Cloudflare Turnstile verified on the server, hidden honeypot field, signed "too fast" time stamp |
| Flooding | 5 attempts per visitor per 10 minutes, counted atomically in Postgres; IPs stored only as an HMAC hash |
| Bad or oversized input | One Zod schema checked in the browser and again on the server, plus database constraints |
| Script injection (XSS) | React renders input as text; Content Security Policy limits scripts to this site and Cloudflare |
| Cross-site form posts (CSRF) | Next.js Server Actions reject requests from other origins |
| Privacy | Only needed fields; inquiries auto-delete after 30 days |

## Concept safeguards

- A banner on every page says this is an unofficial concept and links to the official site.
- Every page sends `noindex, nofollow` (meta tag and `X-Robots-Tag` header), and `robots.txt` disallows all crawlers.
- The logo is a plain text wordmark; no logo or photos are copied from the dealer.
- Inquiry forms run in demo mode and don't reach the dealer.

## Sample data

All cars, prices, mileages and descriptions are **sample data** ([`scripts/seed-data.ts`](scripts/seed-data.ts)), modelled on the kinds of cars the dealer lists. They are not real listings.

## Photo credits

Car photos are from [Unsplash](https://unsplash.com) and used under the [Unsplash License](https://unsplash.com/license). Each photo was checked to show the same model as its sample listing, but it is not the actual car for sale.

| Car | Photographer |
|---|---|
| 2023 Ford Everest Titanium+ 2.0 Bi-Turbo 4x4 | [Duc Van](https://unsplash.com/photos/gCE639_EJXk) |
| 2022 Toyota Innova 2.8 E Diesel | [Zoshua Colah](https://unsplash.com/photos/1gpG9X34UWI) |
| 2022 Toyota Innova 2.8 E Diesel | [Zoshua Colah](https://unsplash.com/photos/i7iC4G_FjQA) |
| 2021 Toyota Hilux Conquest 2.8 4x4 | [Shrawan Choudhary](https://unsplash.com/photos/c2kxNwDcPZo) |
| 2021 Toyota Fortuner 2.8 V 4x4 | [Devan Mnn](https://unsplash.com/photos/9Px9UR-wZkQ) |
| 2019 Mazda CX-5 2.0 FWD Pro | [Ryan Collins](https://unsplash.com/photos/969FKoxL-KU) |
| 2019 Mazda CX-5 2.0 FWD Pro | [Ryan Collins](https://unsplash.com/photos/8mY0pDJfzPw) |
| 2021 Ford Ranger Raptor 2.0 Bi-Turbo | [Paolo Resteghini](https://unsplash.com/photos/z8Jq1vrv9NI) |
| 2020 Ford Ranger Wildtrak 2.0 4x2 | [Cassiano K. Wehr](https://unsplash.com/photos/zLl2Rw686Lc) |
| 2019 Ford Everest Titanium 2.0 4x2 | [Nidhil Amen](https://unsplash.com/photos/fiEUp1hFzgI) |
| 2017 Toyota Hilux G 2.4 4x2 | [Cassiano K. Wehr](https://unsplash.com/photos/tvi8dUU3ULk) |
| 2016 BMW 3 Series 318d Sport | [Александр Бендус](https://unsplash.com/photos/e5-IZROAAx0) |
| 2017 Jeep Wrangler Unlimited Sahara | [Talia](https://unsplash.com/photos/sBPnD3jzQ7g) |
| 2018 Honda Civic 1.5 RS Turbo | [Harrison Fitts](https://unsplash.com/photos/zE2VGbJSYns) |
| 2016 Nissan Patrol Royale 5.6 V8 4x4 | [Jimith Varghese](https://unsplash.com/photos/5xWWiUzVosU) |
| 2015 Mitsubishi Pajero BK 3.2 4x4 | [Abuli Munavary](https://unsplash.com/photos/6oFXfp6diMM) |
| 2018 Ford F-150 XLT 3.5 EcoBoost | [David French](https://unsplash.com/photos/v-nQKGEWIKg) |
| 2012 Nissan Patrol Super Safari 3.0 4x4 | [Petko Boiadjiev](https://unsplash.com/photos/Gjhd1ou3VhU) |
| 2012 Nissan Patrol Super Safari 3.0 4x4 | [Petko Boiadjiev](https://unsplash.com/photos/Gp37cJRJYCI) |
| 2017 Toyota Vios 1.3 E | [lens zone](https://unsplash.com/photos/OeetzjQR1Z0) |
| 2017 Toyota Vios 1.3 E | [lens zone](https://unsplash.com/photos/MBPnn_5celI) |
| 2008 Mitsubishi Montero Sport GLS 2.5 4x4 | [Sergio Gómez](https://unsplash.com/photos/BHGFpY_iHis) |
| 1998 Ford F-150 XLT SuperCab | [Dan Williams](https://unsplash.com/photos/dyKsaQ2JfQQ) |
| 2021 Nissan Navara VL 2.5 4x4 | [Šimom Caban](https://unsplash.com/photos/NrBc2oOaKU8) |

## Notes for the case study

Problems found on the original site, beyond the brief's list:

- On the contact page, the link labelled "+63917-510-3858" actually dials +63920-963-3858.
