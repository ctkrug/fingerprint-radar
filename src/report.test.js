import { describe, expect, it } from 'vitest';
import { computeReport } from './report.js';

const table = {
  canvas: { buckets: { measured: 0.125, unavailable: 0.5 } },
  timezone: { buckets: { measured: 0.25 } },
};

describe('computeReport', () => {
  it('ranks signals descending by bits and attaches explanations', () => {
    const report = computeReport(
      [
        { id: 'timezone', label: 'Timezone', value: 'UTC', bucket: 'measured' },
        { id: 'canvas', label: 'Canvas', value: 'abc', bucket: 'measured' },
      ],
      table,
    );
    expect(report.scored.map((s) => s.id)).toEqual(['canvas', 'timezone']);
    expect(report.scored[0].explanation).toBeTypeOf('string');
  });

  it('sums bits and maps them to a band and a 1-in-N figure', () => {
    const report = computeReport(
      [
        { id: 'canvas', bucket: 'measured' }, // 3 bits
        { id: 'timezone', bucket: 'measured' }, // 2 bits
      ],
      table,
    );
    expect(report.totalBits).toBeCloseTo(5, 10);
    expect(report.oneInN).toBeCloseTo(32, 10);
    expect(report.band.label).toBe('Low');
  });

  it('produces a different score when a signal input changes (recompute)', () => {
    const distinctive = computeReport([{ id: 'canvas', bucket: 'measured' }], table);
    const common = computeReport([{ id: 'canvas', bucket: 'unavailable' }], table);
    expect(distinctive.totalBits).not.toBeCloseTo(common.totalBits, 5);
  });

  it('returns a zero-bit report for no signals', () => {
    const report = computeReport([], table);
    expect(report.totalBits).toBe(0);
    expect(report.oneInN).toBe(1);
    expect(report.scored).toEqual([]);
  });
});
