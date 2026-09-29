import { afterEach, describe, expect, it, vi } from 'vitest';

function localStorageStub() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size;
    },
  } satisfies Storage;
}

async function setup() {
  vi.resetModules();
  vi.stubEnv('PUBLIC_POSTHOG_TOKEN', 'phc_test');
  vi.stubGlobal('window', { localStorage: localStorageStub() });

  const client = {
    init: vi.fn(
      (
        _token: string,
        options: { loaded?: (value: typeof client) => void },
      ) => {
        options.loaded?.(client);
      },
    ),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    reset: vi.fn(),
    capture: vi.fn(),
    debug: vi.fn(),
  };
  vi.doMock('posthog-js', () => ({ default: client }));
  const analytics = await import('./posthog');
  return { analytics, client };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.doUnmock('posthog-js');
});

describe('PostHog consent', () => {
  it('does not load or initialize before opt-in', async () => {
    const { analytics, client } = await setup();
    expect(analytics.getAnalyticsConsent()).toBeNull();
    await expect(analytics.initializePostHog()).resolves.toBeNull();
    expect(client.init).not.toHaveBeenCalled();
  });

  it('opts out on withdrawal and can opt in again', async () => {
    const { analytics, client } = await setup();
    analytics.setAnalyticsConsent('allow');
    await analytics.initializePostHog();
    expect(client.init).toHaveBeenCalledOnce();

    analytics.setAnalyticsConsent('deny');
    expect(client.opt_out_capturing).toHaveBeenCalledOnce();
    expect(client.reset).toHaveBeenCalledOnce();

    analytics.setAnalyticsConsent('allow');
    expect(client.opt_in_capturing).toHaveBeenCalledTimes(2);
  });

  it('sends events tracked while the library is still loading', async () => {
    const { analytics, client } = await setup();
    analytics.setAnalyticsConsent('allow');
    analytics.trackEvent('analytics consent granted');
    expect(client.capture).not.toHaveBeenCalled();

    await analytics.initializePostHog();
    await Promise.resolve();
    expect(client.capture).toHaveBeenCalledWith(
      'analytics consent granted',
      undefined,
    );
  });

  it('skips initialization when consent is withdrawn mid-load', async () => {
    const { analytics, client } = await setup();
    analytics.setAnalyticsConsent('allow');
    analytics.setAnalyticsConsent('deny');
    await vi.dynamicImportSettled();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(client.init).not.toHaveBeenCalled();
    expect(client.capture).not.toHaveBeenCalled();
  });

  it('keeps working when storage is blocked', async () => {
    const { analytics, client } = await setup();
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    vi.stubGlobal('window', {
      localStorage: { getItem: blocked, setItem: blocked },
    });

    expect(analytics.getAnalyticsConsent()).toBeNull();
    analytics.setAnalyticsConsent('allow');
    expect(analytics.getAnalyticsConsent()).toBe('allow');
    await analytics.initializePostHog();
    expect(client.init).toHaveBeenCalledOnce();
  });
});
