import posthog from 'posthog-js';

const POSTHOG_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_POSTHOG_KEY) ||
  'phc_BaUCoMX79564auphbhPunCevdRfmVCzVRqk6Tdjz69kq';

const POSTHOG_HOST =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_POSTHOG_HOST) ||
  'https://us.i.posthog.com';

let isInitialized = false;

/**
 * Initializes PostHog with all web services:
 * - Product Analytics & Autocapture
 * - Session Replay (with privacy masking)
 * - Error Tracking & Exception Capture
 * - Web Vitals & Performance Monitoring
 * - Console Log Recording
 */
export function initPostHog(): void {
  if (typeof window === 'undefined' || isInitialized || !POSTHOG_KEY) {
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      // Pageview & Pageleave tracking
      capture_pageview: true,
      capture_pageleave: true,
      respect_dnt: true,
      // Full autocapture of clicks, inputs, and form submissions
      autocapture: true,
      // Web Vitals & Performance Metrics
      capture_performance: true,
      // Automatic Error Tracking & Exception Capture
      capture_exceptions: true,
      // Session Replay with privacy masking
      disable_session_recording: false,
      enable_recording_console_log: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
      persistence: 'localStorage+cookie',
      loaded: (ph) => {
        // Expose to window for debugging or inline handlers
        if (typeof window !== 'undefined') {
          (window as unknown as { posthog: unknown }).posthog = ph;
        }
      },
    });

    // Support Astro client router transitions if active
    if (typeof document !== 'undefined') {
      document.addEventListener('astro:page-load', () => {
        try {
          posthog.capture('$pageview');
        } catch {
          // ignore navigation capture error
        }
      });
    }

    isInitialized = true;
  } catch (err) {
    console.warn('[PostHog] Initialization skipped:', err);
  }
}

/**
 * Tracks a custom event in PostHog
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    try {
      posthog.capture(eventName, properties);
    } catch {
      // Graceful fallback
    }
  }
}

/**
 * Tracks user interactions (CTA clicks, link clicks, modals)
 */
export function trackAction(
  action: string,
  category = 'interaction',
  label?: string,
  properties?: Record<string, unknown>
): void {
  trackEvent('user_action', {
    action,
    category,
    label,
    timestamp: new Date().toISOString(),
    ...properties,
  });
}

/**
 * Identifies a user with PostHog
 */
export function identifyUser(distinctId: string, userProperties?: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    try {
      posthog.identify(distinctId, userProperties);
    } catch {
      // Graceful fallback
    }
  }
}

/**
 * Resets user session identity (e.g. on logout)
 */
export function resetUser(): void {
  if (typeof window !== 'undefined') {
    try {
      posthog.reset();
    } catch {
      // Graceful fallback
    }
  }
}

/**
 * Captures an error or exception manually in PostHog
 */
export function captureError(error: unknown, additionalProperties?: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    try {
      posthog.captureException(error, additionalProperties);
    } catch {
      // Graceful fallback
    }
  }
}

/**
 * Checks if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window !== 'undefined') {
    try {
      return Boolean(posthog.isFeatureEnabled(flagKey));
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Registers a callback when feature flags are evaluated
 */
export function onFeatureFlags(callback: () => void): void {
  if (typeof window !== 'undefined') {
    try {
      posthog.onFeatureFlags(callback);
    } catch {
      // Graceful fallback
    }
  }
}

export { posthog };
