import { describe, expect, it } from 'vitest';
import { collectAudio } from './audio.js';

function fakeAudioCtx(samples) {
  return function FakeCtx() {
    return {
      createOscillator: () => ({ type: '', frequency: {}, connect() {}, start() {} }),
      createDynamicsCompressor: () => ({ connect() {} }),
      destination: {},
      startRendering: async () => ({ getChannelData: () => samples }),
    };
  };
}

describe('collectAudio', () => {
  it('returns the unavailable bucket when OfflineAudioContext is undefined', async () => {
    const signal = await collectAudio({ AudioCtx: undefined });
    expect(signal.bucket).toBe('unavailable');
    expect(signal.value).toBe('unavailable');
  });

  it('summarizes rendered samples into a measured value', async () => {
    const samples = new Float32Array(5000).map((_, i) => Math.sin(i) * 0.5);
    const signal = await collectAudio({ AudioCtx: fakeAudioCtx(samples) });
    expect(signal.bucket).toBe('measured');
    expect(signal.value).toMatch(/^[0-9a-f]{8}-/);
  });

  it('produces the same value for identical rendered output', async () => {
    const make = () => new Float32Array(5000).map((_, i) => Math.cos(i) * 0.3);
    const a = await collectAudio({ AudioCtx: fakeAudioCtx(make()) });
    const b = await collectAudio({ AudioCtx: fakeAudioCtx(make()) });
    expect(a.value).toBe(b.value);
  });

  it('degrades to unavailable when rendering throws', async () => {
    const ThrowingCtx = function () {
      return {
        createOscillator: () => ({ frequency: {}, connect() {}, start() {} }),
        createDynamicsCompressor: () => ({ connect() {} }),
        destination: {},
        startRendering: async () => {
          throw new Error('render failed');
        },
      };
    };
    expect((await collectAudio({ AudioCtx: ThrowingCtx })).bucket).toBe('unavailable');
  });
});
