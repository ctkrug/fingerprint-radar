// Pure geometry for the radar scope: where each signal's blip sits and where
// the sweep arm points. Kept separate from the canvas drawing so it can be
// unit-tested without a real rendering context.

const TAU = Math.PI * 2;

// Place one blip per signal around the scope. Higher-entropy signals sit
// farther from the center and render larger, so the eye reads distinctiveness
// as "big, out toward the rim". Angles are distributed evenly by index.
export function computeBlips(signals, { cx, cy, radius, minSize = 4, maxSize = 16 }) {
  const maxBits = Math.max(1, ...signals.map((s) => s.bits || 0));
  const count = Math.max(1, signals.length);
  return signals.map((signal, i) => {
    const angle = (i / count) * TAU - Math.PI / 2;
    const frac = Math.min(1, (signal.bits || 0) / maxBits);
    const r = radius * (0.42 + 0.5 * frac);
    return {
      id: signal.id,
      angle,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      size: minSize + (maxSize - minSize) * frac,
      frac,
    };
  });
}

// Sweep arm angle (radians) at a given elapsed time, looping every `periodMs`.
export function sweepAngle(elapsedMs, periodMs) {
  if (!(periodMs > 0)) return 0;
  const phase = (elapsedMs % periodMs) / periodMs;
  return phase * TAU;
}

// A blip is "lit" when the sweep arm is within `windowRad` behind it — used to
// make blips flare as the beam passes over them.
export function isBlipLit(blipAngle, sweep, windowRad = Math.PI / 6) {
  const normalize = (a) => ((a % TAU) + TAU) % TAU;
  const delta = normalize(sweep - blipAngle);
  return delta <= windowRad;
}
