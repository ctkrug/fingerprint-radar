// Scoring: map a collected signal to a probability (from the reference table)
// and its bit contribution. A collected signal looks like
//   { id, label, value, bucket }
// where `bucket` names an entry in reference-frequencies.json for that id.

import defaultTable from './data/reference-frequencies.json';
import { combineIndependentBits, shannonEntropyBits } from './entropy.js';

// Resolve the probability for a signal's bucket. Falls back conservatively to
// the least-identifying (highest-probability) bucket if the id or bucket is
// unknown, so a collector bug can never overstate how unique someone is.
export function probabilityFor(signal, table = defaultTable) {
  const entry = table[signal.id];
  if (!entry || !entry.buckets) return 1;
  const buckets = entry.buckets;
  const direct = buckets[signal.bucket];
  if (typeof direct === 'number') return direct;
  const values = Object.values(buckets);
  return values.length ? Math.max(...values) : 1;
}

export function scoreSignal(signal, table = defaultTable) {
  const probability = probabilityFor(signal, table);
  return { ...signal, probability, bits: shannonEntropyBits(probability) };
}

export function scoreSignals(signals, table = defaultTable) {
  const scored = signals.map((signal) => scoreSignal(signal, table));
  const totalBits = combineIndependentBits(scored.map((s) => s.bits));
  return { scored, totalBits };
}
