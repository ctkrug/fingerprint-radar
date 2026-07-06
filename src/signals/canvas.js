// Canvas collector. Renders a fixed drawing to an offscreen canvas and hashes
// the pixel data — GPU, driver, and font-rendering differences make the image
// subtly unique. The hash is a pure function so it is deterministic and
// unit-testable without a real canvas.

// FNV-1a over the byte-like input. Stable across calls for identical input.
export function hashPixels(data) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i += 1) {
    hash ^= data[i] & 0xff;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const UNAVAILABLE = {
  id: 'canvas',
  label: 'Canvas render',
  value: 'unavailable',
  bucket: 'unavailable',
};

export function collectCanvas({ createCanvas } = {}) {
  try {
    const canvas = createCanvas ? createCanvas() : document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ...UNAVAILABLE };

    ctx.textBaseline = 'top';
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, 240, 60);
    ctx.fillStyle = '#00e5c7';
    ctx.font = "16px 'Arial'";
    ctx.fillText('Fingerprint Radar ☢ 42', 4, 6);
    ctx.strokeStyle = '#ffb84d';
    ctx.beginPath();
    ctx.arc(205, 30, 16, 0, Math.PI * 2);
    ctx.stroke();

    const { data } = ctx.getImageData(0, 0, 240, 60);
    return {
      id: 'canvas',
      label: 'Canvas render',
      value: hashPixels(data),
      bucket: 'measured',
    };
  } catch {
    return { ...UNAVAILABLE };
  }
}
