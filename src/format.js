// Human-readable formatting for the big uniqueness figure. Turns a raw
// 1-in-N count into something legible ("1 in 2.4 million") instead of a wall
// of digits. Pure functions — unit-tested.

const SCALES = [
  { value: 1e12, suffix: ' trillion' },
  { value: 1e9, suffix: ' billion' },
  { value: 1e6, suffix: ' million' },
  { value: 1e3, suffix: ' thousand' },
];

// Return the "N" part of "1 in N" as a readable string.
export function formatCount(n) {
  if (!Number.isFinite(n)) return 'unique';
  if (n < 1) return '1';
  if (n < 1000) return String(Math.round(n));
  for (let i = 0; i < SCALES.length; i += 1) {
    let { value, suffix } = SCALES[i];
    if (n >= value) {
      let scaled = n / value;
      // Rounding can push a value like 999,999 to "1000 thousand"; promote it to
      // the next-larger unit so it reads "1.00 million" instead.
      if (scaled >= 999.5 && i > 0) {
        ({ value, suffix } = SCALES[i - 1]);
        scaled = n / value;
      }
      const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${scaled.toFixed(digits)}${suffix}`;
    }
  }
  return String(Math.round(n));
}

export function formatUniqueness(n) {
  if (!Number.isFinite(n)) return 'effectively one of a kind';
  return `1 in ${formatCount(n)}`;
}

export function formatBits(bits) {
  return `${bits.toFixed(1)}`;
}
