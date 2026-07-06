# Backlog

15 stories across 4 epics, each epic closing with a design polish story so visual work is
scheduled rather than an afterthought. Story 1 is the wow moment and must land first — the
live entropy score has to be reachable before anything else is built.

## Epic 1 — Core entropy engine & live score

- [ ] **1. (Wow moment) Live total entropy score on page load.** With zero clicks,
      loading the page computes and displays a total bits value and a plain-English
      uniqueness estimate.
      - Loading `index.html` with no interaction shows a numeric bits value and an
        "approximately 1 in N browsers" string within 2 seconds.
      - Reloading recomputes rather than reusing a stale value — verified with a unit
        test that mocks a changed signal input and asserts the displayed score changes.
- [ ] **2. Shannon entropy module with full test coverage.** Harden and extend
      `src/entropy.js` beyond the scaffold stubs.
      - `shannonEntropyBits(p)` returns `-log2(p)` for `0 < p <= 1` and returns a capped
        max (not `Infinity`) for `p <= 0`.
      - `combineIndependentBits(bitsArray)` sums an array of bit contributions; a unit
        test verifies the sum against a hand-computed value for a known input.
- [ ] **3. Per-signal breakdown panel with plain-English explainers.** List every
      measured signal with its bit contribution, a proportional bar, and an explanation
      of what it measures and why it's identifying.
      - Rows render sorted descending by bits contributed, one per active signal
        collector; bar width scales relative to the top contributor.
      - Every registered signal id has a non-empty explanation (min. 20 characters) from
        one `explanations.js` map — a unit test asserts full coverage across registered
        ids (no silent blank fallback).
- [ ] **4. Design polish — the radar scope hero.** Implement `docs/DESIGN.md`'s radar
      scope as the actual hero, not a placeholder panel.
      - The scope occupies ≥60vh on desktop with the total score at its center — never a
        small fixed-pixel box floating in empty space.
      - The sweep arm animates continuously and drops to a static state under
        `prefers-reduced-motion`.

## Epic 2 — Additional fingerprint signals

- [ ] **5. Canvas and timezone/locale collectors.** `src/signals/canvas.js` renders a
      deterministic drawing and hashes the pixel data; a timezone collector reads
      `Intl.DateTimeFormat().resolvedOptions()`.
      - The canvas hash function returns a stable string for identical pixel input across
        two calls (unit test on the pure hashing function).
      - The timezone collector returns `timeZone`, `locale`, and `numberingSystem`,
        verified with a mocked `Intl` passthrough test.
- [ ] **6. WebGL and audio-context collectors with safe fallbacks.** Read the unmasked
      WebGL renderer/vendor strings and an `OfflineAudioContext` oscillator fingerprint.
      - When `canvas.getContext('webgl')` returns `null` (mocked), the collector returns
        `"unavailable"` instead of throwing.
      - When `OfflineAudioContext` is undefined (mocked), the collector returns
        `"unavailable"` instead of throwing.
- [ ] **7. Hardware/navigator misc collector.** Bundle languages, platform,
      `hardwareConcurrency`, `deviceMemory`, and touch support into one collector.
      - Missing properties (e.g. `deviceMemory` undefined on some browsers) default to
        `"unknown"` rather than throwing — covered by a unit test on the missing-property
        path.
- [ ] **8. Design polish — signal breakdown at every width.** Make the sidebar/list from
      Story 3 hold up across devices, per `docs/DESIGN.md`'s layout intent.
      - The breakdown composes with no horizontal scroll at 390px, 768px, and 1440px,
        stacking below the scope on phone width.
      - Every signal row gets a themed hover/focus state — no unstyled native list or
        button elements.

## Epic 3 — Reference data & scoring accuracy

- [ ] **9. Bundled population-frequency reference table.** Ship
      `src/data/reference-frequencies.json` with approximate base rates per signal
      bucket, documented in `docs/METHODOLOGY.md`.
      - The JSON validates against a schema check (every value is a probability strictly
        between 0 and 1) in a unit test.
      - `docs/METHODOLOGY.md` names the published source each table's rates are drawn
        from — no fabricated numbers.
- [ ] **10. Combined uniqueness estimate.** Multiply independent per-signal
      probabilities into one "1 in N" figure.
      - `estimateUniqueness(signals)` returns a number ≥ 1; a unit test checks a known
        2-signal input produces the expected multiplied result.
      - The UI shows the independence-assumption caveat text next to the figure.
- [ ] **11. Identifiability gauge.** Compare the user's total bits against the reference
      distribution and show a low/medium/high band.
      - A unit test maps bits values at each band boundary to the correct label
        ("Low"/"Medium"/"High").
- [ ] **12. Design polish — gauge and caveat treatment.** Bring the gauge and combined
      estimate up to the same bar as the rest of the page.
      - The gauge uses the `--success`/`--accent-support`/`--danger` tokens from
        `docs/DESIGN.md`, not ad hoc colors.
      - The gauge and caveat text pass a squint-test for hierarchy (score and band label
        read first; caveat text is legible but visually secondary).

## Epic 4 — Polish, privacy & export

- [ ] **13. "Nothing leaves your browser" privacy banner.** State and prove the
      no-network-calls guarantee.
      - A documented check (grep for `fetch`/`XMLHttpRequest` in `src/`) returns no
        matches outside of local dev tooling.
      - The banner links to `docs/METHODOLOGY.md`.
- [ ] **14. Copy-to-clipboard summary export.** Let the user copy a plain-text summary of
      their score and breakdown.
      - Clicking "Copy summary" writes a string containing the total bits value and each
        signal's bits to the clipboard.
      - A unit test on the summary-string builder function (mocking
        `navigator.clipboard`) verifies the string's contents.
- [ ] **15. Design polish — final ship-gate pass.** Run the full `docs/DESIGN.md` §D3
      self-review checklist across the finished page and fix anything outstanding.
      - Page reviewed at 390px, 768px, and 1440px with issues fixed on the spot and noted
        in the run's STATUS `memory`.
      - Favicon, wordmark, and the landing/app treatment match `docs/DESIGN.md`; none of
        the anti-generic bans (default globe icon, unstyled controls, flat
        treatment-less background) are present.
