# Design direction

## 1. Aesthetic direction

**Fingerprint Radar is a blueprint/technical instrument: a dark drafting-table navy shot
through with radar-scope cyan, sweeping a rotating beam across your browser's signals like
sonar pinging the hull of a ship.** The page should feel like reading an oscilloscope, not
a marketing site — precise, instrumented, quietly confident. No card grids, no rounded
pastel panels, no "three gray boxes with an emoji." This is a scanning device with a
read-out.

This direction (and its cyan-on-navy blueprint palette) is deliberately distinct from
generic dark-mode SaaS styling: it leans on a literal radar-scope motif, a monospace data
voice, and hard-edged drafting-line details rather than soft glassy panels.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a1128` | page background — deep blueprint navy |
| `--surface-1` | `#101a3d` | primary panel surface |
| `--surface-2` | `#16234f` | raised/nested panel surface (breakdown rows) |
| `--text` | `#e8edf9` | primary text |
| `--text-muted` | `#8ea3c9` | secondary/explainer text |
| `--accent` | `#00e5c7` | radar sweep, primary data, active state (cyan) |
| `--accent-support` | `#ffb84d` | secondary highlight, warnings, mid-identifiability band (amber) |
| `--success` | `#4ade80` | low-identifiability band |
| `--danger` | `#ff6b6b` | high-identifiability band |
| `--grid-line` | `rgba(0, 229, 199, 0.12)` | blueprint grid overlay |

**Type pairing:** `JetBrains Mono` (display — wordmark, headings, all numeric read-outs)
paired with `Inter` (UI — body copy, plain-English explanations). System fallbacks:
`ui-monospace, "SFMono-Regular", monospace` and `-apple-system, "Segoe UI", sans-serif`.
Type scale ratio ~1.25 starting at 16px.

**Spacing:** 8px base unit (8/16/24/32/48/64).

**Corner radius:** 2px — sharp, drafting-table edges, not soft/glassy.

**Shadow/glow:** active elements get a cyan glow ring, `0 0 24px rgba(0, 229, 199, 0.25)`,
echoing a radar blip; static panels get a barely-there `0 1px 0 rgba(0,229,199,0.08)`
hairline rather than a drop shadow.

**Motion:** UI transitions 150ms ease-out. The radar sweep arm itself rotates continuously
over 4s linear, looping. Signal blips animate in with a 200ms ease-out scale+fade "ping."
All motion respects `prefers-reduced-motion` (sweep and blips drop to a static state).

## 3. Layout intent

The hero **is the radar scope**: a circular sweep visualization with the total entropy
score (bits) at its center and one blip per measured signal, positioned around the
circle and sized by its bit contribution. The sweep arm rotates continuously; blips
"ping" into existence as each signal finishes computing.

- **1440×900 desktop:** scope occupies the left ~60% of the viewport as a large square
  panel; a scrollable per-signal breakdown list fills the right ~40% as a sidebar,
  each row showing signal name, bit count, and a proportional bar.
- **390×844 phone:** scope stacks first as a full-width square panel (capped to a
  comfortable viewport fraction so it never crowds out the breakdown), with the
  breakdown list below it. No horizontal scroll, no dead margin — the scope always
  fills its container edge-to-edge.

## 4. Signature detail

The rotating radar sweep arm with a fading cyan trail behind it, plus per-signal blips
that ping onto the scope in sequence as each signal is measured — turning "we computed
some numbers" into something that visibly *scans*.

## 5. Non-negotiables carried into every later run

- Never trade the blueprint-navy/cyan direction for a generic dark-gray-cards look.
- The sweep and blips are core to the hero, not decoration bolted onto a plain list.
- Every interactive control (mute, copy-summary, band toggle) gets themed hover/focus/
  active states drawn from these tokens — no unstyled native `<button>`/`<select>`.
