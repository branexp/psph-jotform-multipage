# Copilot instructions (PSPH static multipage)

## Big picture
- Static template site (no build step). Pages are served directly.
- `index.html` (path `/`) is the main entry: schedules via JotForm embed `251803846453157`.
- `home.html` (path `/home`) is the marketing page (hero, calendar, testimonials, FAQs).
- `privacy.html` and `terms.html` (paths `/privacy`, `/terms`) are legal pages sharing the same header/footer patterns.

## Routing + caching (Apache)
- `.htaccess` enforces HTTPS, redirects `www` to apex, strips trailing slashes, and rewrites clean paths to `.html`.
- Link using clean paths like `/home`, `/privacy` (avoid `.html` in links).
- `.htaccess` sets long-lived caching for `.css/.js/.woff*`; HTML files use `?v=YYYYMMDD` query strings for cache busting (bump these when deploying).

## Local dev
- If you need clean URLs (`/home`) locally, run behind Apache so `.htaccess` rewrite rules apply.
- With a simple static server, you may need to open `home.html` directly (clean-path rewrites won’t work).

## CSS conventions
- All styling is in `styles/style.css`; extend tokens in the existing `:root` block (don’t duplicate `:root`).
- Shared nav styles rely on `.nav a.active` / `[aria-current="page"]` and `.cta.active` / `[aria-current="page"]`.

## JavaScript conventions
- JS is plain, small IIFEs with `'use strict'` and an `init()` on `DOMContentLoaded`.
- `scripts/main.js` (used by `home.html`, legal pages):
  - Mobile menu toggles `.mobile-nav.active` + `aria-expanded`.
  - Calendar renders `#calendarGrid`; future Mon–Sat cells get `.available` and navigate to `/`.
  - Testimonials fetch `assets/data/reviews.json` and render via `textContent` (no `innerHTML`).
- `scripts/schedule.js` (used by `index.html`) only initializes the mobile menu.

## Integration constraints
- JotForm owns scheduling logic; don’t add custom form validation/backends—only adjust the embed/linking around the JotForm form.
