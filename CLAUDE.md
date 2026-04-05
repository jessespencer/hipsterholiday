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
- Film grain overlay + warm radial glow for atmosphere
- Countdown targets the 2nd Friday of December at 6 PM MST dynamically

## Yearly Workflow

1. Create `src/pages/YYYY/index.astro` + `public/YYYY/assets/`
2. Add invite image to `public/invites/` and update array in `InviteGallery.astro`
3. After event, ensure countdown remains the root landing page
