// Timezone / locale-format collector. Reads Intl.DateTimeFormat resolved
// options — your timezone plus the locale and numbering system the browser
// resolved. `intl` is injectable so tests can pass a stub.

export function collectTimezone({ intl = globalThis.Intl } = {}) {
  try {
    const options = intl.DateTimeFormat().resolvedOptions();
    const timeZone = options.timeZone || 'unknown';
    return {
      id: 'timezone',
      label: 'Timezone',
      value: timeZone,
      bucket: 'measured',
      detail: {
        timeZone,
        locale: options.locale,
        numberingSystem: options.numberingSystem,
      },
    };
  } catch {
    return { id: 'timezone', label: 'Timezone', value: 'unavailable', bucket: 'measured' };
  }
}
