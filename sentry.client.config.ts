import * as Sentry from '@sentry/astro';

// Error replay records masked session activity, so it is added only after
// analytics consent (see src/lib/integrations/sentry-replay.ts).
Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1,
});
