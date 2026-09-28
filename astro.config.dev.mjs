import { defineConfig } from 'astro/config';
import workerConfig from './astro.config.mjs';

// Astro's Cloudflare adapter intercepts public assets during `astro dev` on
// Windows. Development uses Astro's native server; builds and previews keep
// the production Cloudflare Workers configuration from astro.config.mjs.
export default defineConfig({
  ...workerConfig,
  output: 'static',
  adapter: undefined,
});
