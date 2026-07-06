import { describe, expect, it } from 'vitest';
import { collectAll, DEFAULT_COLLECTORS, SIGNAL_IDS } from './index.js';

describe('collectAll', () => {
  it('runs every collector and returns their signals', async () => {
    const collectors = [
      () => ({ id: 'a', bucket: 'measured' }),
      async () => ({ id: 'b', bucket: 'measured' }),
    ];
    const signals = await collectAll(collectors);
    expect(signals.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('drops a throwing collector instead of failing the whole run', async () => {
    const collectors = [
      () => ({ id: 'ok', bucket: 'measured' }),
      () => {
        throw new Error('boom');
      },
      async () => {
        throw new Error('async boom');
      },
    ];
    const signals = await collectAll(collectors);
    expect(signals.map((s) => s.id)).toEqual(['ok']);
  });

  it('ships one canonical id per default collector', () => {
    expect(SIGNAL_IDS).toHaveLength(DEFAULT_COLLECTORS.length);
  });
});
