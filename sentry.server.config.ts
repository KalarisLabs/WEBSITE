import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: process.env.APP_ENV ?? import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
