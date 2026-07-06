import { describe, expect, it } from 'vitest';
import {
  BAND_BOUNDARIES,
  estimateUniqueness,
  identifiabilityBand,
  oneInN,
} from './uniqueness.js';

describe('oneInN', () => {
  it('converts total bits into a 1-in-N figure', () => {
    expect(oneInN(0)).toBe(1);
    expect(oneInN(10)).toBe(1024);
  });
});

describe('estimateUniqueness', () => {
  it('multiplies independent probabilities for a known 2-signal input', () => {
    // p = 1/8 and p = 1/4 -> product 1/32 -> 1 in 32.
    expect(estimateUniqueness([{ probability: 0.125 }, { probability: 0.25 }])).toBeCloseTo(
      32,
      10,
    );
  });

  it('returns 1 for an empty signal set', () => {
    expect(estimateUniqueness([])).toBe(1);
  });

  it('always returns a figure of at least 1', () => {
    expect(estimateUniqueness([{ probability: 1 }])).toBeGreaterThanOrEqual(1);
    expect(estimateUniqueness([{ probability: 0.5 }])).toBeGreaterThanOrEqual(1);
  });

  it('ignores non-positive probabilities rather than dividing by zero', () => {
    expect(estimateUniqueness([{ probability: 0 }, { probability: 0.5 }])).toBeCloseTo(2, 10);
  });
});

describe('identifiabilityBand', () => {
  it('maps bits at each band boundary to the correct label', () => {
    expect(identifiabilityBand(0).label).toBe('Low');
    expect(identifiabilityBand(BAND_BOUNDARIES.medium - 0.01).label).toBe('Low');
    expect(identifiabilityBand(BAND_BOUNDARIES.medium).label).toBe('Medium');
    expect(identifiabilityBand(BAND_BOUNDARIES.high - 0.01).label).toBe('Medium');
    expect(identifiabilityBand(BAND_BOUNDARIES.high).label).toBe('High');
    expect(identifiabilityBand(40).label).toBe('High');
  });

  it('returns a stable key for styling each band', () => {
    expect(identifiabilityBand(5).key).toBe('low');
    expect(identifiabilityBand(15).key).toBe('medium');
    expect(identifiabilityBand(25).key).toBe('high');
  });
});
