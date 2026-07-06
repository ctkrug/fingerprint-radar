// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { collectAll } from './signals/index.js';
import { computeReport } from './report.js';

// End-to-end through the REAL default collectors (no injected stubs). In jsdom
// the canvas/webgl/audio contexts are unavailable, but every collector must
// degrade gracefully and the pipeline must still produce a valid report.
describe('real collector pipeline', () => {
  it('collects all signals without throwing and produces a finite score', async () => {
    const signals = await collectAll();
    expect(signals.length).toBeGreaterThanOrEqual(4);

    const report = computeReport(signals);
    expect(Number.isFinite(report.totalBits)).toBe(true);
    expect(report.totalBits).toBeGreaterThanOrEqual(0);
    expect(report.oneInN).toBeGreaterThanOrEqual(1);
    expect(['low', 'medium', 'high']).toContain(report.band.key);
    for (const signal of report.scored) {
      expect(Number.isFinite(signal.bits)).toBe(true);
      expect(signal.explanation).toBeTypeOf('string');
    }
  });
});
