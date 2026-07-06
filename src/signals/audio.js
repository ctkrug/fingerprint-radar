// Audio collector. Renders a short waveform through an OfflineAudioContext and
// summarizes the output — small numerical differences in the audio stack form
// a stable, device-varying fingerprint. Async (rendering resolves a promise).
// The context constructor is injectable; when it is absent the collector
// returns the unavailable bucket rather than throwing.

import { hashPixels } from './canvas.js';

const UNAVAILABLE = {
  id: 'audio',
  label: 'Audio stack',
  value: 'unavailable',
  bucket: 'unavailable',
};

// Fold the rendered samples into a compact, stable fingerprint string.
function summarize(channel) {
  let acc = 0;
  const bytes = [];
  for (let i = 0; i < channel.length; i += 1) {
    acc += Math.abs(channel[i]);
    if (i % 100 === 0) bytes.push(Math.floor(Math.abs(channel[i]) * 255) & 0xff);
  }
  return `${hashPixels(bytes)}-${acc.toFixed(3)}`;
}

export async function collectAudio({ AudioCtx = globalThis.OfflineAudioContext } = {}) {
  try {
    if (typeof AudioCtx !== 'function') return { ...UNAVAILABLE };

    const ctx = new AudioCtx(1, 5000, 44100);
    const oscillator = ctx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    const compressor = ctx.createDynamicsCompressor();
    oscillator.connect(compressor);
    compressor.connect(ctx.destination);
    oscillator.start(0);

    const buffer = await ctx.startRendering();
    const channel = buffer.getChannelData(0);
    return {
      id: 'audio',
      label: 'Audio stack',
      value: summarize(channel),
      bucket: 'measured',
    };
  } catch {
    return { ...UNAVAILABLE };
  }
}
