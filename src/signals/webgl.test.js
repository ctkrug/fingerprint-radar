import { describe, expect, it } from 'vitest';
import { collectWebgl } from './webgl.js';

describe('collectWebgl', () => {
  it('returns the unavailable bucket when getContext returns null', () => {
    const createCanvas = () => ({ getContext: () => null });
    const signal = collectWebgl({ createCanvas });
    expect(signal.bucket).toBe('unavailable');
    expect(signal.value).toBe('unavailable');
  });

  it('reads unmasked vendor/renderer via the debug extension', () => {
    const gl = {
      VENDOR: 0x1f00,
      RENDERER: 0x1f01,
      getExtension: () => ({ UNMASKED_VENDOR_WEBGL: 1, UNMASKED_RENDERER_WEBGL: 2 }),
      getParameter: (p) => (p === 1 ? 'Acme' : p === 2 ? 'AcmeGPU 9000' : 'masked'),
    };
    const createCanvas = () => ({ getContext: () => gl });
    const signal = collectWebgl({ createCanvas });
    expect(signal.value).toBe('Acme · AcmeGPU 9000');
    expect(signal.detail).toEqual({ vendor: 'Acme', renderer: 'AcmeGPU 9000' });
    expect(signal.bucket).toBe('measured');
  });

  it('falls back to standard params when the debug extension is missing', () => {
    const gl = {
      VENDOR: 'v',
      RENDERER: 'r',
      getExtension: () => null,
      getParameter: (p) => (p === 'v' ? 'StdVendor' : 'StdRenderer'),
    };
    const createCanvas = () => ({ getContext: () => gl });
    expect(collectWebgl({ createCanvas }).value).toBe('StdVendor · StdRenderer');
  });
});
