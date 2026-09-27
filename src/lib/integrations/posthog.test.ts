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
  it('does not initialize before opt-in', async () => {
    const { analytics, client } = await setup();
    expect(analytics.getAnalyticsConsent()).toBeNull();
    expect(analytics.initializePostHog()).toBe(false);
    expect(client.init).not.toHaveBeenCalled();
  });

  it('opts out on withdrawal and can opt in again', async () => {
    const { analytics, client } = await setup();
    analytics.setAnalyticsConsent('allow');
    expect(client.init).toHaveBeenCalledOnce();

    analytics.setAnalyticsConsent('deny');
    expect(client.opt_out_capturing).toHaveBeenCalledOnce();
    expect(client.reset).toHaveBeenCalledOnce();

    analytics.setAnalyticsConsent('allow');
    expect(client.opt_in_capturing).toHaveBeenCalledTimes(2);
  });
});
