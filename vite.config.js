import { defineConfig } from 'vite';

// Relative base so the built site works when served from any subpath
// (e.g. apps.charliekrug.com/fingerprint-radar), not just the domain root.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  test: {
    // Pure-logic tests run in fast Node; only DOM-touching suites opt into
    // jsdom via a `// @vitest-environment jsdom` docblock. Keeps the suite quick.
    environment: 'node',
  },
});
