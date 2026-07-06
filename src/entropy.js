const MAX_BITS = 32;

export function shannonEntropyBits(p) {
  if (Number.isNaN(p)) return 0; // malformed input contributes no information
  if (p <= 0) return MAX_BITS; // impossible event -> capped surprise
  if (p >= 1) return 0; // certain event -> no information (also clamps p > 1)
  return Math.min(-Math.log2(p), MAX_BITS);
}

export function combineIndependentBits(bitsList) {
  return bitsList.reduce((total, bits) => total + bits, 0);
}
