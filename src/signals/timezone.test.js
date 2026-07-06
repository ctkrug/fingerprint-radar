import { describe, expect, it } from 'vitest';
import { collectTimezone } from './timezone.js';

function stubIntl(resolved) {
  return { DateTimeFormat: () => ({ resolvedOptions: () => resolved }) };
}

describe('collectTimezone', () => {
  it('returns timeZone, locale, and numberingSystem from Intl', () => {
    const intl = stubIntl({
      timeZone: 'America/New_York',
      locale: 'en-US',
      numberingSystem: 'latn',
    });
    const signal = collectTimezone({ intl });
    expect(signal.value).toBe('America/New_York');
    expect(signal.detail).toEqual({
      timeZone: 'America/New_York',
      locale: 'en-US',
      numberingSystem: 'latn',
    });
    expect(signal.bucket).toBe('measured');
  });

  it('degrades to an unavailable value when Intl throws', () => {
    const intl = {
      DateTimeFormat: () => {
        throw new Error('no Intl');
      },
    };
    const signal = collectTimezone({ intl });
    expect(signal.value).toBe('unavailable');
    expect(signal.id).toBe('timezone');
  });

  it('falls back to "unknown" when timeZone is empty', () => {
    const signal = collectTimezone({ intl: stubIntl({ timeZone: '', locale: 'en' }) });
    expect(signal.value).toBe('unknown');
  });
});
