// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    // lightningcss (Astro's default prod CSS minifier) drops the standard
    // `backdrop-filter` when `-webkit-backdrop-filter` is also present,
    // which kills the blur in Firefox (it only supports the unprefixed
    // form). esbuild keeps both, so the blur survives the build.
    build: { cssMinify: 'esbuild' },
  },
});
