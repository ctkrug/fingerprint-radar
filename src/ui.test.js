import { beforeEach, describe, expect, it } from 'vitest';
import { appShellHTML, renderBreakdown, renderGauge, renderReport, renderScore } from './ui.js';

const report = {
  totalBits: 24.6,
  oneInN: 25_000_000,
  band: { key: 'high', label: 'High' },
  scored: [
    { id: 'canvas', label: 'Canvas render', value: 'deadbeef', bits: 8.3, bucket: 'measured', explanation: 'Canvas explanation text goes here.' },
    { id: 'timezone', label: 'Timezone', value: 'America/New_York', bits: 3.0, bucket: 'measured', explanation: 'Timezone explanation.' },
    { id: 'webgl', label: 'WebGL / GPU', value: 'unavailable', bits: 4.0, bucket: 'unavailable', explanation: 'WebGL explanation.' },
  ],
};

let root;
beforeEach(() => {
  root = document.createElement('div');
  root.innerHTML = appShellHTML();
});

describe('renderScore', () => {
  it('shows a numeric bits value and an approximate 1-in-N string', () => {
    renderScore(root, report);
    expect(root.querySelector('#score-bits').textContent).toBe('24.6');
    const oneInN = root.querySelector('#score-oneinn').textContent;
    expect(oneInN).toMatch(/approximately 1 in .* browsers/);
  });
});

describe('renderBreakdown', () => {
  it('renders one row per signal', () => {
    renderBreakdown(root, report);
    expect(root.querySelectorAll('.signal-row')).toHaveLength(3);
  });

  it('labels unavailable signals as unavailable in the value slot', () => {
    renderBreakdown(root, report);
    const rows = [...root.querySelectorAll('.signal-row')];
    const webglRow = rows.find((r) => r.textContent.includes('WebGL'));
    expect(webglRow.querySelector('.signal-row__value').textContent).toBe('unavailable');
  });

  it('toggles the explanation open on click and back on second click', () => {
    renderBreakdown(root, report);
    const button = root.querySelector('.signal-row__toggle');
    const detail = button.parentElement.querySelector('.signal-row__detail');
    expect(detail.hidden).toBe(true);
    button.click();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(detail.hidden).toBe(false);
    button.click();
    expect(detail.hidden).toBe(true);
  });
});

describe('renderGauge', () => {
  it('marks the active band segment', () => {
    renderGauge(root, report.band);
    const active = root.querySelector('.gauge__seg.is-active');
    expect(active.dataset.band).toBe('high');
    expect(root.querySelector('#gauge').dataset.active).toBe('high');
  });
});

describe('renderReport', () => {
  it('populates score, breakdown, and gauge together', () => {
    renderReport(root, report);
    expect(root.querySelector('#score-bits').textContent).toBe('24.6');
    expect(root.querySelectorAll('.signal-row')).toHaveLength(3);
    expect(root.querySelector('.gauge__seg.is-active')).not.toBeNull();
  });
});
