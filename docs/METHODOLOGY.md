# Methodology

How Fingerprint Radar turns your browser's signals into a bits-of-entropy score,
and where the reference numbers come from.

## The core math

Every fingerprinting signal narrows down which browser you are. If a signal's
value appears in a fraction `p` of browsers, observing it contributes

```
bits = -log2(p)
```

bits of [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)).
A value seen in 1 browser in 8 (`p = 1/8`) is worth 3 bits. We compute each
signal's `p` by classifying your value into a **bucket** and looking up that
bucket's base rate in `src/data/reference-frequencies.json`, then sum the bits.

Combining signals multiplies their probabilities (equivalently, sums their
bits). That assumes the signals are **independent**, which is only approximately
true — a device's WebGL renderer and its screen resolution are correlated, for
example. So the combined "1 in N" is an **upper bound** on how distinctive you
are, and the UI states that caveat next to the figure. This tool is for
education about the mechanism, not a precise re-identification score.

## Where the reference rates come from

The per-bucket probabilities are **order-of-magnitude estimates** derived from
published browser-fingerprinting research. They are approximate base rates for
"how surprising is a signal of this kind," not a lookup of your exact value's
true global frequency (we ship no such database — nothing leaves your browser).

Primary sources:

- **Laperdrix, Rudametkin & Baudry (2016), _"Beauty and the Beast: Diverting
  Modern Web Browsers to Build Unique Browser Fingerprints"_** (IEEE S&P) — the
  AmIUnique study. Reports per-attribute entropy including canvas (~8.3 bits),
  fonts via JS enumeration (~8.5 bits), screen resolution + color depth
  (~4.8 bits), timezone (~3.0 bits), and platform.
- **Eckersley (2010), _"How Unique Is Your Web Browser?"_** (EFF Panopticlick) —
  the original large-scale study establishing entropy as the unit for
  fingerprint distinctiveness.
- **EFF Cover Your Tracks** (<https://coveryourtracks.eff.org>) — ongoing
  measurement of how identifying real browsers are in the wild.

## Bucket rationale

| Signal | Buckets (p) | Basis |
|---|---|---|
| `canvas` | measured 0.0032 (~8.3 bits), unavailable 0.04 | AmIUnique canvas entropy; a rendered canvas hash is near-unique. "unavailable" = canvas blocked/spoofed, a smaller minority. |
| `audio` | measured 0.024 (~5.4 bits), unavailable 0.05 | Audio-stack fingerprints are moderately distinctive. |
| `webgl` | measured 0.031 (~5.0 bits), unavailable 0.06 | Unmasked GPU renderer/vendor strings cluster by hardware. |
| `fonts` | measured 0.0625 (~4.0 bits), unavailable 0.1 | We probe a documented subset, so entropy is deliberately lower than full enumeration. |
| `timezone` | measured 0.125 (~3.0 bits) | AmIUnique timezone entropy. |
| `locale` | common 0.28, uncommon 0.04 | Widely-spoken UI languages are common; others are more identifying. |
| `screen` | common 0.08, uncommon 0.012 | A handful of resolutions dominate; unusual geometries stand out. |
| `hardware` | measured 0.05, unknown 0.2 | CPU cores + memory + platform + touch combined; "unknown" when the browser withholds these. |

Every probability is strictly between 0 and 1 (enforced by a unit test), so
`-log2(p)` is always a finite positive bit value.

## What this is not

- Not a precise measurement of your true rarity — real base rates shift over
  time and vary by population; treat the number as illustrative.
- Not a tracker — every computation runs in your tab, no network calls (see the
  privacy note on the page).
