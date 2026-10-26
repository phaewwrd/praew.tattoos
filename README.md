# Praew.Tattoos

Website and back office for Praew.Tattoos, a tattoo studio in Bangkok. It has a single-page collage site with a booking flow, plus a protected `/admin` for the owner.

**Stack:** Next.js 16 (App Router, TypeScript strict), Tailwind CSS v4, Neon Postgres + Drizzle ORM, better-auth (single admin), TanStack Query / Form / Table, Zod, Cloudinary, Biome, pnpm. All dates and times are Asia/Bangkok. Currency is THB.

## Setup

```bash
pnpm install            # also installs the pre-commit hook (simple-git-hooks)
cp .env.example .env    # fill in the values (see below)
pnpm db:migrate         # apply drizzle/ migrations
pnpm db:seed            # admin user, 3 services, studio settings, sample FAQ (idempotent)
pnpm dev                # http://localhost:3000
```

For local development, set `BETTER_AUTH_URL=http://localhost:3000`, otherwise admin login fails with "Invalid origin". `.env.local` overrides `.env` for Next.js, but the scripts read `.env` only.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `BETTER_AUTH_SECRET` | Random 32+ byte secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Public origin, e.g. `https://praew-tattoos.vercel.app` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin created by `pnpm db:seed`. The password is only set when the account is created; later changes are made in Admin → Settings |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Signed uploads from admin. Optional `CLOUDINARY_UPLOAD_FOLDER` (default `praew-tattoos`) |
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived **Instagram Login** token. It is copied into the DB on first use |
| `CRON_SECRET` | Protects the cron route. Vercel sends it as `Authorization: Bearer …` |

Never commit real values. `.env*` is gitignored, except `.env.example`.

## Database and migrations

- Schema: `db/app-schema.ts` (app tables) and `db/auth-schema.ts` (better-auth tables).
- One active booking per slot is enforced by the partial unique index `bookings_active_slot_unique` (status `pending`/`confirmed`). Bookings are created in a transaction that locks the slot row.
- After a schema change, run `pnpm db:generate` and then `pnpm db:migrate`.
- Full reset (**drops every table**): `pnpm db:reset`. It prints the target host and only proceeds with `--yes <host>`. Then run `pnpm db:migrate && pnpm db:seed`.

## Instagram

The site uses the **Instagram API with Instagram Login** (`graph.instagram.com`). The Basic Display API is discontinued, and Facebook-Login tokens do not work here.

1. In the Meta developer app, open Instagram → API setup with Instagram login, then generate a token for the Praew.tattoos account.
2. Set it as `INSTAGRAM_ACCESS_TOKEN`, or paste it in Admin → Settings → Instagram, where it is verified before saving.
3. Vercel Cron calls `/api/cron/instagram-refresh` daily (20:00 UTC = 03:00 Bangkok, see `vercel.json`) to refresh the token before its ~60-day expiry. You can check the expiry in Admin → Settings.

The feed is cached for 1 hour. If the API fails, the site shows the last cached posts, then the fallback images uploaded in Settings.

## Deploy (Vercel)

1. Import the repo and set all the environment variables above (Production and Preview).
2. Run migrations against the production DB: `DATABASE_URL=… pnpm db:migrate && pnpm db:seed`.
3. Cron jobs from `vercel.json` are picked up automatically (the Hobby plan allows one run per day).

## Code quality

```bash
pnpm lint        # biome check .
pnpm format      # biome format --write .
pnpm check       # biome check --write . (format + safe fixes + sort imports/classes)
pnpm typecheck   # next typegen && tsc --noEmit
```

The pre-commit hook and GitHub Actions (`.github/workflows/ci.yml`) both run `lint` and `typecheck`.

## Project layout

```
app/                 routes (public site, /faq, /admin, API routes)
components/site/     public collage components
components/admin/    admin UI helpers (uploader, cards, badges)
server/              server-only data access (bookings, slots, customers, instagram…)
lib/validation/      shared Zod schemas (client + server)
lib/action.ts        server action wrapper: admin check, Zod validation, typed errors
lib/fonts.ts         the three type styles
db/                  Drizzle schema + client
scripts/             seed and reset
```

## Assets still to supply

- Cross-stitch lettering for the logo and the P / T corner letters. Text placeholders using the Silkscreen font are in `components/site/SiteHeader.tsx`.
- Heart drawing for the selected day. An SVG placeholder is used until one is uploaded in Admin → Calendar images.
- Monthly calendar paintings. The mushroom is the fallback.
