const MAX_BITS = 32;

export function shannonEntropyBits(p) {
  if (p <= 0) return MAX_BITS;
  return Math.min(-Math.log2(p), MAX_BITS);
}

export function combineIndependentBits(bitsList) {
  return bitsList.reduce((total, bits) => total + bits, 0);
}
