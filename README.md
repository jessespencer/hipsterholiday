# Hipster Holiday

Annual holiday party site at [hipsterholiday.com](https://hipsterholiday.com). Built with Astro + React, deployed to GitHub Pages.

Between events, the site shows a countdown to the next party (always the 2nd Friday of December at 6 PM MST). Each year gets a unique themed page archived at `/YYYY/`.

The landing page opens on a header themed to the upcoming party (for 2026, a dark bedroom you explore with a nightlight until you find who's still awake), followed by the event details, an RSVP form, and the invite archive (with a floating year nav while you browse it).

## Dev

```bash
npm install
npm run dev     # starts on localhost:4321
npm run build   # static output to dist/
```

## Deployment

Push to `main` to deploy via GitHub Pages.

## RSVPs

RSVPs land in a Google Sheet you own. One-time setup:

1. Create a Google Sheet (e.g. "Hipster Holiday RSVPs").
2. In the Sheet, open **Extensions → Apps Script**, replace the starter code with `scripts/rsvp-sheet.gs`, and save.
3. Click **Deploy → New deployment**, choose **Web app**, set *Execute as* to **Me** and *Who has access* to **Anyone**, then **Deploy** and approve the permissions.
4. Copy the web app URL (ends in `/exec`) into `RSVP_ENDPOINT` in `src/data/event.ts`, then commit and push.

Responses appear in an `RSVPs` tab. If you change the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Structure

- `src/pages/index.astro` — the one-page site (nav, header, details, RSVP, archive, footer)
- `src/data/event.ts` — this year's party details and the RSVP endpoint
- `src/pages/hipster-holiday.ics.ts` — the "Add to calendar" file, built from `event.ts`
- `scripts/rsvp-sheet.gs` — Google Apps Script that saves RSVPs to a Google Sheet
- `src/pages/YYYY/index.astro` — yearly themed event pages
- `src/components/Hero2026.astro` — this year's interactive themed header
- `src/components/CountdownTimer.astro` — dynamic countdown timer
- `src/components/Countdown.astro` — plain countdown header (fallback)
- `src/components/InviteGallery.astro` — archive gallery with timeline nav
- `src/layouts/Base.astro` — shared layout (fonts, global styles, atmosphere)
- `public/invites/` — invite images for gallery
- `public/YYYY/assets/` — year-specific static assets
