import { describe, expect, it } from 'vitest';
import { collectLocale } from './locale.js';

describe('collectLocale', () => {
  it('buckets a common primary language as "common"', () => {
    const signal = collectLocale({ nav: { languages: ['en-US', 'en'] } });
    expect(signal.bucket).toBe('common');
    expect(signal.value).toBe('en-US, en');
    expect(signal.detail.primary).toBe('en');
  });

  it('buckets an uncommon primary language as "uncommon"', () => {
    expect(collectLocale({ nav: { languages: ['is-IS'] } }).bucket).toBe('uncommon');
  });

  it('falls back to navigator.language when languages is absent', () => {
    const signal = collectLocale({ nav: { language: 'fr-FR' } });
    expect(signal.bucket).toBe('common');
    expect(signal.value).toBe('fr-FR');
  });

  it('handles a missing navigator without throwing', () => {
    const signal = collectLocale({ nav: undefined });
    expect(signal.value).toBe('unknown');
    expect(signal.bucket).toBe('uncommon');
  });
});
