# Fingerprint Radar

**▶ Live demo — [apps.charliekrug.com/fingerprint-radar](https://apps.charliekrug.com/fingerprint-radar/)**

**See how unique your browser really is**, live in your browser, with nothing sent to a server.

[![CI](https://github.com/ctkrug/fingerprint-radar/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/fingerprint-radar/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e5c7.svg)](LICENSE)

Fingerprint Radar measures the same signals real-world tracking scripts use (canvas
rendering, installed fonts, timezone, WebGL renderer, audio-context output, and more),
computes a genuine [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory))
bit contribution for each one, and explains in plain English why that signal helps identify
you. It renders the whole thing as a radar scope: one blip per signal, sized by how much it
gives away, with your total entropy at the centre.

## Who it's for

Anyone who keeps hearing about "browser fingerprinting" but can't picture how exposed their
own browser is. You can block cookies, but sites still recognise you by the shape of your
browser. Fingerprint Radar turns that abstract worry into one honest number and a per-signal
reason for it.

## Why it exists

Most "check your fingerprint" tools list the raw signals (your user agent, your screen size,
your fonts) and stop there. That tells you *what* is collected but not *how identifying* it
actually is. Fingerprint Radar computes the bits of entropy each signal contributes, the
same math behind the EFF's Panopticlick research, and combines them into a single "1 in N
browsers look like this" estimate.

## What it does

- **Measures the real signals**, entirely client-side: canvas, fonts, timezone and locale,
  WebGL renderer/vendor, audio-context output, and hardware/navigator properties.
- **Computes actual entropy** per signal against a documented reference distribution
  (`src/data/reference-frequencies.json`), not a hand-waved "high/medium/low."
- **Combines the signals** into one overall uniqueness figure and a Low/Medium/High band.
- **Explains every signal** in plain English: what it measured, and why it narrows down who
  you are.
- **Never phones home.** No analytics, no network requests, no server. Even the fonts are
  bundled with the page instead of loaded from a CDN, so opening the site leaks nothing.

## Sample output

The **Copy summary** button exports a shareable plain-text report:

```
Fingerprint Radar — how unique is my browser?

Total entropy: 18.4 bits
Uniqueness: 1 in 342,102 browsers
Identifiability: Medium

Per-signal breakdown (bits):
  Canvas rendering: 6.10 bits — a1f3…9c
  WebGL renderer: 4.85 bits — ANGLE (Intel, Mesa)
  Installed fonts: 3.20 bits — 42 detected
  Timezone: 2.05 bits — Europe/Berlin
  Audio context: 1.35 bits — 124.04
  Screen: 0.85 bits — 2560×1440 @2x

Computed entirely in-browser. Nothing was sent anywhere.
```

## How the score works

Every signal narrows down which browser you are. If a value appears in a fraction `p` of
browsers, observing it contributes `-log2(p)` bits of entropy. Fingerprint Radar classifies
each signal into a bucket, looks up that bucket's base rate in the bundled reference table,
sums the bits, and turns the total into a "1 in N" figure and a Low/Medium/High band. Because
combining signals assumes independence, which is only approximately true, the "1 in N" is
stated as an upper bound. Full sources and rationale: [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md).

## Run it locally

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run build    # production build to site/
```

No backend, no config, no accounts. It is a static site.

## Tech

Vanilla JavaScript, client-side only, bundled with [Vite](https://vitejs.dev/) and tested
with [Vitest](https://vitest.dev/). No UI framework. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for the module map and [`docs/DESIGN.md`](docs/DESIGN.md) for the visual direction.

## License

MIT. See [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
</content>
</invoke>
