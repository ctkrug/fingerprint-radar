import { describe, expect, it } from 'vitest';
import { collectCanvas, hashPixels } from './canvas.js';

describe('hashPixels', () => {
  it('returns the same hash for identical pixel input', () => {
    const a = [10, 20, 30, 255, 40, 50, 60, 255];
    const b = [10, 20, 30, 255, 40, 50, 60, 255];
    expect(hashPixels(a)).toBe(hashPixels(b));
  });

  it('returns a different hash when a single byte changes', () => {
    const base = [10, 20, 30, 255];
    const changed = [10, 20, 31, 255];
    expect(hashPixels(base)).not.toBe(hashPixels(changed));
  });

  it('produces a fixed-width 8-char hex string', () => {
    expect(hashPixels([1, 2, 3])).toMatch(/^[0-9a-f]{8}$/);
    expect(hashPixels([])).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('collectCanvas', () => {
  it('returns the unavailable bucket when 2d context is null', () => {
    const createCanvas = () => ({ getContext: () => null });
    const signal = collectCanvas({ createCanvas });
    expect(signal.bucket).toBe('unavailable');
    expect(signal.value).toBe('unavailable');
  });

  it('hashes rendered pixels into the measured bucket', () => {
    // Minimal fake 2d context that yields deterministic image data.
    const createCanvas = () => ({
      width: 0,
      height: 0,
      getContext: () => ({
        textBaseline: '',
        fillStyle: '',
        strokeStyle: '',
        font: '',
        fillRect() {},
        fillText() {},
        strokeText() {},
        beginPath() {},
        arc() {},
        stroke() {},
        getImageData: () => ({ data: [1, 2, 3, 255, 4, 5, 6, 255] }),
      }),
    });
    const signal = collectCanvas({ createCanvas });
    expect(signal.bucket).toBe('measured');
    expect(signal.value).toMatch(/^[0-9a-f]{8}$/);
  });
});
