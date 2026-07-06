import { describe, expect, it } from 'vitest';
import { collectHardware } from './hardware.js';

describe('collectHardware', () => {
  it('reports all present properties in the measured bucket', () => {
    const signal = collectHardware({
      nav: { hardwareConcurrency: 8, deviceMemory: 8, platform: 'MacIntel', maxTouchPoints: 0 },
    });
    expect(signal.bucket).toBe('measured');
    expect(signal.detail).toEqual({ cores: 8, memory: 8, platform: 'MacIntel', touch: false });
    expect(signal.value).toContain('8 cores');
    expect(signal.value).toContain('8GB');
  });

  it('defaults missing properties to "unknown" without throwing', () => {
    const signal = collectHardware({ nav: { hardwareConcurrency: 4 } });
    expect(signal.detail.memory).toBe('unknown');
    expect(signal.detail.platform).toBe('unknown');
    expect(signal.value).toContain('unknown');
  });

  it('drops to the "unknown" bucket when two or more props are missing', () => {
    const signal = collectHardware({ nav: { hardwareConcurrency: 4 } });
    expect(signal.bucket).toBe('unknown');
  });

  it('detects touch via maxTouchPoints', () => {
    const signal = collectHardware({
      nav: { hardwareConcurrency: 6, deviceMemory: 4, platform: 'iPhone', maxTouchPoints: 5 },
    });
    expect(signal.detail.touch).toBe(true);
  });
});
