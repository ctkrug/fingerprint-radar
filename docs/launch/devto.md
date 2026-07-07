---
title: "I built a browser fingerprint scorer that computes real entropy, client-side"
published: false
tags: javascript, privacy, webdev, showdev
---

Most "test your browser fingerprint" pages show you a wall of values: your user agent, your
screen size, your font list. Useful, but it answers the wrong question. Knowing *what* a site
can read tells you nothing about *how identifying* any of it is. A screen size of 1920x1080 is
shared by millions of people. A specific canvas rendering hash might be shared by almost no one.
Both show up as one row in the list, and the list treats them the same.

So I built [Fingerprint Radar](https://apps.charliekrug.com/fingerprint-radar/): it measures
the signals, then scores each one in bits of entropy, and renders the whole thing as a radar
scope with one blip per signal.

## The scoring model

The core idea is one line of information theory. If a value appears in a fraction `p` of
browsers, then observing it on your browser carries `-log2(p)` bits of entropy. A trait half
of everyone shares is 1 bit. A trait one in a thousand people have is about 10 bits. Add up the
bits across independent signals and you get a total, which converts cleanly to "1 in N browsers
look like yours" because `N = 2^bits`.

The whole calculation is a pure function:

```js
export function shannonEntropyBits(p) {
  if (Number.isNaN(p)) return 0;      // malformed input contributes no information
  if (p <= 0) return MAX_BITS;        // impossible event, capped surprise
  if (p >= 1) return 0;               // certain event, no information
  return Math.min(-Math.log2(p), MAX_BITS);
}
```

Those guard clauses are not decoration. Real collectors return junk sometimes (a probability of
zero from a rounding error, a `NaN` from a failed measurement), and without the clamps one bad
signal produces a negative or infinite total that poisons the whole score. Keeping the math pure
also made it trivial to property-test: for any valid probability the output stays inside
`[0, MAX_BITS]`, and more common values never score higher than rarer ones.

## Where the probabilities come from

The honest hard part is `p`. I bundle a reference table of base rates per signal bucket
(`src/data/reference-frequencies.json`) drawn from published fingerprinting research, and the
scorer looks up your value's bucket in it. When a value is unknown, it falls back to the *least*
identifying bucket on purpose, so a collector bug can never overstate how unique you are. The
combined "1 in N" is presented as an upper bound, because signals are not truly independent (a
phone's screen size and GPU travel together), and the UI says so out loud rather than pretending
the number is exact.

## Two build decisions I would keep

**Fault-isolated collectors.** Each signal (canvas, WebGL, audio, fonts, timezone, hardware)
runs behind its own guard and degrades to an "unavailable" bucket instead of throwing. One
browser that blocks the AudioContext should not blank the entire report. The app orchestration
is the only module that touches live browser APIs and timers; everything downstream is pure and
unit-tested, which is why the suite runs in Node without a real DOM for most of it.

**Self-hosted fonts.** The entire pitch is that nothing leaves your tab. Loading JetBrains Mono
from a font CDN would quietly break that promise by handing your IP to a third party on page
load. So the fonts are bundled into the build, and there is a test that asserts the code makes
zero network calls. It felt pedantic until I realised the test *is* the product claim.

## What I would do differently

The reference frequencies are the weakest link. They are good enough to rank signals sensibly
and produce a believable total, but they are a static snapshot, not live population data. If I
kept iterating, I would version the table and cite each bucket's source inline so the number is
auditable rather than trusted.

Code and full methodology are on [GitHub](https://github.com/ctkrug/fingerprint-radar). The live
version runs entirely in your browser, so you can open it and watch your own browser get scored:
[apps.charliekrug.com/fingerprint-radar](https://apps.charliekrug.com/fingerprint-radar/).
</content>
