// Assembles the default set of signal collectors and runs them. Each collector
// is guarded so one failing collector can never blank the whole page — a
// rejected or throwing collector is simply dropped from the results.

import { collectAudio } from './audio.js';
import { collectCanvas } from './canvas.js';
import { collectFonts } from './fonts.js';
import { collectHardware } from './hardware.js';
import { collectLocale } from './locale.js';
import { collectScreen } from './screen.js';
import { collectTimezone } from './timezone.js';
import { collectWebgl } from './webgl.js';

// Order controls the sequence blips ping onto the radar scope.
export const DEFAULT_COLLECTORS = [
  collectTimezone,
  collectLocale,
  collectScreen,
  collectHardware,
  collectFonts,
  collectWebgl,
  collectCanvas,
  collectAudio,
];

// Canonical list of signal ids the app ships with — used to assert reference
// and explanation coverage without instantiating browser APIs.
export const SIGNAL_IDS = [
  'timezone',
  'locale',
  'screen',
  'hardware',
  'fonts',
  'webgl',
  'canvas',
  'audio',
];

export async function collectAll(collectors = DEFAULT_COLLECTORS) {
  // Wrap in an async thunk so a synchronous throw becomes a rejection that
  // allSettled can isolate, not an error that aborts the whole map.
  const settled = await Promise.allSettled(collectors.map(async (collect) => collect()));
  return settled
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value);
}
