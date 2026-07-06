import { describe, expect, it } from 'vitest';
import { createSounder, readMuted, writeMuted } from './sound.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

describe('mute persistence', () => {
  it('defaults to not muted', () => {
    expect(readMuted(memoryStorage())).toBe(false);
  });

  it('round-trips a muted flag through storage', () => {
    const storage = memoryStorage();
    writeMuted(storage, true);
    expect(readMuted(storage)).toBe(true);
    writeMuted(storage, false);
    expect(readMuted(storage)).toBe(false);
  });

  it('tolerates a throwing storage', () => {
    const bad = {
      getItem: () => {
        throw new Error('nope');
      },
      setItem: () => {
        throw new Error('nope');
      },
    };
    expect(readMuted(bad)).toBe(false);
    expect(() => writeMuted(bad, true)).not.toThrow();
  });
});

describe('createSounder', () => {
  it('reflects the persisted mute state on creation', () => {
    const storage = memoryStorage({ 'fpr:muted': '1' });
    expect(createSounder({ AudioCtx: undefined, storage }).isMuted()).toBe(true);
  });

  it('toggles mute and persists it', () => {
    const storage = memoryStorage();
    const sounder = createSounder({ AudioCtx: undefined, storage });
    expect(sounder.toggle()).toBe(true);
    expect(readMuted(storage)).toBe(true);
    expect(sounder.toggle()).toBe(false);
    expect(readMuted(storage)).toBe(false);
  });

  it('does nothing on ping when no AudioContext is available', () => {
    const sounder = createSounder({ AudioCtx: undefined, storage: memoryStorage() });
    expect(() => sounder.ping(440)).not.toThrow();
  });

  it('never plays while muted', () => {
    let constructed = 0;
    const FakeCtx = function () {
      constructed += 1;
      return { currentTime: 0, createOscillator: () => ({}), createGain: () => ({}), destination: {} };
    };
    const sounder = createSounder({ AudioCtx: FakeCtx, storage: memoryStorage({ 'fpr:muted': '1' }) });
    sounder.ping(440);
    expect(constructed).toBe(0); // muted -> context never created
  });
});
