// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://viknesh.me',
  output: 'static',
  integrations: [react(), sitemap()],
  // Inline each page's CSS into its <head> so first paint doesn't wait on a
  // separate stylesheet fetch (the render-blocking-request / network-tree
  // findings). Trades cross-page CSS caching for faster FCP — worth it on a
  // small portfolio where most visits are one or two pages.
  build: { inlineStylesheets: 'always' },
  vite: {
    // lightningcss (Astro's default prod CSS minifier) drops the standard
    // `backdrop-filter` when `-webkit-backdrop-filter` is also present,
    // which kills the blur in Firefox (it only supports the unprefixed
    // form). esbuild keeps both, so the blur survives the build.
    build: { cssMinify: 'esbuild' },
  },
});