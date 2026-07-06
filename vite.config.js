import { defineConfig } from 'vite';

// Relative base so the built site works when served from any subpath
// (e.g. apps.charliekrug.com/fingerprint-radar), not just the domain root.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
});
