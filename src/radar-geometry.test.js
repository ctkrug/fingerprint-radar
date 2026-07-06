import { describe, expect, it } from 'vitest';
import { computeBlips, isBlipLit, sweepAngle } from './radar-geometry.js';

const center = { cx: 100, cy: 100, radius: 80 };

describe('computeBlips', () => {
  it('returns one blip per signal', () => {
    const blips = computeBlips([{ id: 'a', bits: 1 }, { id: 'b', bits: 2 }], center);
    expect(blips).toHaveLength(2);
    expect(blips.map((b) => b.id)).toEqual(['a', 'b']);
  });

  it('places every blip within the scope radius of the center', () => {
    const blips = computeBlips(
      [{ id: 'a', bits: 8 }, { id: 'b', bits: 4 }, { id: 'c', bits: 0.1 }],
      center,
    );
    for (const b of blips) {
      const dist = Math.hypot(b.x - center.cx, b.y - center.cy);
      expect(dist).toBeLessThanOrEqual(center.radius + 0.001);
    }
  });

  it('sizes the highest-entropy blip largest', () => {
    const [low, high] = computeBlips([{ id: 'low', bits: 1 }, { id: 'high', bits: 10 }], center);
    expect(high.size).toBeGreaterThan(low.size);
    expect(high.frac).toBeCloseTo(1, 10);
  });

  it('handles an empty signal list without dividing by zero', () => {
    expect(computeBlips([], center)).toEqual([]);
  });
});

describe('sweepAngle', () => {
  it('is zero at the start of a period and wraps after a full period', () => {
    expect(sweepAngle(0, 4000)).toBe(0);
    expect(sweepAngle(4000, 4000)).toBeCloseTo(0, 10);
    expect(sweepAngle(2000, 4000)).toBeCloseTo(Math.PI, 10);
  });

  it('returns 0 for a non-positive period', () => {
    expect(sweepAngle(1000, 0)).toBe(0);
  });
});

describe('isBlipLit', () => {
  it('lights a blip when the sweep is just past it', () => {
    expect(isBlipLit(1, 1.1)).toBe(true);
  });

  it('does not light a blip far from the sweep', () => {
    expect(isBlipLit(0, Math.PI)).toBe(false);
  });
});
