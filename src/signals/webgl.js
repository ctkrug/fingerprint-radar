// WebGL collector. Reads the unmasked GPU vendor/renderer strings, which
// cluster you with others who own the same graphics hardware. Falls back to
// the standard VENDOR/RENDERER params if the debug extension is unavailable,
// and to the unavailable bucket if there is no WebGL context at all.

const UNAVAILABLE = {
  id: 'webgl',
  label: 'WebGL / GPU',
  value: 'unavailable',
  bucket: 'unavailable',
};

function getContext(canvas) {
  return canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || null;
}

export function collectWebgl({ createCanvas } = {}) {
  try {
    const canvas = createCanvas ? createCanvas() : document.createElement('canvas');
    const gl = getContext(canvas);
    if (!gl) return { ...UNAVAILABLE };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    const value = [vendor, renderer].filter(Boolean).join(' · ') || 'unknown';
    return {
      id: 'webgl',
      label: 'WebGL / GPU',
      value,
      bucket: 'measured',
      detail: { vendor, renderer },
    };
  } catch {
    return { ...UNAVAILABLE };
  }
}
