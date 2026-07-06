import { describe, expect, it } from 'vitest';
import { probabilityFor, scoreSignal, scoreSignals } from './scoring.js';

const table = {
  canvas: { buckets: { measured: 0.125, unavailable: 0.5 } },
  locale: { buckets: { common: 0.25, uncommon: 0.03125 } },
};

describe('probabilityFor', () => {
  it('returns the probability for the signal bucket', () => {
    expect(probabilityFor({ id: 'canvas', bucket: 'measured' }, table)).toBe(0.125);
    expect(probabilityFor({ id: 'locale', bucket: 'uncommon' }, table)).toBe(0.03125);
  });

  it('falls back to the least-identifying bucket for an unknown bucket', () => {
    // Highest probability = least identifying; never overstate uniqueness.
    expect(probabilityFor({ id: 'canvas', bucket: 'nope' }, table)).toBe(0.5);
  });

  it('returns 1 (zero bits) for an unknown signal id', () => {
    expect(probabilityFor({ id: 'mystery', bucket: 'x' }, table)).toBe(1);
  });
});

describe('scoreSignal', () => {
  it('attaches probability and bits from -log2(p)', () => {
    const scored = scoreSignal({ id: 'canvas', bucket: 'measured' }, table);
    expect(scored.probability).toBe(0.125);
    expect(scored.bits).toBeCloseTo(3, 10);
  });

  it('preserves the original signal fields', () => {
    const scored = scoreSignal({ id: 'canvas', bucket: 'measured', label: 'Canvas', value: 'abc' }, table);
    expect(scored.label).toBe('Canvas');
    expect(scored.value).toBe('abc');
  });
});

describe('scoreSignals', () => {
  it('sums bits across all signals into a total', () => {
    const { scored, totalBits } = scoreSignals(
      [
        { id: 'canvas', bucket: 'measured' },
        { id: 'locale', bucket: 'uncommon' },
      ],
      table,
    );
    expect(scored).toHaveLength(2);
    // 3 bits + 5 bits = 8 bits.
    expect(totalBits).toBeCloseTo(8, 10);
  });

  it('returns zero total bits for an empty signal set', () => {
    expect(scoreSignals([], table).totalBits).toBe(0);
  });
});
