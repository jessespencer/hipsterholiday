# Hipster Holiday

Annual holiday party site at [hipsterholiday.com](https://hipsterholiday.com). Built with Astro + React, deployed to GitHub Pages.

Between events, the site shows a countdown to the next party (always the 2nd Friday of December at 6 PM MST). Each year gets a unique themed page archived at `/YYYY/`.

The landing page features a centered invite gallery with a floating timeline nav on the right for quick year navigation, plus a warm atmospheric glow aesthetic.

## Dev

```bash
npm install
npm run dev     # starts on localhost:4321
npm run build   # static output to dist/
```

## Deployment

Push to `main` to deploy via GitHub Pages.

## Structure

- `src/pages/index.astro` — countdown + invite gallery landing page
- `src/pages/YYYY/index.astro` — yearly themed event pages
- `src/components/Countdown.astro` — dynamic countdown timer
- `src/components/InviteGallery.astro` — archive gallery with timeline nav
- `src/layouts/Base.astro` — shared layout (fonts, global styles, atmosphere)
- `public/invites/` — invite images for gallery
- `public/YYYY/assets/` — year-specific static assets
