// Language / locale collector. The browser's preferred languages hint at where
// you are and what you speak. Widely-spoken UI languages are common (low
// entropy); unusual ones stand out. `nav` is injectable for tests.

// Base language codes spoken by very large populations — treated as "common".
const COMMON_LANGUAGES = new Set([
  'en',
  'es',
  'zh',
  'hi',
  'ar',
  'pt',
  'fr',
  'de',
  'ru',
  'ja',
]);

export function collectLocale({ nav = globalThis.navigator } = {}) {
  const languages =
    nav && Array.isArray(nav.languages) && nav.languages.length
      ? [...nav.languages]
      : nav && nav.language
        ? [nav.language]
        : [];
  const primary = (languages[0] || 'unknown').toLowerCase();
  const base = primary.split('-')[0];
  const bucket = COMMON_LANGUAGES.has(base) ? 'common' : 'uncommon';
  return {
    id: 'locale',
    label: 'Language & locale',
    value: languages.length ? languages.join(', ') : 'unknown',
    bucket,
    detail: { languages, primary: base },
  };
}
