# Phase 1 audit (2026-10-26)

Audit of the existing `praew.tattoos` repo, done before the redesign described in `PROJECT.md`.

## 1. Stack

| Item | Current |
| --- | --- |
| Framework | Next.js **16.3.6**, **App Router** (`app/`), Turbopack by default |
| React | 19.2.8 |
| TypeScript | 5.x, `strict: true`, path alias `@/*` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) plus about 900 lines of hand-written CSS in `app/globals.css` |
| DB | Neon (`@neondatabase/serverless` 1.1, WebSocket `Pool`) + Drizzle ORM 0.45.3 / drizzle-kit 0.31.11 |
| Auth | better-auth 1.7.5 + `@better-auth/drizzle-adapter` |
| Data | TanStack Query 5 (provider is mounted but barely used) |
| Images | Cloudinary SDK v2 (server-side stream upload through a server action / route) |
| Package manager | **pnpm 10.21.0** (`pnpm-lock.yaml`, `packageManager` field) |
| Lint/format | **Biome 2.5.14** is already installed, and `lint` / `format` / `check` scripts already exist. There are no ESLint or Prettier configs or deps. |
| Node | Local v22. Next 16 requires 20.9+. |
| CI / hooks | No `.github/` folder and no pre-commit hook |
| Vercel | No `vercel.json` yet |

Current health:
- `biome check .` fails with 2 errors and 5 warnings: CSS specificity problems and an unsorted import.
- `tsc --noEmit` fails only because stale `.next/types` point to routes that were deleted earlier. A fresh build fixes it.
- `next.config.ts` keeps `serverActions.bodySizeLimit = 5mb`, which is only needed for the server-side upload. It allows Cloudinary images in `next/image`.
- `.env` and `.env.local` both point `DATABASE_URL` to Neon host `ep-billowing-glitter-b380874z-pooler.c-4.ap-southeast-1.aws.neon.tech`, database `/neondb`.

## 2. Auth and Instagram

### better-auth (`lib/auth.ts`)
- Drizzle adapter (`provider: "pg"`) using `db/auth-schema.ts` (user / session / account / verification).
- `emailAndPassword.enabled: true`. **Sign-up is not disabled**: `POST /api/auth/sign-up/email` is publicly reachable. It creates a `role: "user"` account, which the admin guard rejects, but it is still open.
- Extra user fields: `role` (default `user`) and `disabled`. Plugins: `nextCookies()` only.
- `lib/admin-auth.ts` checks `getSession`, `role === "admin"` and `!disabled`. It is used in the `(dashboard)` layout and in the actions.
- `scripts/create-admin.ts` creates the admin through `signUpEmail` and then promotes it. It fails if the email already exists, so it is not idempotent.
- `BETTER_AUTH_SECRET` is **not set** in `.env`. It must be added (and also on Vercel).
- There is no `proxy.ts` (the Next 16 name for middleware).

### Instagram (`app/api/instagram/route.ts`, `components/InstagramFeed.tsx`)
- It uses the **Instagram API with Facebook Login**: `graph.facebook.com/{version}/{IG_BUSINESS_ACCOUNT_ID}/media` with `META_ACCESS_TOKEN`, `META_GRAPH_API_VERSION` and `INSTAGRAM_BUSINESS_ACCOUNT_ID`.
- The token lives **in env only**. Nothing is stored in the DB, there is **no refresh**, and failures have no fallback. The response is `revalidate: 300`, and the route returns `debug: result.error` to the public, which leaks information.
- The client component fetches `/api/instagram` in a `useEffect`.
- **Spec conflict:** the spec asks for the *Instagram API with Instagram Login* (`graph.instagram.com`, a long-lived token refreshed via `refresh_access_token`), using `INSTAGRAM_ACCESS_TOKEN`. A Facebook-Login token **cannot** be refreshed through that endpoint. The redesign therefore switches to `graph.instagram.com/me/media` and `graph.instagram.com/refresh_access_token`. **Action for the owner:** generate a long-lived *Instagram Login* token (Meta App → Instagram → API setup with Instagram login) and set it as `INSTAGRAM_ACCESS_TOKEN`. After that, the `META_*` and `INSTAGRAM_BUSINESS_ACCOUNT_ID` vars can be removed.

## 3. Keep / change / delete

**Keep (review/extend)**
- Next config, Tailwind v4 / PostCSS setup, tsconfig, pnpm.
- `db/index.ts`: Neon WebSocket Pool + Drizzle. It must load the full schema (it currently loads only `tattoo-schema`).
- `db/auth-schema.ts`: better-auth tables. `role` and `disabled` are kept.
- `lib/auth.ts`, `lib/admin-auth.ts`, `app/api/auth/[...all]/route.ts`, the login form, and the logout action.
- `lib/cloudinary.ts`: config is kept. Uploads change to **signed direct uploads** (server signs, browser uploads to Cloudinary).
- `components/providers/QueryProvider.tsx`, `lib/utils.ts` (`cn`), `lib/server-response.ts` pattern.
- Biome (already in place) and its scripts.

**Change**
- `lib/auth.ts`: `disableSignUp: true`, an explicit `secret` / `baseURL`, and server-side admin creation that bypasses the disabled sign-up.
- `scripts/create-admin.ts` → becomes part of an idempotent `scripts/seed.ts`.
- Instagram: switch to the Instagram Login API, store the token in the DB, add a daily Vercel Cron refresh (`/api/cron/instagram-refresh`, protected by `CRON_SECRET`), cache posts in `instagram_cache`, and fall back to cached posts and then to admin-uploaded images.
- Admin layout / sidebar: new navigation that matches the spec's 8 sections.
- `app/layout.tsx`: new fonts (one config file), metadata/OG, English only.
- `globals.css`: rewritten for the collage theme with palette tokens.

**Delete**
- Schema and migrations: all of `drizzle/*` and `db/tattoo-schema.ts` (artists, portfolios, portfolio categories, payments, contact messages, schedule blocks, old slots/appointments/clients). They are replaced by one clean initial migration.
- Admin pages: artists, portfolio, payments, messages, schedule (replaced by **slots**), clients (replaced by **customers**), and the `/api/admin/artists/portfolio` route.
- Public sections: Hero, Portfolio, Location (Leaflet map), Services list, Availability, Contact, SiteHeader/Footer/MobileMenu, the `components/map/*`, `components/ui/calendar.tsx` (react-day-picker).
- Old services/hooks/types/utils tied to the above (`services/*`, `hooks/*`, `types/*`, `utils/*`), rebuilt as needed.
- `public/*.jpg` stock photos. They are not referenced by the new design; service photos come from Cloudinary.
- Old docs under `docs/features/*`, `docs/FEATURES.md` and `docs/PROJECT.md` (already deleted in the working tree).

## 4. Dependencies

**Add:** `zod`, `@tanstack/react-form`, `@tanstack/react-table`, `simple-git-hooks` (pre-commit).

**Remove:** `leaflet`, `react-leaflet`, `@types/leaflet`, `react-day-picker`, `types` (a stray, unrelated package), `ws` (Node 22 / Vercel ship a global `WebSocket`).

**Keep:** `next`, `react`, `react-dom`, `better-auth`, `@better-auth/drizzle-adapter`, `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`, `@tanstack/react-query`, `cloudinary`, `clsx`, `tailwind-merge`, `dotenv`, `tsx`, `tailwindcss`, `@tailwindcss/postcss`, `@biomejs/biome`, `typescript`, `@types/*`.

## Open items for the owner

- **The reference design screenshot is not in the repo.** The layout is built from the written spec. Drop the image into `docs/` to allow a closer visual pass.
- Instagram needs a new **Instagram Login** long-lived token (see above).
- `BETTER_AUTH_SECRET` and `CRON_SECRET` need to be set locally and on Vercel. This repo does not touch Vercel settings.
- Old Cloudinary assets (`artists/` folder) are **not** deleted from Cloudinary. Only the DB references go.
