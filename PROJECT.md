# Task: Rework the existing Praew.Tattoos project to match the spec below

This is an EXISTING project that already has Next.js, better-auth and an Instagram API
integration installed. Reuse that setup instead of scaffolding a new app. A reference design
screenshot is attached; match its look and layout (collage / vintage record-player theme).

## 0. Working rules
- All existing DATA (bookings, customers, images, admin accounts, etc.) may be deleted.
  The database schema may be dropped and recreated from scratch to match section 5.
  No data-preserving migrations are needed. Still: make sure DATABASE_URL points to the
  intended Neon database/branch before resetting, and print which database host you are about to reset.
- Reuse the working infrastructure: Next.js app and config, better-auth setup, Instagram API
  integration (token handling/fetch code), env setup, Vercel config. Review each, fix or extend
  it to meet this spec, and do not rewrite it from zero unless it is broken or conflicts with the spec.
- Existing pages, components and tables that do not match this spec can be replaced or deleted.
  Remove dead code and unused dependencies when you are done.
- Work on a new git branch (e.g. `feat/redesign`); never commit to main directly.
- Ask me only about decisions that are irreversible outside this repo (for example deleting
  Cloudinary assets or touching production Vercel settings).

## Phase 1: Short audit (no code changes yet)
Write `docs/audit.md` with:
1. Current stack, versions, router type (App Router or Pages), package manager, linter/formatter.
2. How better-auth is configured (plugins, adapter, sign-up setting) and how the Instagram
   integration works (which API, where the token is stored, whether refresh exists).
3. What will be KEPT, what will be CHANGED, what will be DELETED.
4. Dependencies to add/remove.
Then continue straight into Phase 2 without waiting for me.

## 1. Target tech stack
- Next.js (App Router) + TypeScript (strict). If the project is on the Pages Router, migrate it to the App Router.
- Tailwind CSS
- Neon serverless Postgres (@neondatabase/serverless) with Drizzle ORM
- better-auth (admin auth only), already installed: keep and reconfigure
- TanStack Query; TanStack Form and TanStack Table where useful
- Zod for all validation (shared schemas for client and server)
- Cloudinary for all images (signed uploads from admin)
- Biome for linting and formatting. Remove ESLint and Prettier configs/deps once Biome passes.
  biome.json: recommended rules, space indentation, double quotes, organize imports on, Tailwind
  class sorting if supported. Scripts: "lint": "biome check .", "format": "biome format --write .",
  "check": "biome check --write ."
- Keep the project's current package manager (detect from the lockfile).
- Deploy on Vercel. All dates/times in Asia/Bangkok. Currency THB. Site language: English only.

## 2. Business info (store in `site_settings`, editable in admin)
- Name: Praew.Tattoos
- Location: Bangkok, Thailand. Full address NOT shown publicly; text:
  "Full studio details are shared with confirmed appointments."
- Nearest MRT: Bangson (Purple line and Red line), exit 5, about 10 minutes' walk
- Map link: https://share.google/k5y0rPDuMLHB0XbsD
- Opening hours: Tue–Sun 11:00–18:00, closed Monday
- Instagram: Praew.tattoos
- Phone / WhatsApp: 062-145-6941 (same number)
- Email: praew.tattoos@gmail.com
- LINE: none

## 3. Public website (single main page, full-screen collage layout)
Top navigation: SERVICES, INSTAGRAM, LOCATION, CONTACT US, QUESTION.
- SERVICES, INSTAGRAM: smooth-scroll to the section
- LOCATION: modal (city, MRT info, "full details shared with confirmed appointments", button to open the map link)
- CONTACT US: modal (phone, WhatsApp link, email, Instagram link)
- QUESTION: navigates to /faq (content from DB)

### 3.1 Service cards (left, tilted polaroid-style cards, yellow/blue tones)
Each card shows only: image, name, "START AT {price} THB".
Seed services: Minimal Tattoo 1500, Realistic 2500, Color Realistic 2500.

### 3.2 Instagram strip
- Horizontal row of recent posts with a "next" arrow, live from the Instagram API
  (Instagram API with Instagram Login; Basic Display API is discontinued). Reuse the existing integration.
- Token from env INSTAGRAM_ACCESS_TOKEN, copied to the DB on first use. Long-lived token (~60 days):
  ensure automatic refresh exists via Vercel Cron on a protected route (CRON_SECRET), Hobby-plan
  compatible (max once/day). Add it if missing.
- Cache (revalidate ~1h). On API failure show last cached result; if none, show admin-uploaded fallback images.
- Each image links to the post on Instagram.

### 3.3 Record-player carousel (center) + service photos (right)
- Center card is a carousel over the services: red turntable image, service name in place of the
  song title, "START AT {price} THB" as subtitle, previous/next buttons switch service.
- Progress bar shows position (e.g. 1 of 3). No shuffle or repeat buttons.
- Play button toggles a CSS rotation animation on the red turntable platter (no audio).
- On the right, the big black vinyl shows the selected service's photos in the grey boxes. The number
  of photos per service is not fixed; lay out flexibly, extras scroll/paginate. Photos rotate/move with
  the vinyl and change with the selected service.

### 3.4 Booking section (bottom)
- Left: monthly calendar with hand-lettered English month name (e.g. NOVEMBER), weekdays starting
  Monday (MON … SUN), and a decorative hand-painted image that changes per month (admin uploads one
  per month; fallback = mushroom illustration).
- Days with at least one free slot are selectable; days without slots or in the past are dimmed.
  Selecting a day shows a hand-drawn heart over the date (SVG placeholder until the real asset arrives).
- Time slots show for the selected day; booked slots are disabled.
- Form fields (ONLY these): Name (First and Last), Phone number / WhatsApp, Email, plus selected date and time.
  Zod validation (email format, Thai/international phone, non-empty name).
- Right: yellow notepad-style note with a live preview (date, time, name, email, phone) and a CONFIRM button.
- On CONFIRM: create a booking with status Pending, lock the slot immediately, then change the note to a
  thank-you state: "Request received" plus a line saying the studio will email to confirm and arrange the deposit.
- No payment on the site. No automatic emails/notifications. No customer-side edit/cancel.
- Each slot allows exactly 1 active booking (Pending/Confirmed), enforced at DB level (partial unique
  index on slot_id where status in ('pending','confirmed')) and handled safely in a transaction.
- No min/max advance-booking rules; availability is controlled only by the slots the admin opens.

### 3.5 Visual style
- Palette (approx.): cream #F7F3E8, dark red #A01010, mauve-grey #8B7878 for image placeholders,
  soft yellow #FFF0B8 and blue #86C5D8 for service cards.
- Three type styles: (a) cross-stitch lettering image for the logo "Praew.Tattoos" and the P / T corner
  letters, (b) a handwriting Google Font for form labels, month names, note, (c) a bold sans-serif
  Google Font in dark red for nav and service names. Keep fonts in one config file.
- Cross-stitch lettering PNG/SVG will be supplied later; use text placeholders in the same position.
- Fully responsive. On mobile, re-flow vertically: header/logo, services, record-player carousel (with
  service photos), Instagram strip, booking section. Keep tilted cards, lettering, collage feel, colors.
- Accessibility: alt text, focus states, keyboard-operable calendar and modals, respect prefers-reduced-motion.

## 4. Admin back office (/admin, protected)
Auth: better-auth (already installed), email + password, ONE admin (the owner), public sign-up
disabled. Existing admin accounts may be deleted; create the admin via a seed script using
ADMIN_EMAIL and ADMIN_PASSWORD. Protect all /admin routes and admin actions on the server.

Pages:
1. **Dashboard**: count of Pending bookings (prominent), today's and tomorrow's appointments.
2. **Bookings**: table (TanStack Table), filters by status/date, search, calendar view. Statuses:
   Pending, Confirmed, Completed, Cancelled, No-show. Pending and Confirmed lock the slot; Cancelled
   releases it automatically. Admin can create a booking manually and optionally attach a service and
   an internal note.
3. **Slots**: manage free slots, 1-hour, one booking each:
   - pick a day, tick times 11:00–17:00
   - select multiple days and apply the same set of times
   - copy slots from the previous week
   - delete/close slots with no booking
   - add custom times not on the hour (e.g. 14:30)
   - default hint: Tue–Sun 11:00–18:00, Monday closed (hint only)
4. **Customers**: created/merged automatically from bookings (match on email or phone). Features: list +
   search by name/phone/email, full booking history per customer, edit, internal admin notes, tags
   (e.g. "no deposit", "regular"), delete, add manually. No CSV export.
5. **Services**: add/edit/delete/reorder (name, price); upload and reorder any number of photos per
   service (Cloudinary).
6. **Calendar images**: decorative image per month and the heart drawing for a selected day.
7. **FAQ**: add/edit/delete/reorder Q&A pairs shown on /faq.
8. **Settings**: studio info (section 2), Instagram token status/expiry, fallback Instagram images,
   change password.

## 5. Data model (recreate from scratch with Drizzle)
admin users/sessions (better-auth tables), site_settings, services, service_images,
slots (date, start_time, is_open), customers, customer_notes, customer_tags (+ join), bookings
(customer_id, slot_id, status, optional service_id, admin_note, timestamps), faqs, month_images,
instagram_cache, instagram_fallback_images. Sensible indexes and constraints. Timestamps in UTC,
rendered in Asia/Bangkok. Use a clean initial migration.

## 6. Engineering requirements
- Zod validation on client and server for every input.
- Public booking endpoint: rate limit + honeypot.
- Secrets only via env vars: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, INSTAGRAM_ACCESS_TOKEN, CRON_SECRET, ADMIN_EMAIL,
  ADMIN_PASSWORD. Update .env.example. Never print or commit real secrets.
- `biome check .` and `tsc --noEmit` must pass after each step in section 7. Add a pre-commit hook
  and a GitHub Actions job running both (update existing CI if there is one).
- Idempotent seed script: admin, 3 services, default settings, sample FAQ.
- Update README: setup, env vars, migrations, deploy, Instagram token, cron, Biome commands.
- Server Components where possible; TanStack Query for client mutations and admin data.
- SEO basics: title/description/Open Graph, sitemap, robots (noindex for /admin).
- Privacy note near the booking form: data used only for appointment purposes.

## 7. Implementation order
1. Phase 1 audit (`docs/audit.md`).
2. Tooling: Biome, CI, env example. Verify the app still builds.
3. Reset DB: new Drizzle schema + initial migration + seed.
4. Auth alignment (better-auth, single admin, sign-up disabled).
5. Admin: services, slots, bookings, customers, FAQ, calendar images, settings.
6. Public site sections (desktop), then the booking flow end to end.
7. Instagram integration review + cron refresh.
8. Mobile layout, polish, accessibility, README.
After each step: run build, `biome check .`, `tsc --noEmit`, summarize what changed, and commit.
At the end, give me a changelog and a manual QA checklist (booking flow, double-booking race,
admin flows, mobile).