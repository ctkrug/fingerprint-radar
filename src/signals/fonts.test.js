import { describe, expect, it } from 'vitest';
import { collectFonts, detectFonts, PROBE_FONTS } from './fonts.js';

describe('detectFonts', () => {
  it('detects a font that shifts width away from the baseline', () => {
    // Baseline families measure 100; only "Georgia" renders wider.
    const measure = (stack) => (stack.includes("'Georgia'") ? 120 : 100);
    const detected = detectFonts(measure);
    expect(detected).toEqual(['Georgia']);
  });

  it('detects nothing when every probe matches the baseline width', () => {
    expect(detectFonts(() => 100)).toEqual([]);
  });

  it('detects every probe font when all shift the width', () => {
    // Baselines return 100; any probe stack returns a different width.
    const measure = (stack) => (BASELINE_ONLY(stack) ? 100 : 140);
    expect(detectFonts(measure)).toEqual(PROBE_FONTS);
  });
});

function BASELINE_ONLY(stack) {
  return !stack.includes("'");
}

describe('collectFonts', () => {
  it('returns the unavailable bucket when there is no 2d context', () => {
    const createCanvas = () => ({ getContext: () => null });
    expect(collectFonts({ createCanvas }).bucket).toBe('unavailable');
  });

  it('reports a detected count in the measured bucket', () => {
    let font = '';
    const ctx = {
      set font(v) {
        font = v;
      },
      get font() {
        return font;
      },
      measureText: () => ({ width: font.includes("'") ? 130 : 100 }),
    };
    const createCanvas = () => ({ getContext: () => ctx });
    const signal = collectFonts({ createCanvas });
    expect(signal.bucket).toBe('measured');
    expect(signal.value).toContain(`of ${PROBE_FONTS.length}`);
    expect(signal.detail.detected.length).toBe(PROBE_FONTS.length);
  });
});
