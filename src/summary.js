// Plain-text summary export. buildSummary is pure (easy to unit-test);
// copySummary writes it to the clipboard with an injectable clipboard object.

function formatOneInN(n) {
  if (!Number.isFinite(n)) return 'effectively unique';
  return `1 in ${Math.round(n).toLocaleString('en-US')}`;
}

// Build a shareable plain-text report. `report` carries the scored signals and
// the aggregate figures already computed by the app.
export function buildSummary(report) {
  const { scored = [], totalBits = 0, oneInN = 1, band = { label: 'Low' } } = report;
  const lines = [
    'Fingerprint Radar — how unique is my browser?',
    '',
    `Total entropy: ${totalBits.toFixed(1)} bits`,
    `Uniqueness: ${formatOneInN(oneInN)} browsers`,
    `Identifiability: ${band.label}`,
    '',
    'Per-signal breakdown (bits):',
  ];
  const ranked = [...scored].sort((a, b) => b.bits - a.bits);
  for (const signal of ranked) {
    const label = signal.label || signal.id;
    lines.push(`  ${label}: ${signal.bits.toFixed(2)} bits — ${signal.value}`);
  }
  lines.push('', 'Computed entirely in-browser. Nothing was sent anywhere.');
  return lines.join('\n');
}

export async function copySummary(text, { clipboard = globalThis.navigator?.clipboard } = {}) {
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return false;
  }
  await clipboard.writeText(text);
  return true;
}
