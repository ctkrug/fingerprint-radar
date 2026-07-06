// Combined-uniqueness helpers: turn per-signal probabilities into a single
// "1 in N" figure and a low/medium/high identifiability band.
//
// Combining independent signals multiplies their probabilities (equivalently,
// sums their bits). Real signals are not perfectly independent, so this is an
// upper bound on distinctiveness — the UI states that caveat explicitly.

// Band boundaries in bits. Chosen so "Low" is a browser that blends into a
// large crowd, "High" is effectively one-of-a-kind. Roughly: 10 bits ≈ 1 in
// 1,000; 20 bits ≈ 1 in 1,000,000.
export const BAND_BOUNDARIES = { medium: 10, high: 20 };

export function oneInN(totalBits) {
  return Math.pow(2, totalBits);
}

// Multiply the independent per-signal probabilities into a single 1-in-N
// figure. Each scored signal carries a `probability` in (0, 1]; the product of
// their reciprocals is how many equally-likely browsers share the whole set.
export function estimateUniqueness(scoredSignals) {
  const denominator = scoredSignals.reduce((product, signal) => {
    const p = signal.probability;
    if (!(p > 0)) return product;
    return product * p;
  }, 1);
  if (denominator <= 0) return Infinity;
  return 1 / denominator;
}

export function identifiabilityBand(totalBits) {
  if (totalBits >= BAND_BOUNDARIES.high) {
    return { key: 'high', label: 'High' };
  }
  if (totalBits >= BAND_BOUNDARIES.medium) {
    return { key: 'medium', label: 'Medium' };
  }
  return { key: 'low', label: 'Low' };
}
