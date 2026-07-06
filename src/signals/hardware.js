// Hardware / navigator-misc collector. Bundles CPU core count, device memory,
// platform, and touch support — coarse numbers that together still narrow the
// crowd. Missing properties default to "unknown" rather than throwing; when two
// or more are unknown the signal drops to the less-identifying "unknown" bucket.

function orUnknown(value) {
  return value === undefined || value === null ? 'unknown' : value;
}

export function collectHardware({ nav = globalThis.navigator } = {}) {
  const cores = orUnknown(nav && nav.hardwareConcurrency);
  const memory = orUnknown(nav && nav.deviceMemory);
  const platform = orUnknown(nav && nav.platform);

  let touch = false;
  if (nav && typeof nav.maxTouchPoints === 'number') {
    touch = nav.maxTouchPoints > 0;
  } else if (globalThis && 'ontouchstart' in globalThis) {
    touch = true;
  }

  const unknownCount = [cores, memory, platform].filter((v) => v === 'unknown').length;
  const bucket = unknownCount >= 2 ? 'unknown' : 'measured';

  const memoryText = memory === 'unknown' ? 'unknown' : `${memory}GB`;
  return {
    id: 'hardware',
    label: 'Hardware',
    value: `${cores} cores · ${memoryText} · ${platform} · ${touch ? 'touch' : 'no touch'}`,
    bucket,
    detail: { cores, memory, platform, touch },
  };
}
