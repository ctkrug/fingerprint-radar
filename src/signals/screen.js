// Screen collector. Resolution, color depth, and pixel density describe your
// display. A handful of common resolutions dominate, so unusual geometries are
// quite identifying. `scr` and `dpr` are injectable for tests.

// Widely-seen desktop and mobile resolutions (WxH), order-independent.
const COMMON_RESOLUTIONS = new Set([
  '1920x1080',
  '1366x768',
  '1440x900',
  '1536x864',
  '1280x720',
  '1280x800',
  '2560x1440',
  '1600x900',
  '390x844',
  '414x896',
  '360x800',
  '375x812',
  '768x1024',
]);

function normalizeResolution(width, height) {
  // Compare regardless of orientation so a rotated phone still matches.
  const [a, b] = [width, height].sort((x, y) => y - x);
  return { display: `${width}x${height}`, key: `${a}x${b}`, keyAlt: `${b}x${a}` };
}

export function collectScreen({ scr = globalThis.screen, dpr = globalThis.devicePixelRatio } = {}) {
  const width = (scr && scr.width) || 0;
  const height = (scr && scr.height) || 0;
  const depth = (scr && scr.colorDepth) || 'unknown';
  const ratio = dpr || 1;

  const { display, key, keyAlt } = normalizeResolution(width, height);
  const bucket =
    COMMON_RESOLUTIONS.has(key) || COMMON_RESOLUTIONS.has(keyAlt) ? 'common' : 'uncommon';

  return {
    id: 'screen',
    label: 'Screen',
    value: `${display} · ${depth}-bit · ${ratio}×`,
    bucket,
    detail: { width, height, depth, ratio },
  };
}
