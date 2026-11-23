# Hipster Holiday

## Stack

Astro + React, static output, GitHub Pages. No Tailwind — scoped CSS in Astro components.

## Structure

- `src/pages/index.astro` — home: top nav, `Countdown` hero with a button into this year's invite, the "This Year" feature, archive of past years, footer
- `src/pages/YYYY/index.astro` — yearly invite pages; the current year's (`/2026/`) is the link texted to guests: themed hero, details, RSVP
- `src/components/` — shared components (TopNav, CountdownTimer, Countdown, EventDetails, RsvpForm, InviteGallery, SiteFooter) plus the current year's themed hero (`HeroYYYY.astro`)
- `src/data/event.ts` — the upcoming party's copy (date, location, details), calendar start/end times, and the RSVP endpoint URL
- `src/pages/2026/hipster-holiday.ics.ts` — builds the "Add to calendar" file from `event.ts`
- `scripts/rsvp-sheet.gs` — Google Apps Script that receives RSVPs into a Google Sheet (not part of the build)
- `src/components/forest/` — the 2025 page's scroll-parallax poster (React island): `layers.ts` holds plane order, depths and motion defaults; `sceneData.ts` is generated; open `/2025/?debug` under `astro dev` for the tuning panel
- `scripts/parallax-2025/` — source art and `build_layers.py`, which writes the planes to `public/2025/assets/parallax/` (needs Python 3.12 + numpy, pillow, opencv-python-headless; not part of the build)
- `src/layouts/Base.astro` — shared layout (fonts, global styles, atmosphere)
- `public/invites/` — invite images for gallery
- `public/YYYY/assets/` — year-specific static assets
- `public/CNAME` — custom domain config

## Design

- Fonts: Cormorant Garamond (display) + Outfit (body)
- Colors: `#0a0806` bg, `#ede4d4` text, and one accent across the whole site, set in `Base.astro` (`--gold`, `#d4a853` for 2026, to match the photo's warm light). Images on cream (the light poster) use a deeper gold, `#a9782a`, so it stays readable
- Warm radial glow for atmosphere (no film grain — it was removed)
- Countdown targets the 2nd Friday of December at 6 PM MST dynamically
- The invite page's hero is themed to the year (`Hero2026.astro`: dark bedroom, nightlight tour then pointer/touch control, reveal on the baby; the site ignores the OS Reduce Motion setting, so the light always glides) and embeds `CountdownTimer`; `Countdown.astro` is the home page's hero, set in the invite's Fraunces: "Hipster" over "*Holiday* {year}" on its own line, and the boxed countdown with Fraunces numbers; home's section headings use Fraunces too
- Home's link preview is `public/og-home.jpg`; the invite page passes its own
- 2026 hero is a "poster": verse + punchline together on top, the room in the middle, title + countdown along the bottom with "View the invite" and "Add to calendar" buttons
- Theme font for 2026 is Fraunces (`--font-theme`); home features the current year's invite in its own "This Year" section (`ThisYear.astro`), and the archive below holds past years only
- One title treatment everywhere (home, the invite, the nav logo, the poster and link previews): "Hipster" upright in cream, *Holiday* italic in the accent, the year upright in cream
- Gallery is centered on the page with a floating timeline nav on the right that only shows while the archive is in view
- Year labels sit to the left of each card, pulled out of flow to keep cards centered
- Never publish the home address: the site says "At the Spencer home" and guests get the address another way
- RSVPs post (no-cors) to a Google Apps Script web app; with no `RSVP_ENDPOINT` set the form says RSVPs aren't open yet
- Every page (home, the invite page, 2025) shares one `TopNav` of fixed landmarks: brand → home ("Hipster *Holiday*" with Holiday in the accent italic; "HH" on the smallest phones), "This Year ’YY" (just "YYYY" on phones) → the invite page, a divider, Archive → `/#archive`, RSVP → the invite page's form; an accent underline marks the current place. Labels come from `event.ts`, so the nav needs no props

## Yearly Workflow

1. Create `src/pages/YYYY/index.astro` + `public/YYYY/assets/`
2. Build the year's themed hero (`src/components/HeroYYYY.astro`, keep `id="countdown-hero"` and use `CountdownTimer`) and render it in `src/pages/YYYY/index.astro` with the details, RSVP and a `YYYY/hipster-holiday.ics.ts`; save the invite to `public/invites/`
3. Update `src/data/event.ts` (year, date, details copy; home links to `/{year}/` from it) and start a fresh RSVP sheet tab if wanted
4. After the event, add that year (with `link: "/YYYY/"`) to the top of the `invites` array in `InviteGallery.astro` so it moves from "This Year" into the archive
