# Hipster Holiday

## Stack

Astro + React, static output, GitHub Pages. No Tailwind — scoped CSS in Astro components.

## Structure

- `src/pages/index.astro` — one-page site: top nav, themed hero, details, RSVP, archive, footer
- `src/pages/YYYY/index.astro` — yearly themed event pages
- `src/components/` — shared components (TopNav, CountdownTimer, Countdown, EventDetails, RsvpForm, InviteGallery, SiteFooter) plus the current year's themed hero (`HeroYYYY.astro`)
- `src/data/event.ts` — the upcoming party's copy (date, location, details) and the RSVP endpoint URL
- `scripts/rsvp-sheet.gs` — Google Apps Script that receives RSVPs into a Google Sheet (not part of the build)
- `src/layouts/Base.astro` — shared layout (fonts, global styles, atmosphere)
- `public/invites/` — invite images for gallery
- `public/YYYY/assets/` — year-specific static assets
- `public/CNAME` — custom domain config

## Design

- Fonts: Cormorant Garamond (display) + Outfit (body)
- Colors: `#0a0806` bg, `#bf3a2b` accent red, `#d4a853` gold, `#ede4d4` text
- Warm radial glow for atmosphere (no film grain — it was removed)
- Countdown targets the 2nd Friday of December at 6 PM MST dynamically
- The landing hero is themed to the upcoming year (`Hero2026.astro`: dark bedroom, pointer-driven nightlight, reveal on the baby) and embeds `CountdownTimer`; `Countdown.astro` is the plain fallback hero
- Theme font for 2026 is Fraunces (`--font-theme`); the archive gallery holds past years only
- Gallery is centered on the page with a floating timeline nav on the right that only shows while the archive is in view
- Year labels sit to the left of each card, pulled out of flow to keep cards centered
- Never publish the home address: the site says "At the Spencer home" and guests get the address another way
- RSVPs post (no-cors) to a Google Apps Script web app; with no `RSVP_ENDPOINT` set the form says RSVPs aren't open yet
- Yearly event pages include a fixed "Back" link in the top left

## Yearly Workflow

1. Create `src/pages/YYYY/index.astro` + `public/YYYY/assets/`
2. Build the year's themed hero (`src/components/HeroYYYY.astro`, keep `id="countdown-hero"` and use `CountdownTimer`) and render it in `index.astro`; save the invite to `public/invites/`
3. Update `src/data/event.ts` (date, details copy) and start a fresh RSVP sheet tab if wanted
4. After the event, add that year to the `invites` array in `InviteGallery.astro` so it joins the archive
