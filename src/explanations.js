// Plain-English explanation for every signal id: what it measures and why it
// helps identify you. Keep each entry concrete and jargon-light — this is the
// "explain, don't just measure" half of the product. A unit test asserts full
// coverage across registered ids with no blank fallback.

export const EXPLANATIONS = {
  canvas:
    'Sites can ask your browser to draw text and shapes onto a hidden canvas, then read back the pixels. Tiny differences in your GPU, drivers, and font rendering make that image subtly unique to your machine.',
  audio:
    'Processing a silent audio waveform through your browser reveals small numerical differences in how your audio stack does the math — a stable fingerprint that varies by device and OS.',
  webgl:
    'WebGL exposes the name of your graphics hardware and driver (the "unmasked renderer"). Combined with rendering quirks, it clusters you with others who own the same GPU.',
  fonts:
    'By measuring the exact width of text, a site can detect which fonts you have installed. Your particular set of fonts — shaped by your OS, apps, and language packs — narrows down who you are.',
  timezone:
    'Your timezone reveals roughly where in the world you are. It only splits the population into a few dozen groups, but every bit of location narrows the field.',
  locale:
    'Your preferred language and regional formatting (dates, numbers) hint at where you are and what you speak. Common languages reveal little; unusual ones stand out.',
  screen:
    'Your screen resolution, color depth, and pixel density describe your display. A handful of common sizes dominate, so anything unusual is quite identifying.',
  hardware:
    'Your CPU core count, device memory, platform, and touch support sketch out what kind of machine you have. Together these coarse numbers still cut the crowd down noticeably.',
};

export function explanationFor(id) {
  return EXPLANATIONS[id] ?? null;
}
