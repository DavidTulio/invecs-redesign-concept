# Security

This is an unofficial portfolio concept, but it runs as a real website with a real database, so it is maintained like one.

## Reporting a problem

If you find a security issue, please don't open a public GitHub issue. Contact the author, David Tulio, through the contact details on his portfolio, and include steps to reproduce it.

## What is in place

| Layer | Protection |
|---|---|
| Dependencies | Exact versions only (`.npmrc` has `save-exact=true`; `package-lock.json` is committed). Dependabot opens a pull request when an update or security fix is available. |
| Continuous checks | GitHub Actions runs on every push, every pull request and every Monday: `npm audit` (fails on high or critical issues in production code), package signature check, type check, lint and unit tests. |
| Runtime | Node.js 24.x on Vercel, which applies Node security patches within the 24.x line automatically. |
| Database | Row Level Security on every table; the public key can only read cars, photos and branches. Only the server (secret key) can save inquiries. |
| Admin | Three checks on every request: the proxy, `requireAdmin()` in every page and Server Action, and Row Level Security. Public sign-up is disabled in Supabase. |
| Forms | Cloudflare Turnstile verified on the server, honeypot field, signed time stamp, rate limit stored in Postgres, Zod validation on the server. |
| Uploads | Admin only, JPG/PNG/WebP checked by their first bytes, 5 MB maximum, random file names. SVG is never accepted or optimised. |
| Browser | Content Security Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, restricted permissions. |

## Update routine

**When a security advisory is published** for Next.js, React, Node.js, Supabase or another dependency:

1. Check whether this project is affected: `npm audit` and `npm ls <package>`.
2. Update to the fixed version with an exact version number, for example `npm install --save-exact next@16.4.3`. Never use `npm audit fix --force`, which can install breaking major versions.
3. Run `npm run build`, `npm run lint` and `npm test`, then try the main pages, the test-drive form and the admin login with `npm run build && npm run start`.
4. Commit, push, and check that the Vercel deployment and the GitHub Actions run both pass.

**Every week:** review and merge Dependabot pull requests after their Vercel preview and CI checks pass.

**Every few months:** confirm Vercel's Node.js version is still a supported LTS line (Project Settings → Build and Deployment → Node.js Version).

## Secrets

- `SUPABASE_SECRET_KEY` and `TURNSTILE_SECRET_KEY` live only in `.env.local` (never committed) and in Vercel's environment variables marked **Sensitive**.
- If a secret may have leaked: create a new key in the Supabase or Cloudflare dashboard, update it in Vercel and `.env.local`, redeploy, then delete the old key.
- Use two-factor authentication on the GitHub, Vercel, Supabase and Cloudflare accounts. A stolen account password is a bigger risk than any library bug.

## Security update log

| Date | Change |
|---|---|
| 2026-10-26 | Next.js 16.4.0 → 16.4.3 and React 19.3.0 → 19.3.1, fixing GHSA-2464-fhr4-w9xw (image optimisation RCE), GHSA-673q-mjm6-r5xr (`use cache` RCE) and GHSA-p3m5-59mp-jv5r (Server Actions DoS). Pinned all dependencies to exact versions; added Dependabot, the CI workflow and this file. |
