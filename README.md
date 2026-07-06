# Fingerprint Radar

Fingerprint Radar scores how unique your exact browser is — live, in your browser, with
nothing sent to a server. It measures the same signals real-world tracking scripts use
(canvas rendering, installed fonts, timezone, WebGL renderer, audio-context output, and
more), calculates a genuine [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory))
bit contribution for each one, and explains in plain English why that signal helps identify you.

## Why

Most "check your fingerprint" tools list the raw signals (your user agent, your screen
size, your fonts) and stop there. That tells you *what* is being collected but not *how
identifying* it actually is. Fingerprint Radar computes the bits of entropy each signal
contributes — the same math behind the EFF's Panopticlick research — and combines them
into a single, honest "1 in N browsers look like this" estimate.

## What it does

- Collects browser fingerprinting signals entirely client-side: canvas, fonts, timezone
  and locale, WebGL renderer/vendor, audio-context output, and hardware/navigator
  properties.
- Computes a real Shannon-entropy bit contribution per signal against a documented
  reference distribution, instead of just eyeballing "high/medium/low."
- Combines the independent signal probabilities into one overall uniqueness estimate.
- Explains each signal in plain English: what it measures, and why it narrows down who
  you are.
- Never phones home. No analytics, no network requests, no server — everything runs and
  stays in the tab.

## Stack

Vanilla JavaScript, client-side only, bundled with [Vite](https://vitejs.dev/) and tested
with [Vitest](https://vitest.dev/). No UI framework, no backend.

## How the score works

Every signal narrows down which browser you are. If a value appears in a fraction `p` of
browsers, observing it contributes `-log2(p)` bits of entropy. Fingerprint Radar classifies
each signal into a bucket, looks up that bucket's base rate in a bundled reference table
(`src/data/reference-frequencies.json`), sums the bits, and turns the total into a "1 in N"
figure and a Low/Medium/High identifiability band. Because combining signals assumes
independence — which is only approximately true — the "1 in N" is stated as an upper bound.
Sources and rationale: [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md).

## Status

Functional v1: live score on load, eight signal collectors, per-signal breakdown with
explanations, uniqueness estimate, identifiability gauge, copy-to-clipboard export, and the
radar-scope UI. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the module map,
[`docs/VISION.md`](docs/VISION.md) for the design, [`docs/BACKLOG.md`](docs/BACKLOG.md) for
the plan, and [`docs/DESIGN.md`](docs/DESIGN.md) for the visual direction.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests
npm run build    # production build to dist/
```
