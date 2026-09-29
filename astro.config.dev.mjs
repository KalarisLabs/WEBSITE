import { defineConfig } from 'astro/config';
import workerConfig from './astro.config.mjs';

// Astro's Cloudflare adapter intercepts public assets during `astro dev` on
// Windows. Development uses Astro's native server; builds and previews keep
// the production Cloudflare Workers configuration from astro.config.mjs.
export default defineConfig({
  ...workerConfig,
  output: 'static',
  adapter: undefined,
  vite: {
    ...workerConfig.vite,
    optimizeDeps: {
      // The fellowship badge is lazy-loaded, so Vite would only discover its
      // dependencies after startup and serve them as "Outdated Optimize Dep"
      // (504), which stops the island hydrating. Pre-bundle them up front.
      include: [
        'lucide-react',
        'gsap',
        'gsap/ScrollTrigger',
        'gsap/SplitText',
        '@gsap/react',
        'motion/react',
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/rapier',
        'meshline',
      ],
    },
  },
});
