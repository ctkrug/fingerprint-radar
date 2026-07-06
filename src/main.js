import { shannonEntropyBits } from './entropy.js';
import { createSignalRegistry } from './signals/registry.js';

const registry = createSignalRegistry();
registry.register({
  id: 'timezone',
  label: 'Timezone',
  collect: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
});

function render() {
  const app = document.getElementById('app');
  const [timezoneSignal] = registry.all();
  const value = timezoneSignal.collect();

  // Illustrative only — real per-signal probabilities land with the reference
  // frequency table in docs/BACKLOG.md's Epic 3.
  const demoBits = shannonEntropyBits(1 / 24);

  app.innerHTML = `
    <div class="page">
      <h1 class="wordmark">Fingerprint<span>Radar</span></h1>
      <section class="panel">
        <p class="panel__label">${timezoneSignal.label}</p>
        <p class="panel__value">${value}</p>
        <p class="panel__label">Illustrative entropy: ${demoBits.toFixed(2)} bits</p>
      </section>
      <p>
        Full live scoring across canvas, fonts, WebGL, and audio-context signals
        is next — see <code>docs/VISION.md</code> and <code>docs/BACKLOG.md</code>.
      </p>
    </div>
  `;
}

render();
