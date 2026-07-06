// DOM rendering for the app shell and the live report. Kept free of timers and
// canvas so it can be exercised in jsdom: build the shell, then fill in the
// score, the per-signal breakdown, and the identifiability gauge.

import { formatBits, formatUniqueness } from './format.js';

const WORDMARK = `<span class="wordmark__fp">Fingerprint</span><span class="wordmark__radar">Radar</span>`;

// The built site ships without docs/, so link the methodology to its source.
const METHODOLOGY_URL =
  'https://github.com/ctkrug/fingerprint-radar/blob/main/docs/METHODOLOGY.md';
const EXTERNAL = 'target="_blank" rel="noopener noreferrer"';

export function appShellHTML() {
  return `
    <div class="app">
      <header class="topbar">
        <a class="wordmark" href="./" aria-label="Fingerprint Radar home">
          <svg class="wordmark__glyph" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-opacity="0.4" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-opacity="0.6" />
            <path d="M12 12 L12 1.5 A10.5 10.5 0 0 1 20 6 Z" fill="currentColor" fill-opacity="0.35" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          </svg>
          ${WORDMARK}
        </a>
        <div class="controls">
          <button type="button" class="btn" id="copy-btn" aria-label="Copy summary to clipboard">
            <span class="btn__label">Copy summary</span>
          </button>
          <button type="button" class="btn btn--icon" id="mute-btn" aria-pressed="false" aria-label="Mute scan sound">
            <span class="btn__icon" aria-hidden="true">♪</span>
          </button>
        </div>
      </header>

      <main class="scope-layout">
        <section class="scope-panel" aria-label="Uniqueness radar scope">
          <canvas class="scope" id="scope"></canvas>
          <div class="scope-center" id="score" aria-live="polite">
            <div class="score__bits" id="score-bits">—</div>
            <div class="score__unit">bits of entropy</div>
            <div class="score__oneinn" id="score-oneinn">measuring…</div>
          </div>
          <div class="gauge" id="gauge" role="img" aria-label="Identifiability band">
            <div class="gauge__seg gauge__seg--low" data-band="low"><span>Low</span></div>
            <div class="gauge__seg gauge__seg--medium" data-band="medium"><span>Medium</span></div>
            <div class="gauge__seg gauge__seg--high" data-band="high"><span>High</span></div>
          </div>
        </section>

        <aside class="breakdown">
          <h2 class="breakdown__title">Signal breakdown</h2>
          <p class="breakdown__hint">More bits = rarer = easier to single out. Tap a signal to learn why.</p>
          <ul class="signal-list" id="signal-list"></ul>
          <p class="caveat" id="caveat">
            Signals are combined assuming independence, so the “1 in N” above is an
            <strong>upper bound</strong> — real signals overlap. See the
            <a href="${METHODOLOGY_URL}" ${EXTERNAL}>methodology</a>.
          </p>
        </aside>
      </main>

      <footer class="privacy" id="privacy">
        <span class="privacy__dot" aria-hidden="true"></span>
        <span>Nothing leaves your browser. Every signal is measured and every bit computed
          in this tab — zero network calls. <a href="${METHODOLOGY_URL}" ${EXTERNAL}>How it works</a>.</span>
      </footer>
    </div>
  `;
}

export function renderScore(root, report) {
  const bitsEl = root.querySelector('#score-bits');
  const oneInNEl = root.querySelector('#score-oneinn');
  if (bitsEl) bitsEl.textContent = formatBits(report.totalBits);
  if (oneInNEl) oneInNEl.textContent = `approximately ${formatUniqueness(report.oneInN)} browsers`;
}

function signalRow(signal, maxBits) {
  const li = document.createElement('li');
  li.className = 'signal-row';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'signal-row__toggle';
  button.setAttribute('aria-expanded', 'false');

  const pct = maxBits > 0 ? Math.max(2, (signal.bits / maxBits) * 100) : 0;
  const unavailable = signal.bucket === 'unavailable';
  button.innerHTML = `
    <span class="signal-row__head">
      <span class="signal-row__name">${signal.label ?? signal.id}</span>
      <span class="signal-row__bits">${signal.bits.toFixed(2)}<span class="signal-row__bits-unit">bits</span></span>
    </span>
    <span class="signal-row__bar"><span class="signal-row__bar-fill" style="width:${pct.toFixed(1)}%"></span></span>
    <span class="signal-row__value">${unavailable ? 'unavailable' : signal.value}</span>
  `;

  const detail = document.createElement('div');
  detail.className = 'signal-row__detail';
  detail.hidden = true;
  detail.textContent = signal.explanation ?? '';

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', open ? 'false' : 'true');
    detail.hidden = open;
  });

  li.append(button, detail);
  return li;
}

export function renderBreakdown(root, report) {
  const list = root.querySelector('#signal-list');
  if (!list) return;
  list.textContent = '';
  const maxBits = Math.max(1, ...report.scored.map((s) => s.bits));
  for (const signal of report.scored) {
    list.appendChild(signalRow(signal, maxBits));
  }
}

export function renderGauge(root, band) {
  const gauge = root.querySelector('#gauge');
  if (!gauge) return;
  gauge.dataset.active = band.key;
  gauge.setAttribute('aria-label', `Identifiability: ${band.label}`);
  for (const seg of gauge.querySelectorAll('.gauge__seg')) {
    seg.classList.toggle('is-active', seg.dataset.band === band.key);
  }
}

export function renderReport(root, report) {
  renderScore(root, report);
  renderBreakdown(root, report);
  renderGauge(root, report.band);
}
