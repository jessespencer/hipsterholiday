# Hipster Holiday

A static event website for Hipster Holiday — a Stranger Things-themed Friendsmas gathering. Hosted at [hipsterholiday.com](https://hipsterholiday.com).

## About

Hipster Holiday is an annual holiday event site that provides event details, theming, and RSVP collection via an embedded Google Form. The 2025 edition features an 80s Hawkins aesthetic with festive holiday vibes.

## Tech Stack

- Pure HTML + CSS (no JavaScript frameworks)
- Google Fonts (Figtree)
- GitHub Pages hosting
- Embedded Google Form for RSVPs

## Project Structure

```
hipsterholiday/
├── index.html          # Single-page website
├── CNAME               # Custom domain config
├── NOTICE.md           # Copyright and brand usage
└── assets/
    ├── hh-2025-banner.jpg
    ├── hh-2025-logo.png
    └── hh-2025-social.jpg
```

## Running Locally

No build process required — just open `index.html` in a browser or start a local server:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deployment

Push to the `main` branch to deploy automatically via GitHub Pages.
