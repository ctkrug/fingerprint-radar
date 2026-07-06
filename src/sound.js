// Synthesized sonar "ping" for each blip, plus a mute toggle whose state
// persists in localStorage. No audio files — a single oscillator + gain
// envelope per ping. The AudioContext is created lazily on first use (autoplay
// policy) and every browser access is guarded so headless envs never throw.

const STORAGE_KEY = 'fpr:muted';

export function readMuted(storage) {
  try {
    return storage?.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeMuted(storage, muted) {
  try {
    storage?.setItem(STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // Storage unavailable (private mode, etc.) — mute still works in-session.
  }
}

export function createSounder(options = {}) {
  const {
    AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext,
    storage = globalThis.localStorage,
  } = options;

  let muted = readMuted(storage);
  let ctx = null;

  function ensureContext() {
    if (ctx || typeof AudioCtx !== 'function') return ctx;
    try {
      ctx = new AudioCtx();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  // A short descending blip; `pitch` in Hz shifts by signal so the sequence
  // reads as a scan rather than a metronome.
  function ping(pitch = 660) {
    if (muted) return;
    const audio = ensureContext();
    if (!audio) return;
    try {
      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore transient audio failures — sound is non-essential.
    }
  }

  function isMuted() {
    return muted;
  }

  function setMuted(next) {
    muted = Boolean(next);
    writeMuted(storage, muted);
    return muted;
  }

  function toggle() {
    return setMuted(!muted);
  }

  return { ping, isMuted, setMuted, toggle };
}
