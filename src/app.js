// App orchestration: build the shell, collect signals, compute the report, and
// drive the radar, sound, and controls. This is the only module that owns
// timers and live browser APIs; the logic it calls is unit-tested elsewhere.

import { collectAll } from './signals/index.js';
import { computeReport } from './report.js';
import { createRadar } from './radar.js';
import { createSounder } from './sound.js';
import { buildSummary, copySummary } from './summary.js';
import { formatBits, formatUniqueness } from './format.js';
import { appShellHTML, renderBreakdown, renderGauge, renderScore } from './ui.js';

const REVEAL_STAGGER_MS = 220;

function prefersReducedMotion() {
  return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

// Count the big bits number up from 0 so the score "spins up" like an
// instrument. Falls back to an instant set when motion is reduced.
function animateBits(el, target, reducedMotion) {
  if (!el) return;
  if (reducedMotion) {
    el.textContent = formatBits(target);
    return;
  }
  const duration = 900;
  const start = globalThis.performance?.now?.() ?? 0;
  const step = (t) => {
    const elapsed = (globalThis.performance?.now?.() ?? 0) - start;
    const frac = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - frac, 3);
    el.textContent = formatBits(target * eased);
    if (frac < 1) globalThis.requestAnimationFrame?.(step);
    else el.textContent = formatBits(target);
  };
  globalThis.requestAnimationFrame?.(step) ?? (el.textContent = formatBits(target));
}

function wireMute(root, sounder) {
  const btn = root.querySelector('#mute-btn');
  if (!btn) return;
  const sync = () => {
    const muted = sounder.isMuted();
    btn.setAttribute('aria-pressed', String(muted));
    btn.setAttribute('aria-label', muted ? 'Unmute scan sound' : 'Mute scan sound');
    btn.classList.toggle('is-muted', muted);
    const icon = btn.querySelector('.btn__icon');
    if (icon) icon.textContent = muted ? '♪̶' : '♪';
  };
  btn.addEventListener('click', () => {
    sounder.toggle();
    sync();
  });
  sync();
}

function wireCopy(root, getReport) {
  const btn = root.querySelector('#copy-btn');
  if (!btn) return;
  const label = btn.querySelector('.btn__label');
  // Capture the resting label once; a rapid second click must not treat the
  // transient "Copied!" text as the value to restore to.
  const defaultLabel = label ? label.textContent : '';
  let restoreTimer = null;
  btn.addEventListener('click', async () => {
    const report = getReport();
    if (!report) return;
    const ok = await copySummary(buildSummary(report));
    if (!label) return;
    if (restoreTimer != null) globalThis.clearTimeout?.(restoreTimer);
    label.textContent = ok ? 'Copied!' : 'Copy failed';
    btn.classList.add('is-flashed');
    restoreTimer = globalThis.setTimeout?.(() => {
      label.textContent = defaultLabel;
      btn.classList.remove('is-flashed');
      restoreTimer = null;
    }, 1600);
  });
}

export async function mountApp(root, deps = {}) {
  const { collect = collectAll, table } = deps;
  const reducedMotion = prefersReducedMotion();
  root.innerHTML = appShellHTML();

  const sounder = createSounder();
  const canvas = root.querySelector('#scope');
  const radar = canvas ? createRadar(canvas, { reducedMotion }) : null;
  let currentReport = null;

  wireMute(root, sounder);
  wireCopy(root, () => currentReport);

  if (radar) {
    radar.resize();
    globalThis.addEventListener?.('resize', () => radar.resize());
  }

  const signals = await collect();
  const report = computeReport(signals, table);
  currentReport = report;

  renderBreakdown(root, report);
  renderGauge(root, report.band);
  renderScore(root, { ...report, totalBits: report.totalBits });
  animateBits(root.querySelector('#score-bits'), report.totalBits, reducedMotion);

  // Announce the settled result once, so a screen reader hears a clean summary
  // instead of every intermediate frame of the count-up animation.
  const status = root.querySelector('#score-status');
  if (status) {
    status.textContent =
      `Your browser scores ${formatBits(report.totalBits)} bits of entropy, ` +
      `approximately ${formatUniqueness(report.oneInN)} browsers — ` +
      `${report.band.label} identifiability.`;
  }

  if (radar) {
    radar.setSignals(report.scored);
    radar.start();
  }

  // Ping as each blip lands, matching the radar's reveal stagger.
  if (!reducedMotion) {
    report.scored.forEach((signal, i) => {
      globalThis.setTimeout?.(() => sounder.ping(760 - i * 45), i * REVEAL_STAGGER_MS);
    });
  }

  return { report, radar, sounder };
}
