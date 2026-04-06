# Hipster Holiday

## Stack

Astro + React, static output, GitHub Pages. No Tailwind — scoped CSS in Astro components.

## Structure

- `src/pages/index.astro` — countdown landing page
- `src/pages/YYYY/index.astro` — yearly themed event pages
- `src/components/` — shared components (Countdown, InviteGallery)
- `src/layouts/Base.astro` — shared layout (fonts, global styles, atmosphere)
- `public/invites/` — invite images for gallery
- `public/YYYY/assets/` — year-specific static assets
- `public/CNAME` — custom domain config

## Design

- Fonts: Cormorant Garamond (display) + Outfit (body)
- Colors: `#0a0806` bg, `#bf3a2b` accent red, `#d4a853` gold, `#ede4d4` text
- Warm radial glow for atmosphere (no film grain — it was removed)
- Countdown targets the 2nd Friday of December at 6 PM MST dynamically
- Gallery is centered on the page with a fixed floating timeline nav on the right
- Year labels sit to the left of each card, pulled out of flow to keep cards centered
- Timeline nav includes the upcoming year (linked to countdown hero) plus all archived years
- Yearly event pages include a fixed "Back" link in the top left

## Yearly Workflow

1. Create `src/pages/YYYY/index.astro` + `public/YYYY/assets/`
2. Add invite image to `public/invites/` and update array in `InviteGallery.astro`
3. Update the `data-year` value for the countdown dot in `InviteGallery.astro` to the new year
4. After event, ensure countdown remains the root landing page
