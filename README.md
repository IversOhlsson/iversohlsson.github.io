# iversohlsson.github.io

One-page site for Philip Ivers Ohlsson: software built, launched and looked after.
Vite + React + TypeScript, deployed to GitHub Pages from `main`.

All text lives in `src/content/site.ts`. "Book a meeting" opens a prefilled Google Calendar event with Philip as guest; set `BOOKING_PAGE` in that file to a Google appointment-schedule link to use that instead. The auto-playing workflow player (`src/components/Workflow.tsx`, stories in `src/components/scenarios.ts`), the building-blocks grid (`src/components/Capabilities.tsx`) are sections of the same page. Layout and styles are in `src/App.tsx` and `src/App.module.css`.

```bash
npm ci
npm run dev
npm run build
```

Branches: `main` is this site. `portfolio-v1` is the previous portfolio, kept as is.
