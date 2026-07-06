// Radar scope renderer. Draws the blueprint grid, the rotating cyan sweep arm
// with a fading trail, and one blip per signal that "pings" onto the scope in
// sequence. Pure geometry lives in radar-geometry.js; this module owns the
// canvas drawing, devicePixelRatio scaling, and the animation loop.
//
// The central score is rendered as HTML (crisp text + a11y live region), so the
// canvas is purely the instrument face.

import { computeBlips, isBlipLit, sweepAngle } from './radar-geometry.js';

const TAU = Math.PI * 2;
const SWEEP_PERIOD_MS = 4000;
const REVEAL_STAGGER_MS = 220;
const PING_MS = 500;

const COLORS = {
  grid: 'rgba(0, 229, 199, 0.16)',
  gridStrong: 'rgba(0, 229, 199, 0.28)',
  sweep: 'rgba(0, 229, 199, 0.55)',
  blip: '#00e5c7',
  blipHot: '#ffffff',
};

export function createRadar(canvas, options = {}) {
  const {
    reducedMotion = false,
    now = () => globalThis.performance?.now?.() ?? 0,
    raf = globalThis.requestAnimationFrame?.bind(globalThis),
    caf = globalThis.cancelAnimationFrame?.bind(globalThis),
  } = options;

  const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
  let rawSignals = [];
  let blips = [];
  let size = 0;
  let dpr = 1;
  let startedAt = null;
  let frame = null;
  let running = false;

  function measure() {
    const rect =
      typeof canvas.getBoundingClientRect === 'function'
        ? canvas.getBoundingClientRect()
        : { width: canvas.clientWidth || 320, height: canvas.clientHeight || 320 };
    return Math.max(1, Math.min(rect.width || 320, rect.height || 320));
  }

  function layout() {
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * 0.82;
    blips = computeBlips(rawSignals, { cx, cy, radius }).map((b, i) => ({
      ...b,
      revealAt: reducedMotion ? 0 : i * REVEAL_STAGGER_MS,
    }));
  }

  function resize() {
    if (!ctx) return;
    size = measure();
    dpr = globalThis.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    layout();
    draw();
  }

  function setSignals(signals) {
    rawSignals = signals || [];
    startedAt = now();
    layout();
    draw();
  }

  function drawGrid(cx, cy, radius) {
    ctx.lineWidth = 1;
    for (const ring of [0.35, 0.62, 0.85, 1]) {
      ctx.beginPath();
      ctx.strokeStyle = ring === 1 ? COLORS.gridStrong : COLORS.grid;
      ctx.arc(cx, cy, radius * ring, 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = COLORS.grid;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
    }
  }

  function drawSweep(cx, cy, radius, sweep) {
    const trail = 0.6; // radians of fading trail behind the arm
    for (let i = 0; i < 24; i += 1) {
      const frac = i / 24;
      const a = sweep - frac * trail;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 229, 199, ${0.5 * (1 - frac)})`;
      ctx.lineWidth = 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
    }
    // Bright leading edge.
    ctx.beginPath();
    ctx.strokeStyle = COLORS.sweep;
    ctx.lineWidth = 2;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * radius, cy + Math.sin(sweep) * radius);
    ctx.stroke();
  }

  function drawBlip(blip, elapsed, sweep) {
    const age = elapsed - blip.revealAt;
    if (age < 0) return;
    const pop = reducedMotion ? 1 : Math.min(1, age / PING_MS);
    const eased = 1 - Math.pow(1 - pop, 3);
    const lit = !reducedMotion && isBlipLit(blip.angle, sweep);
    const r = blip.size * (0.4 + 0.6 * eased);

    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * eased;
    ctx.shadowColor = COLORS.blip;
    ctx.shadowBlur = lit ? 22 : 12;
    ctx.fillStyle = lit ? COLORS.blipHot : COLORS.blip;
    ctx.beginPath();
    ctx.arc(blip.x, blip.y, r, 0, TAU);
    ctx.fill();
    // Expanding ping ring on arrival.
    if (!reducedMotion && pop < 1) {
      ctx.globalAlpha = (1 - pop) * 0.6;
      ctx.strokeStyle = COLORS.blip;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(blip.x, blip.y, r + pop * blip.size * 2.5, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * 0.82;
    const elapsed = startedAt == null ? 0 : now() - startedAt;
    const sweep = reducedMotion ? -Math.PI / 2 : sweepAngle(elapsed, SWEEP_PERIOD_MS);

    drawGrid(cx, cy, radius);
    if (!reducedMotion) drawSweep(cx, cy, radius, sweep);
    for (const blip of blips) drawBlip(blip, elapsed, sweep);
  }

  function tick() {
    draw();
    if (running && raf) frame = raf(tick);
  }

  function start() {
    if (reducedMotion || !ctx || !raf) {
      draw();
      return;
    }
    running = true;
    frame = raf(tick);
  }

  function stop() {
    running = false;
    if (frame != null && caf) caf(frame);
    frame = null;
  }

  return { resize, setSignals, start, stop, draw };
}
