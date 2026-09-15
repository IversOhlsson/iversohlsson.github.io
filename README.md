# iversohlsson.github.io

One-page site for Philip Ivers Ohlsson: software built, launched and looked after.
Vite + React + TypeScript, deployed to GitHub Pages from `main`.

All text lives in `src/content/site.ts`. The booking picker (`src/components/Booking.tsx`) sends requests through `FORM_ENDPOINT` in that file (a Formspree URL) or, when empty, opens the visitor's email app with the request prefilled. The auto-playing workflow player (`src/components/Workflow.tsx`, stories in `src/components/scenarios.ts`), the building-blocks grid (`src/components/Capabilities.tsx`) are sections of the same page. Layout and styles are in `src/App.tsx` and `src/App.module.css`.

```bash
npm ci
npm run dev
npm run build
```

Branches: `main` is this site. `portfolio-v1` is the previous portfolio, kept as is.
