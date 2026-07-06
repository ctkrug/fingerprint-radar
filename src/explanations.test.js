import { describe, expect, it } from 'vitest';
import { EXPLANATIONS, explanationFor } from './explanations.js';
import { SIGNAL_IDS } from './signals/index.js';

describe('explanations', () => {
  it('covers every registered signal id with a non-empty explanation', () => {
    for (const id of SIGNAL_IDS) {
      const text = explanationFor(id);
      expect(text, `explanation for ${id}`).toBeTypeOf('string');
      expect(text.length, `explanation length for ${id}`).toBeGreaterThanOrEqual(20);
    }
  });

  it('has no explanations for ids that are not shipped signals', () => {
    for (const id of Object.keys(EXPLANATIONS)) {
      expect(SIGNAL_IDS).toContain(id);
    }
  });

  it('returns null (no silent blank fallback) for an unknown id', () => {
    expect(explanationFor('not-a-signal')).toBeNull();
  });
});
