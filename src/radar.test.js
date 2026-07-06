import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRadar } from './radar.js';

// A minimal recording 2D context: counts the calls the renderer relies on and
// lets property assignments (strokeStyle, fillStyle, …) fall on the object.
function fakeCtx() {
  const n = { clearRect: 0, arc: 0, fill: 0, stroke: 0, setTransform: 0 };
  const noop = () => {};
  return {
    _n: n,
    setTransform: () => { n.setTransform += 1; },
    clearRect: () => { n.clearRect += 1; },
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: () => { n.arc += 1; },
    stroke: () => { n.stroke += 1; },
    fill: () => { n.fill += 1; },
    save: noop,
    restore: noop,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
  };
}

function fakeCanvas(ctx, size = 300) {
  return {
    width: 0,
    height: 0,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: size, height: size }),
  };
}

const signals = [
  { id: 'canvas', bits: 8 },
  { id: 'timezone', bits: 3 },
  { id: 'locale', bits: 1 },
];

afterEach(() => {
  delete globalThis.devicePixelRatio;
});

describe('createRadar', () => {
  it('draws a static scope in reduced-motion mode without a loop', () => {
    const ctx = fakeCtx();
    const canvas = fakeCanvas(ctx);
    const radar = createRadar(canvas, { reducedMotion: true });
    radar.resize();
    radar.setSignals(signals);
    radar.start();
    expect(ctx._n.clearRect).toBeGreaterThan(0);
    expect(ctx._n.fill).toBeGreaterThanOrEqual(signals.length); // one blip each
    expect(canvas.width).toBe(300); // dpr defaults to 1
  });

  it('scales the backing store by devicePixelRatio on resize', () => {
    globalThis.devicePixelRatio = 2;
    const ctx = fakeCtx();
    const canvas = fakeCanvas(ctx, 320);
    const radar = createRadar(canvas);
    radar.resize();
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(640);
    expect(ctx._n.setTransform).toBeGreaterThan(0);
  });

  it('runs and cancels the animation loop via injected raf/caf', () => {
    const ctx = fakeCtx();
    const canvas = fakeCanvas(ctx);
    let tick = null;
    const raf = (cb) => { tick = cb; return 7; };
    const caf = vi.fn();
    let t = 0;
    const radar = createRadar(canvas, { now: () => t, raf, caf });
    radar.resize();
    radar.setSignals(signals);

    const before = ctx._n.clearRect;
    radar.start();
    expect(tick).toBeTypeOf('function');
    t = 1000;
    tick(); // advance one frame
    expect(ctx._n.clearRect).toBeGreaterThan(before);

    radar.stop();
    expect(caf).toHaveBeenCalledWith(7);
  });

  it('is inert but never throws when the canvas has no 2D context', () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => null,
      getBoundingClientRect: () => ({ width: 300, height: 300 }),
    };
    const radar = createRadar(canvas);
    expect(() => {
      radar.resize();
      radar.setSignals(signals);
      radar.start();
      radar.draw();
      radar.stop();
    }).not.toThrow();
  });

  it('tolerates an empty or nullish signal set', () => {
    const ctx = fakeCtx();
    const radar = createRadar(fakeCanvas(ctx), { reducedMotion: true });
    radar.resize();
    expect(() => radar.setSignals(null)).not.toThrow();
    expect(() => radar.setSignals([])).not.toThrow();
  });
});
