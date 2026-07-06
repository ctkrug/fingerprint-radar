import { describe, expect, it } from 'vitest';
import { combineIndependentBits, shannonEntropyBits } from './entropy.js';
import { estimateUniqueness } from './uniqueness.js';

// Deterministic pseudo-random probabilities in (0, 1) so the "property" checks
// are reproducible without pulling in a property-testing dependency.
function probabilities(count) {
  let seed = 987654321;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    out.push((seed % 999998) / 1000000 + 1e-6); // strictly inside (0, 1)
  }
  return out;
}

describe('shannonEntropyBits invariants', () => {
  const ps = probabilities(500);

  it('is always within [0, 32] for any probability in (0, 1)', () => {
    for (const p of ps) {
      const bits = shannonEntropyBits(p);
      expect(bits).toBeGreaterThanOrEqual(0);
      expect(bits).toBeLessThanOrEqual(32);
    }
  });

  it('is monotonically non-increasing: rarer values carry at least as many bits', () => {
    const sorted = [...ps].sort((a, b) => a - b); // ascending probability
    for (let i = 1; i < sorted.length; i += 1) {
      // lower probability -> >= bits
      expect(shannonEntropyBits(sorted[i - 1])).toBeGreaterThanOrEqual(
        shannonEntropyBits(sorted[i]) - 1e-9,
      );
    }
  });
});

describe('uniqueness / bits consistency', () => {
  it('1-in-N never drops below 1 and equals the reciprocal product', () => {
    for (let n = 1; n <= 8; n += 1) {
      const signals = probabilities(n).map((probability) => ({ probability }));
      const expected = 1 / signals.reduce((acc, s) => acc * s.probability, 1);
      const got = estimateUniqueness(signals);
      expect(got).toBeGreaterThanOrEqual(1);
      expect(got).toBeCloseTo(expected, 6);
    }
  });

  it('summed bits equal -log2 of the combined probability when unclamped', () => {
    // Keep probabilities modest so no single signal hits the 32-bit ceiling.
    const ps = probabilities(6).map((p) => 0.05 + p * 0.9);
    const summed = combineIndependentBits(ps.map(shannonEntropyBits));
    const product = ps.reduce((acc, p) => acc * p, 1);
    expect(summed).toBeCloseTo(-Math.log2(product), 6);
  });
});
