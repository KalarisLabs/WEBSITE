import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL ?? 'https://kalarislabs.com';

export default defineConfig({
  site,
  output: 'server',
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        default: site,
      }),
      PUBLIC_DOCS_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://docs.kalarislabs.com',
      }),
      PUBLIC_POSTHOG_TOKEN: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_POSTHOG_HOST: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://us.i.posthog.com',
      }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_SENTRY_DSN: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      RESEND_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
  adapter: cloudflare({
    imageService: 'passthrough',
    prerenderEnvironment: 'node',
  }),
  session: false,
  integrations: [
    react(),
    mdx(),
    sitemap(),
    sentry({
      org: process.env.SENTRY_ORG ?? 'kalaris-labs',
      project: process.env.SENTRY_PROJECT ?? 'kalaris-labs-website',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
    }),
  ],
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
    build: { sourcemap: true },
  },
});
