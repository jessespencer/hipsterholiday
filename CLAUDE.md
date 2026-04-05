# Hipster Holiday

## Overview

Annual holiday party site. Each December gets a uniquely themed event page; between events, the root `index.html` is a countdown timer targeting the 2nd Friday of December at 6 PM MST.

Hosted on GitHub Pages at hipsterholiday.com. Push to `main` to deploy.

## Tech Stack

- Static HTML/CSS/JS — no frameworks, no build tools, no package.json
- Google Fonts (Figtree)
- GitHub Pages hosting with custom domain (CNAME file)
- Embedded Google Forms for RSVPs on themed pages

## Architecture

- `index.html` — countdown page (the "interim" landing page between events)
- `YYYY/index.html` — archived themed site for that year (e.g., `2025/`)
- `YYYY/assets/` — images and assets scoped to that year
- `.nojekyll` — prevents GitHub Pages from running Jekyll

## Key Conventions

- Each year's site is fully self-contained in its own `YYYY/` directory
- Asset paths in archived pages should be relative (`assets/foo.jpg`), not absolute GitHub URLs
- OG/Twitter meta image URLs in archives should use `https://hipsterholiday.com/YYYY/assets/...`
- The countdown JS dynamically calculates the 2nd Friday of December — no hardcoded dates
- Event time is always 6 PM MST (UTC-7, since December = MST in Colorado)
- The countdown page's archive links section must be updated when a new year is archived

## Yearly Swap Process

1. Create `YYYY/` with themed `index.html` and `YYYY/assets/`
2. When ready to go live, replace root `index.html` with the themed page
3. After the event, restore the countdown `index.html` at root
4. Add the new year to the "Past events" links in the countdown page

## Code Style

- No build tools — everything is inline HTML/CSS/JS
- Keep files self-contained (embedded styles and scripts, no external CSS/JS files)
- Use the existing color palette: `#010310` (bg), `#d81e1e` (accent red), `#11131f` (card bg)
- Font: Figtree via Google Fonts
- Responsive design with mobile breakpoints
