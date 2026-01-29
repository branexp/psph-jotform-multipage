# PSPH Website - Copilot Instructions

## Project Overview

Multipage landing site template for **Public School Pension Help (PSPH)** — pension guidance for K-12 educators. No build process; files served directly via Apache.

**This is a template site** designed to be cloned for multiple landing pages. The root URL (`/`) serves the schedule/appointment form, while `/home` contains the marketing content.

**Site is noindexed** — blocked from search engines via `robots.txt` and meta tags.

**Domain configuration:** Update the `DOMAIN:` line in `.htaccess` when deploying to a new domain.

**Critical:** JotForm handles all form logic (form ID: `251803846453157`)—never add custom validation, PHP, or backend code.

## File Structure

```
index.html              # Root page: JotForm embed for appointment booking (main entry point)
home.html               # Marketing: hero, how-it-works, calendar, testimonials, FAQs
privacy.html, terms.html # Legal pages with .legal-content section
styles/style.css        # Single CSS file with design tokens in :root
scripts/main.js         # IIFE module: mobile nav, calendar, carousel, JotForm loading
assets/data/reviews.json # Testimonial data (first name, state, job_title, review_text)
assets/img/             # SVG logos, favicons, placeholder graphics
.htaccess               # Clean URLs, HTTPS enforcement, CSP headers, noindex header
robots.txt              # Disallow all crawlers
```

## Developer Workflow

**Local testing:** Serve with any static server (e.g., `npx serve` or VS Code Live Server). Test CSP by checking browser console for violations.

**Adding pages:** Copy header/footer structure from `privacy.html`. Update both `.nav` and `.mobile-nav` links to match. Use clean URL format in links (`/schedule` not `/schedule.html`).

## CSS Design Tokens

All styling uses CSS custom properties in `styles/style.css`:

```css
--primary: #002169;      /* Navy - brand, headers, .cta.active */
--accent: #FFCD00;       /* Yellow - CTAs, .btn-primary */
--secondary: #334D87;    /* Body text, .gray aliases this */
--font-sans: 'Merriweather Sans'  /* Nav, buttons, body text */
```

**Never duplicate `:root`**—extend existing declarations.

## Button & CTA Classes

| Class | Usage |
|-------|-------|
| `.btn-primary` | Yellow background, dark text (main CTAs) |
| `.btn-secondary` | Outline style, primary border |
| `.cta` | Header CTA; add `.cta.active` + `aria-current="page"` on current page (inverts to navy/white) |

## JavaScript Patterns (`scripts/main.js`)

All code runs inside an IIFE with `'use strict'`. Key modules:

- **`initCalendar()`**: Renders `#calendarGrid`. Future weekdays (Mon-Sat) get `.available`, link to `/` (schedule form). Never hardcode dates.
- **`initTestimonialCarousel()`**: Fetches `/assets/data/reviews.json`, uses `textContent` (not innerHTML) to prevent XSS. Auto-rotates every 6s with touch swipe.
- **`initMobileMenu()`**: `.mobile-menu-btn` toggles `.mobile-nav.active`. Both navs must mirror link order.
- **`initJotFormLoading()`**: Adds `.loaded` class to `.jotform-loading` wrapper when iframe loads.

## Data: reviews.json

```json
{
  "reviews": [{
    "reviewer": "Jonathan",
    "review_text": "...",
    "state": "New Hampshire",
    "job_title": "High School Mathematics Teacher",
    "school_district": "Nashua School District",
    "time_posted": "4 months ago"
  }]
}
```

All fields required. Carousel displays: `job_title`, `state`. First name only for `reviewer`.

## URL & Navigation

`.htaccess` enforces clean URLs—always use clean paths (`/home`, `/privacy`), never `.html` extensions. Trailing slashes stripped.

**URL structure:**
- `/` — Schedule form (index.html, main entry point)
- `/home` — Marketing page with hero, calendar, testimonials, FAQs
- `/privacy`, `/terms` — Legal pages

**Linking conventions:**
- From schedule page (root): link to `/home#section-id`
- From legal pages: link to `/home#section-id`  
- From home page: use `#section-id` for same-page anchors, `/` for schedule
- Logo links to `/home` (marketing page)

**Active states:**
- Nav links: `.active` or `aria-current="page"`
- Header CTA on root (schedule): `.cta.active` + `aria-current="page"`

## CSP & External Resources

`.htaccess` Content-Security-Policy whitelist:

| Directive | Allowed domains |
|-----------|-----------------|
| `script-src` | `'self'`, `form.jotform.com`, `cdn.jotfor.ms`, `js.jotform.com` |
| `style-src` | `'self'`, `'unsafe-inline'`, `fonts.googleapis.com`, `cdnjs.cloudflare.com` |
| `font-src` | `'self'`, `fonts.gstatic.com`, `cdnjs.cloudflare.com` |
| `connect-src` | `'self'`, `api.jotform.com` |
| `frame-src` | `form.jotform.com` |

To add new external resources: update the CSP in `.htaccess`, test in browser console for violations.

## Accessibility Requirements

- `aria-label` on icon-only buttons (calendar nav, carousel controls, mobile menu)
- `aria-current="page"` on active nav links
- `aria-live="polite"` on carousel track
- `tabindex="0"` + `role="button"` on clickable calendar cells
- `<noscript>` fallbacks for calendar and JotForm

## Brand Voice

Friendly, trustworthy tone for K-12 educators:
- Key phrases: "independent & conflict-free", "privacy first", "no products, no commissions"
- CTAs: "Schedule an Appointment", "Learn About Your Pension"
