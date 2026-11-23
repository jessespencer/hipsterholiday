# Hipster Holiday

## Stack

Astro + React, static output, GitHub Pages. No Tailwind — scoped CSS in Astro components.

## Structure

- `src/pages/index.astro` — home: top nav, `Countdown` hero with a button into this year's invite, archive, footer
- `src/pages/YYYY/index.astro` — yearly invite pages; the current year's (`/2026/`) is the link texted to guests: themed hero, details, RSVP
- `src/components/` — shared components (TopNav, CountdownTimer, Countdown, EventDetails, RsvpForm, InviteGallery, SiteFooter) plus the current year's themed hero (`HeroYYYY.astro`)
- `src/data/event.ts` — the upcoming party's copy (date, location, details), calendar start/end times, and the RSVP endpoint URL
- `src/pages/2026/hipster-holiday.ics.ts` — builds the "Add to calendar" file from `event.ts`
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
- The invite page's hero is themed to the year (`Hero2026.astro`: dark bedroom, nightlight tour then pointer/touch control, reveal on the baby; under Reduce Motion the light fades between stops) and embeds `CountdownTimer`; `Countdown.astro` is the home page's plain hero
- `TopNav` takes each page's links and RSVP button as props; home's link preview is `public/og-home.jpg`, the invite page passes its own
- 2026 hero is a "poster": verse + punchline together on top, the room in the middle, title + countdown along the bottom with "View the invite" and "Add to calendar" buttons; gold is reserved for the punchline, the year, and the baby
- Theme font for 2026 is Fraunces (`--font-theme`); the archive on home leads with the current year, whose card links to its invite page
- One accent per page: home runs on red (`<Base accent="red">` swaps the gold tokens), themed invite pages keep their own (gold for 2026)
- Gallery is centered on the page with a floating timeline nav on the right that only shows while the archive is in view
- Year labels sit to the left of each card, pulled out of flow to keep cards centered
- Never publish the home address: the site says "At the Spencer home" and guests get the address another way
- RSVPs post (no-cors) to a Google Apps Script web app; with no `RSVP_ENDPOINT` set the form says RSVPs aren't open yet
- Past yearly pages (2025) have a fixed "Back" link in the top left; the current invite page uses the top nav, whose brand goes home

## Yearly Workflow

1. Create `src/pages/YYYY/index.astro` + `public/YYYY/assets/`
2. Build the year's themed hero (`src/components/HeroYYYY.astro`, keep `id="countdown-hero"` and use `CountdownTimer`) and render it in `src/pages/YYYY/index.astro` with the details, RSVP and a `YYYY/hipster-holiday.ics.ts`; save the invite to `public/invites/`
3. Update `src/data/event.ts` (year, date, details copy; home links to `/{year}/` from it) and start a fresh RSVP sheet tab if wanted
4. Add the year (with `link: "/YYYY/"`) to the top of the `invites` array in `InviteGallery.astro` once its invite is ready
