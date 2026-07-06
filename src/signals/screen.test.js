import { describe, expect, it } from 'vitest';
import { collectScreen } from './screen.js';

describe('collectScreen', () => {
  it('buckets a common resolution as "common"', () => {
    const signal = collectScreen({ scr: { width: 1920, height: 1080, colorDepth: 24 }, dpr: 1 });
    expect(signal.bucket).toBe('common');
    expect(signal.value).toBe('1920x1080 · 24-bit · 1×');
  });

  it('matches a common resolution regardless of orientation', () => {
    const signal = collectScreen({ scr: { width: 844, height: 390, colorDepth: 24 }, dpr: 3 });
    expect(signal.bucket).toBe('common');
  });

  it('buckets an unusual resolution as "uncommon"', () => {
    expect(
      collectScreen({ scr: { width: 3333, height: 1111, colorDepth: 30 }, dpr: 1.5 }).bucket,
    ).toBe('uncommon');
  });

  it('handles a missing screen object without throwing', () => {
    const signal = collectScreen({ scr: null, dpr: undefined });
    expect(signal.detail.width).toBe(0);
    expect(signal.value).toContain('unknown-bit');
  });
});
