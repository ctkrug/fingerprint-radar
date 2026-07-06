# Vision

## The problem

Browser fingerprinting — identifying a visitor without cookies, by combining dozens of
small technical details (canvas rendering quirks, installed fonts, timezone, WebGL
renderer strings, audio-context output, screen and hardware properties) — is one of the
most under-explained privacy risks on the web. Plenty of tools *list* the raw signals a
site could collect. Almost none tell you *how identifying* each one actually is, in a way
grounded in real information theory rather than a vague "risk: medium" badge.

## Who it's for

Privacy-curious people who want more than a checklist: developers, security-adjacent
folks, and anyone who has heard the term "browser fingerprinting" and wants to actually
understand the math behind why it works — not just be told to "clear your cookies."

## The core idea

Every fingerprinting signal narrows down which browser you are, and that narrowing has a
precise unit: bits of [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)).
If a signal's value only appears in 1 out of every 8 browsers, that signal contributes
`-log2(1/8) = 3` bits toward identifying you. Fingerprint Radar collects the real signals
your browser exposes, estimates each one's probability against a documented reference
distribution, computes the actual entropy math, and adds it up into a single honest
answer: "your browser is approximately 1 in N."

Nothing is sent anywhere. Every signal is collected and every bit is computed in the tab
you're looking at, live, with a visible per-signal breakdown so the number is never a
black box.

## Key design decisions

- **Real entropy math, not a vibes score.** Every "bits contributed" figure traces back to
  `-log2(p)` for a documented `p`, not an arbitrary point value. See
  `docs/BACKLOG.md` Epic 3 for how the reference probabilities are sourced and cited.
- **Client-side only, always.** No backend, no analytics, no network calls at all — the
  entire pitch is "we can prove this never leaves your browser," so the implementation
  has to actually guarantee that, not just claim it.
- **Explain, don't just measure.** Every signal ships with a plain-English explanation of
  what it measures and why it's identifying, so the number means something instead of
  just being a stat.
- **Instrumented, not decorative, UI.** The interface (see `docs/DESIGN.md`) is a radar
  scope with a sweeping beam and per-signal blips — the visual literally is the
  measurement, not a chart bolted on afterward.
- **Independence is an assumption, and we say so.** Combining signal probabilities by
  multiplication (summing bits) assumes independence between signals, which is only
  approximately true in reality. The UI states this caveat next to the combined estimate
  rather than presenting a false-precision number.

## What "v1 done" looks like

- On load, with zero clicks, the page computes and displays a total entropy score and a
  "1 in N" uniqueness estimate.
- At least six real signal collectors are wired in (canvas, fonts or a documented subset,
  timezone/locale, WebGL, audio-context, and hardware/navigator misc), each contributing
  a real, non-hardcoded bit value from the reference table.
- Every signal has a visible plain-English explanation.
- The combined uniqueness estimate and a low/medium/high identifiability gauge are both
  shown, with the independence-assumption caveat stated in the UI.
- The page matches `docs/DESIGN.md`'s direction, holds up at 390/768/1440px, and ships
  with zero outbound network requests.
- `npm test` is green and `npm run build` produces a self-contained static site under
  `dist/` deployable to a subpath.
