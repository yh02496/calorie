# NutriTrack

A mobile-first calorie and nutrition tracker built with Vite + React + TypeScript. Fully local — no AI or cloud dependencies, just a fast fuzzy-search food database.

## Features

- Onboarding with BMR/TDEE-based calorie and macro targets
- Food logging via local fuzzy search (1,000+ item database across 19 categories) or manual entry
- Optional photo attachment when logging a meal (filename used as a search hint — no AI image analysis)
- Daily dashboard with calorie ring, macro breakdown, and meal list
- Weight logging and progress charts
- Water tracking and reminders
- All data persisted locally (no server, no account)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run typecheck` — run TypeScript in `--noEmit` mode
- `npm run preview` — preview the production build locally

## Project structure

```
src/
  main.tsx              Entry point
  App.tsx               Top-level app state & routing between views
  types.ts              Shared TypeScript types
  constants.ts          Meal labels, activity factors, etc.
  calculations.ts       BMR / TDEE / macro target math
  storage.ts            LocalStorage persistence
  selectors.ts          Derived state (daily totals, chart data, summaries)
  foodDatabase.ts        1,000+ item local food database
  foodSearch.ts          Local fuzzy search (Levenshtein + keyword scoring)
  index.css              Global styles
  components/            UI components (Onboarding, Dashboard, LogFood, etc.)
```

## Notes

- No API keys or environment variables are required — everything runs locally in the browser.
- Food search matches on name and keyword similarity; it won't recognize a food it doesn't already know about, but the database covers a wide range of home-cooked, restaurant, and international dishes.
