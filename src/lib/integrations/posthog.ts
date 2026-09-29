import type { PostHog } from 'posthog-js';

export const ANALYTICS_CONSENT_KEY = 'kalaris-analytics-consent';
export type AnalyticsConsent = 'allow' | 'deny';

// posthog-js is fetched only after consent, so visitors who decline (or never
// answer) never download it.
let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
// Fallback when storage is blocked, so a choice still holds for this page.
let memoryConsent: AnalyticsConsent | null = null;

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === 'allow' || value === 'deny' ? value : memoryConsent;
  } catch {
    // Storage can be blocked (private mode, strict privacy settings).
    return memoryConsent;
  }
}

export function initializePostHog(): Promise<PostHog | null> {
  if (client) return Promise.resolve(client);
  if (typeof window === 'undefined' || getAnalyticsConsent() !== 'allow') {
    return Promise.resolve(null);
  }

  const token = import.meta.env.PUBLIC_POSTHOG_TOKEN;
  if (!token) {
    if (import.meta.env.DEV) {
      console.warn(
        'PUBLIC_POSTHOG_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_TOKEN is configured',
      );
    }
    return Promise.resolve(null);
  }

  loading ??= import('posthog-js')
    .then(({ default: posthog }) => {
      // Consent may have been withdrawn while the library downloaded.
      if (getAnalyticsConsent() !== 'allow') return null;

      posthog.init(token, {
        api_host:
          import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '[data-private]',
        },
        loaded: (instance) => {
          instance.opt_in_capturing();
          if (import.meta.env.DEV) instance.debug();
        },
      });
      client = posthog;
      return posthog;
    })
    .catch(() => null)
    .finally(() => {
      loading = null;
    });

  return loading;
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  if (typeof window === 'undefined') return;
  memoryConsent = consent;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // Without storage the choice lasts for this page view only.
  }

  if (consent === 'allow') {
    if (client) client.opt_in_capturing();
    else void initializePostHog();
    return;
  }

  if (client) {
    client.opt_out_capturing();
    client.reset();
  }
}

export function trackEvent(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (getAnalyticsConsent() !== 'allow') return;
  if (client) {
    client.capture(name, properties);
    return;
  }
  // Still loading: send once the library is ready, if consent still holds.
  void loading?.then((instance) => {
    if (instance && getAnalyticsConsent() === 'allow') {
      instance.capture(name, properties);
    }
  });
}
