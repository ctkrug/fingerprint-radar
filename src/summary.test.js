import { describe, expect, it, vi } from 'vitest';
import { buildSummary, copySummary } from './summary.js';

const report = {
  totalBits: 12.5,
  oneInN: 5793,
  band: { label: 'Medium' },
  scored: [
    { id: 'canvas', label: 'Canvas render', value: 'deadbeef', bits: 8.3 },
    { id: 'timezone', label: 'Timezone', value: 'America/New_York', bits: 3.0 },
    { id: 'locale', label: 'Language & locale', value: 'en-US', bits: 1.2 },
  ],
};

describe('buildSummary', () => {
  it('includes the total bits value and the 1-in-N figure', () => {
    const text = buildSummary(report);
    expect(text).toContain('12.5 bits');
    expect(text).toContain('1 in 5,793');
    expect(text).toContain('Identifiability: Medium');
  });

  it('lists each signal with its bits, sorted descending', () => {
    const text = buildSummary(report);
    expect(text).toContain('Canvas render: 8.30 bits — deadbeef');
    expect(text).toContain('Timezone: 3.00 bits');
    const canvasIdx = text.indexOf('Canvas render');
    const localeIdx = text.indexOf('Language & locale');
    expect(canvasIdx).toBeLessThan(localeIdx);
  });

  it('handles an effectively-unique (infinite) figure', () => {
    expect(buildSummary({ ...report, oneInN: Infinity })).toContain('effectively unique');
  });

  it('handles an empty signal set without throwing', () => {
    expect(() => buildSummary({ totalBits: 0, oneInN: 1, scored: [] })).not.toThrow();
  });
});

describe('copySummary', () => {
  it('writes the text via the clipboard and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const ok = await copySummary('hello', { clipboard: { writeText } });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false when no clipboard is available', async () => {
    expect(await copySummary('x', { clipboard: undefined })).toBe(false);
  });
});
