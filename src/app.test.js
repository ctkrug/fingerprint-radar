// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountApp } from './app.js';

// Force reduced motion so the bits score is set to its final value
// synchronously (no requestAnimationFrame count-up to wait on).
beforeEach(() => {
  globalThis.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
});
afterEach(() => {
  delete globalThis.matchMedia;
});

function mount(signals) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  return mountApp(root, { collect: async () => signals }).then(() => root);
}

const measured = [
  { id: 'timezone', label: 'Timezone', value: 'America/New_York', bucket: 'measured' },
  { id: 'canvas', label: 'Canvas', value: 'deadbeef', bucket: 'measured' },
  { id: 'screen', label: 'Screen', value: '1920x1080', bucket: 'common' },
];

describe('mountApp', () => {
  it('displays a numeric bits value and an approximate 1-in-N string', async () => {
    const root = await mount(measured);
    const bits = root.querySelector('#score-bits').textContent;
    expect(Number.parseFloat(bits)).toBeGreaterThan(0);
    expect(root.querySelector('#score-oneinn').textContent).toMatch(
      /approximately 1 in .* browsers/,
    );
  });

  it('renders one breakdown row per collected signal', async () => {
    const root = await mount(measured);
    expect(root.querySelectorAll('.signal-row')).toHaveLength(3);
  });

  it('recomputes a different score for a different signal input', async () => {
    const distinctive = await mount([{ id: 'canvas', bucket: 'measured' }]);
    const common = await mount([{ id: 'canvas', bucket: 'unavailable' }]);
    const a = Number.parseFloat(distinctive.querySelector('#score-bits').textContent);
    const b = Number.parseFloat(common.querySelector('#score-bits').textContent);
    expect(a).not.toBeCloseTo(b, 3);
  });

  it('marks the gauge with an identifiability band', async () => {
    const root = await mount(measured);
    expect(root.querySelector('.gauge__seg.is-active')).not.toBeNull();
  });

  it('restores the copy button label after a rapid double-click', async () => {
    const flush = async () => {
      for (let i = 0; i < 6; i += 1) await Promise.resolve();
    };
    const writeText = vi.fn().mockResolvedValue(undefined);
    globalThis.navigator.clipboard = { writeText };
    const root = await mount(measured);
    const btn = root.querySelector('#copy-btn');
    const label = btn.querySelector('.btn__label');
    const original = label.textContent;

    vi.useFakeTimers();
    btn.click();
    await flush();
    btn.click();
    await flush();
    expect(label.textContent).toBe('Copied!');

    vi.advanceTimersByTime(2000);
    expect(label.textContent).toBe(original);

    vi.useRealTimers();
    delete globalThis.navigator.clipboard;
  });
});
