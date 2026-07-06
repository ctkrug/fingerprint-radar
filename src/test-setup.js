// Shared test setup. In jsdom there is no real canvas, and calling getContext
// throws a noisy "not implemented" error that the collectors already catch. Make
// it return null instead — the exact behavior of a canvas-less browser — so the
// collectors take their guarded fallback path without flooding the test log.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}
