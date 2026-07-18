// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://viknesh.me',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    // lightningcss (Astro's default prod CSS minifier) drops the standard
    // `backdrop-filter` when `-webkit-backdrop-filter` is also present,
    // which kills the blur in Firefox (it only supports the unprefixed
    // form). esbuild keeps both, so the blur survives the build.
    build: { cssMinify: 'esbuild' },
  },
});