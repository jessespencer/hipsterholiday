# Hipster Holiday

An annual holiday party site hosted at [hipsterholiday.com](https://hipsterholiday.com). Each year gets a unique theme — between events, the site shows a live countdown to the next Hipster Holiday (always the 2nd Friday of December).

## Project Structure

```
hipsterholiday/
├── index.html           # Countdown page (default landing)
├── CNAME                # Custom domain config
├── NOTICE.md            # Copyright and brand usage
├── .nojekyll            # Disable Jekyll processing
├── 2025/                # Archived 2025 site (Stranger Things theme)
│   ├── index.html
│   └── assets/
│       ├── hh-2025-banner.jpg
│       ├── hh-2025-logo.png
│       └── hh-2025-social.jpg
└── (future: 2026/, 2027/, ...)
```

## How It Works

- **Countdown page** (`index.html`): A self-contained HTML/CSS/JS page that dynamically counts down to 6 PM MST on the 2nd Friday of December. Once the date passes, it automatically targets the next year.
- **Yearly archives** (`YYYY/`): Each year's themed site lives in its own folder with its own assets. Accessible at `hipsterholiday.com/YYYY/`.

## Yearly Workflow

1. Create a `YYYY/` folder with the new themed site and assets
2. When the themed site is ready, replace root `index.html` with the themed page
3. After the event, restore the countdown `index.html` and add the year to the archive links

## Running Locally

```bash
python3 -m http.server 8000
# Countdown: http://localhost:8000
# 2025 archive: http://localhost:8000/2025/
```

## Deployment

Push to `main` to deploy automatically via GitHub Pages.
