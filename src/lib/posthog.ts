import posthog from 'posthog-js';

const POSTHOG_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_POSTHOG_KEY : undefined;
const POSTHOG_HOST = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_POSTHOG_HOST) || 'https://us.i.posthog.com';

let isInitialized = false;

export function initPostHog(): void {
  if (typeof window === 'undefined' || isInitialized || !POSTHOG_KEY) {
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      respect_dnt: true,
      autocapture: false,
      persistence: 'localStorage+cookie',
    });
    isInitialized = true;
  } catch (err) {
    console.warn('[PostHog] Initialization skipped:', err);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && (window as unknown as { posthog?: typeof posthog }).posthog) {
    try {
      (window as unknown as { posthog: typeof posthog }).posthog.capture(eventName, properties);
    } catch {
      // Graceful fallback
    }
  }
}
