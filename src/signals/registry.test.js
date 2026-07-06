import { describe, expect, it } from 'vitest';
import { createSignalRegistry } from './registry.js';

describe('createSignalRegistry', () => {
  it('starts empty', () => {
    expect(createSignalRegistry().all()).toEqual([]);
  });

  it('accumulates registered signals in registration order', () => {
    const registry = createSignalRegistry();
    registry.register({ id: 'timezone' });
    registry.register({ id: 'canvas' });
    expect(registry.all().map((s) => s.id)).toEqual(['timezone', 'canvas']);
  });

  it('returns a defensive copy so callers cannot mutate internal state', () => {
    const registry = createSignalRegistry();
    registry.register({ id: 'a' });
    registry.all().push({ id: 'b' });
    expect(registry.all()).toHaveLength(1);
  });
});
