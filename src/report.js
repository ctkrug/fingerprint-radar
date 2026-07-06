// Compose the full uniqueness report from collected signals. Pure: given the
// same signals it returns the same numbers, and different signal inputs produce
// a different score — which is exactly what "reloading recomputes" relies on.

import { explanationFor } from './explanations.js';
import { scoreSignals } from './scoring.js';
import { estimateUniqueness, identifiabilityBand } from './uniqueness.js';

export function computeReport(signals, table) {
  const { scored, totalBits } = scoreSignals(signals, table);
  const withExplanations = scored.map((signal) => ({
    ...signal,
    explanation: explanationFor(signal.id),
  }));
  const ranked = [...withExplanations].sort((a, b) => b.bits - a.bits);
  return {
    scored: ranked,
    totalBits,
    oneInN: estimateUniqueness(scored),
    band: identifiabilityBand(totalBits),
  };
}
