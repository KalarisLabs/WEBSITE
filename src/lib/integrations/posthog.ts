import posthog from 'posthog-js';

export const ANALYTICS_CONSENT_KEY = 'kalaris-analytics-consent';
export type AnalyticsConsent = 'allow' | 'deny';

let initialized = false;

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === 'allow' || value === 'deny' ? value : null;
}

export function initializePostHog(): boolean {
  if (
    typeof window === 'undefined' ||
    initialized ||
    getAnalyticsConsent() !== 'allow'
  ) {
    return initialized;
  }

  const token = import.meta.env.PUBLIC_POSTHOG_TOKEN;
  if (!token) return false;

  posthog.init(token, {
    api_host: import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-private]',
    },
    loaded: (client) => {
      client.opt_in_capturing();
      if (import.meta.env.DEV) client.debug();
    },
  });
  initialized = true;
  return true;
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);

  if (consent === 'allow') {
    if (initialized) {
      posthog.opt_in_capturing();
      return;
    }
    initializePostHog();
    return;
  }

  if (initialized) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

export function trackEvent(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (initialized && getAnalyticsConsent() === 'allow') {
    posthog.capture(name, properties);
  }
}
