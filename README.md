# iversohlsson.github.io

Consultancy site for Philip Ivers Ohlsson: greenfield systems, built and hosted.
Single scrolling page, Vite + React + TypeScript, deployed to GitHub Pages from `main`.

## Edit the copy

Everything the page says lives in `src/content/site.ts` (hero, offer, case study,
pipeline steps, principles, ops, approach, work, contact). Layout components under
`src/components/` only render that data.

- `SystemMap.tsx` is the hand-laid SVG of the Aether Space runtime.
- `Pipeline.tsx` renders the PDF-to-need path as a trace (code / model / human / store).
- `AuroraBackground.tsx` is the WebGPU particle field with a CSS fallback.

## Run

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build into dist/
npm run lint
```

## Branches

- `main`: this site.
- `portfolio-v1`: the previous multi-panel portfolio, kept as is.
