import { describe, expect, it } from 'vitest';
import table from './reference-frequencies.json';

const signalEntries = Object.entries(table).filter(([key]) => !key.startsWith('_'));

describe('reference-frequencies.json', () => {
  it('exposes at least the six core v1 signals', () => {
    const ids = signalEntries.map(([id]) => id);
    for (const required of ['canvas', 'timezone', 'webgl', 'audio', 'screen', 'hardware']) {
      expect(ids).toContain(required);
    }
  });

  it('gives every signal a non-empty bucket map', () => {
    for (const [id, entry] of signalEntries) {
      expect(entry.buckets, `${id} buckets`).toBeTypeOf('object');
      expect(Object.keys(entry.buckets).length, `${id} bucket count`).toBeGreaterThan(0);
    }
  });

  it('stores every bucket rate as a probability strictly between 0 and 1', () => {
    for (const [id, entry] of signalEntries) {
      for (const [bucket, p] of Object.entries(entry.buckets)) {
        expect(typeof p, `${id}.${bucket} type`).toBe('number');
        expect(p, `${id}.${bucket} lower bound`).toBeGreaterThan(0);
        expect(p, `${id}.${bucket} upper bound`).toBeLessThan(1);
      }
    }
  });
});
