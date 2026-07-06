import { describe, expect, it } from 'vitest';
import { combineIndependentBits, estimateUniqueness, shannonEntropyBits } from './entropy.js';

describe('shannonEntropyBits', () => {
  it('returns -log2(p) for a normal probability', () => {
    expect(shannonEntropyBits(0.5)).toBeCloseTo(1, 10);
    expect(shannonEntropyBits(0.25)).toBeCloseTo(2, 10);
    expect(shannonEntropyBits(0.125)).toBeCloseTo(3, 10);
  });

  it('caps the result instead of returning Infinity for p <= 0', () => {
    expect(shannonEntropyBits(0)).toBe(32);
    expect(shannonEntropyBits(-1)).toBe(32);
  });

  it('caps extremely small probabilities at the max bit ceiling', () => {
    expect(shannonEntropyBits(1e-20)).toBe(32);
  });
});

describe('combineIndependentBits', () => {
  it('sums bit contributions from independent signals', () => {
    expect(combineIndependentBits([1, 2, 3.5])).toBeCloseTo(6.5, 10);
  });

  it('returns 0 for an empty signal list', () => {
    expect(combineIndependentBits([])).toBe(0);
  });
});

describe('estimateUniqueness', () => {
  it('converts total bits into a 1-in-N figure', () => {
    expect(estimateUniqueness(0)).toBe(1);
    expect(estimateUniqueness(10)).toBe(1024);
  });
});
