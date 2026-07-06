import { describe, expect, it } from 'vitest';
import { formatBits, formatCount, formatUniqueness } from './format.js';

describe('formatCount', () => {
  it('shows small counts exactly', () => {
    expect(formatCount(1)).toBe('1');
    expect(formatCount(42)).toBe('42');
    expect(formatCount(999)).toBe('999');
  });

  it('scales large counts with a word suffix', () => {
    expect(formatCount(2_400_000)).toBe('2.40 million');
    expect(formatCount(3_000_000_000)).toBe('3.00 billion');
    expect(formatCount(15_000)).toBe('15.0 thousand');
  });

  it('promotes to the next unit rather than showing "1000 thousand"', () => {
    expect(formatCount(999_999)).toBe('1.00 million');
    expect(formatCount(999_999_999)).toBe('1.00 billion');
  });

  it('returns "unique" for a non-finite count', () => {
    expect(formatCount(Infinity)).toBe('unique');
  });

  it('never returns an empty string for edge inputs', () => {
    expect(formatCount(0)).toBe('1');
    expect(formatCount(0.4)).toBe('1');
  });
});

describe('formatUniqueness', () => {
  it('prefixes the count with "1 in"', () => {
    expect(formatUniqueness(1024)).toBe('1 in 1.02 thousand');
  });

  it('reads as one-of-a-kind when infinite', () => {
    expect(formatUniqueness(Infinity)).toBe('effectively one of a kind');
  });
});

describe('formatBits', () => {
  it('renders one decimal place', () => {
    expect(formatBits(12.345)).toBe('12.3');
    expect(formatBits(0)).toBe('0.0');
  });
});
