// Fonts collector. Detects which fonts from a documented probe list are
// installed by measuring rendered text width against generic-family baselines:
// if a probe font changes the width, it is present. Your particular set of
// fonts narrows down who you are. We probe a fixed subset (not full
// enumeration), so entropy is deliberately modest.

export const PROBE_FONTS = [
  'Arial',
  'Verdana',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Garamond',
  'Comic Sans MS',
  'Trebuchet MS',
  'Impact',
  'Tahoma',
  'Calibri',
  'Cambria',
  'Consolas',
  'Menlo',
  'Palatino',
  'Helvetica Neue',
];

const BASELINES = ['monospace', 'serif', 'sans-serif'];
const PROBE_TEXT = 'mmmmmmmmmmlliWWWQ';
const PROBE_SIZE = 72;

// Pure detection given a width-measuring function. `measure(fontStack)` returns
// the rendered width of PROBE_TEXT in that CSS font stack. A font counts as
// present if it shifts the width away from at least one baseline family.
export function detectFonts(measure) {
  const baselineWidths = BASELINES.map((family) => measure(`${PROBE_SIZE}px ${family}`));
  const detected = [];
  for (const font of PROBE_FONTS) {
    const present = BASELINES.some((family, i) => {
      const width = measure(`${PROBE_SIZE}px '${font}', ${family}`);
      return width !== baselineWidths[i];
    });
    if (present) detected.push(font);
  }
  return detected;
}

const UNAVAILABLE = {
  id: 'fonts',
  label: 'Fonts',
  value: 'unavailable',
  bucket: 'unavailable',
};

export function collectFonts({ createCanvas } = {}) {
  try {
    const canvas = createCanvas ? createCanvas() : document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof ctx.measureText !== 'function') return { ...UNAVAILABLE };

    const measure = (fontStack) => {
      ctx.font = fontStack;
      return ctx.measureText(PROBE_TEXT).width;
    };
    const detected = detectFonts(measure);
    return {
      id: 'fonts',
      label: 'Fonts',
      value: `${detected.length} of ${PROBE_FONTS.length} probe fonts detected`,
      bucket: 'measured',
      detail: { detected },
    };
  } catch {
    return { ...UNAVAILABLE };
  }
}
