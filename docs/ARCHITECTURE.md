# Architecture

A concise map of the codebase for anyone picking it up cold.

## What it does

Fingerprint Radar measures your browser's fingerprinting signals entirely in the
tab, computes each one's Shannon-entropy contribution against a bundled
reference table, and shows a live total-bits score, a "1 in N" uniqueness
estimate, an identifiability band, and a per-signal breakdown — all on a radar
scope. No network calls.

## Data flow

```
signals/index.collectAll()      →  raw signals  [{ id, label, value, bucket, detail }]
        │  (per-collector, guarded)
        ▼
report.computeReport(signals)
   ├─ scoring.scoreSignals   → probability + bits per signal (via reference table)
   ├─ explanations           → plain-English text per signal
   └─ uniqueness             → total bits → 1-in-N + Low/Medium/High band
        ▼
   report { scored[], totalBits, oneInN, band }
        │
        ├─ ui.renderReport(root, report)   → score, breakdown rows, gauge (DOM)
        ├─ radar.setSignals(scored)        → blips ping onto the scope (canvas)
        ├─ sound.ping()                    → synthesized sonar blip per signal
        └─ summary.buildSummary(report)    → copy-to-clipboard text export
```

`app.mountApp(root)` orchestrates all of the above; `main.js` is the entrypoint
that calls it and renders a designed error state on failure.

## Key modules (`src/`)

| File | Responsibility |
|---|---|
| `entropy.js` | Pure bit math: `shannonEntropyBits(p)`, `combineIndependentBits`. |
| `uniqueness.js` | `oneInN`, `estimateUniqueness(signals)`, `identifiabilityBand(bits)`. |
| `scoring.js` | Map a collected signal's bucket → probability → bits via the reference table. |
| `data/reference-frequencies.json` | Per-signal bucket base rates (probabilities). See `docs/METHODOLOGY.md`. |
| `explanations.js` | Plain-English explainer per signal id (coverage enforced by test). |
| `report.js` | Compose signals into the full report (score, rank, band, 1-in-N). |
| `signals/index.js` | Default collector list + guarded `collectAll`. |
| `signals/*.js` | One collector each: timezone, locale, screen, hardware, fonts, webgl, canvas, audio. Dependency-injected for tests, safe fallbacks. |
| `format.js` | Human-readable formatting of the uniqueness figure and bits. |
| `summary.js` | Plain-text export builder + clipboard writer. |
| `radar-geometry.js` | Pure blip/sweep geometry. |
| `radar.js` | Canvas scope renderer (grid, sweep, pinging blips); DPR- and reduced-motion-aware. |
| `sound.js` | Synthesized sonar ping + persisted mute toggle. |
| `ui.js` | Shell HTML + `renderScore`/`renderBreakdown`/`renderGauge`. |
| `app.js` | Orchestration: collect → compute → render + animate + wire controls. |
| `main.js` | Entrypoint; imports fonts, mounts the app. |
| `styles/` | `tokens.css` (design tokens), `reset.css`, `main.css` (full UI). |

## Run / test / build

- Dev server: `npm run dev`
- Tests: `npm test` (Vitest; pure logic runs in Node, `ui`/`app` suites opt into
  jsdom via a docblock; `src/test-setup.js` stubs the jsdom canvas).
- Coverage: `npm i -D @vitest/coverage-v8` then
  `npx vitest run --coverage --coverage.exclude='src/{main,fonts}.js'`
  (the two bootstrap modules have no testable logic). Core logic sits at ~98%.
- Production build: `npm run build` → self-contained static site in `dist/`,
  base-path-relative so it serves from a subpath.

## Design

Visual direction and tokens live in `docs/DESIGN.md` (blueprint navy + radar
cyan). The scope is the hero; product and (future) landing page share one brand.
