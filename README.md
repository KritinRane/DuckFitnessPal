# DuckFitnessPal

A MyFitnessPal-style macro tracker for Stevens Institute of Technology students, automatically synced with Pierce Dining Hall's daily menu from DineOnCampus.

## Features

- Daily menu auto-synced from DineOnCampus (Pierce Dining Hall)
- One-click meal logging with macro tracking
- Visual macro dashboard with progress bars
- Adjustable serving size multipliers
- Personal food log with delete support

## Stack

- **Frontend/Backend**: Next.js 16 (App Router) + TypeScript
- **Database**: SQLite via Prisma (swap to PostgreSQL for production)
- **Scraper**: Python 3 hitting the DineOnCampus JSON API
- **Styling**: Tailwind CSS 4

## Getting Started

```bash
# Install dependencies
npm install

# Initialize the database
npx prisma migrate dev --name init

# Run the development server
npm run dev
```

## Running the scraper manually

```bash
cd scraper
pip install -r requirements.txt
python scrape.py
```

The scraper POSTs results to `/api/menu/sync` and runs via cron at 12:01 AM daily.
