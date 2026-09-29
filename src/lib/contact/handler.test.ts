import { describe, expect, it, vi } from 'vitest';
import { formatContactEmail } from './email';
import { handleContactRequest } from './handler';
import {
  MAX_CONTACT_BODY_BYTES,
  type ContactRequest,
  type EmailAdapter,
  type TurnstileAdapter,
} from './types';

const validRequest: ContactRequest = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  message: 'I would like to discuss an engineering project.',
  turnstileToken: 'verified-token',
};

function request(
  body: unknown,
  origin: string | null = 'https://kalarislabs.com',
) {
  return new Request('https://kalarislabs.com/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.10',
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

function dependencies(overrides?: {
  verified?: boolean;
  email?: EmailAdapter;
}) {
  const turnstile: TurnstileAdapter = {
    verify: vi.fn().mockResolvedValue(overrides?.verified ?? true),
  };
  const email: EmailAdapter = overrides?.email ?? {
    send: vi.fn().mockResolvedValue('sent'),
  };
  return { turnstile, email };
}

describe('contact endpoint handler', () => {
  it.each([
    ['a foreign origin', 'https://attacker.example'],
    ['a missing origin', null],
  ])('rejects %s before provider work', async (_label, origin) => {
    const getDependencies = vi.fn(() => dependencies());
    const response = await handleContactRequest(
      request(validRequest, origin),
      getDependencies,
    );
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: 'FORBIDDEN_ORIGIN',
    });
    expect(getDependencies).not.toHaveBeenCalled();
  });

  it('rejects malformed input', async () => {
    const getDependencies = vi.fn(() => dependencies());
    const response = await handleContactRequest(
      request({ email: 'not-an-email' }),
      getDependencies,
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'INVALID_REQUEST',
    });
    expect(getDependencies).not.toHaveBeenCalled();
  });

  it('rejects an oversized request before provider work', async () => {
    const deps = dependencies();
    const response = await handleContactRequest(
      request({ ...validRequest, message: 'x'.repeat(MAX_CONTACT_BODY_BYTES) }),
      () => deps,
    );
    expect(response.status).toBe(413);
    expect(deps.turnstile.verify).not.toHaveBeenCalled();
  });

  it('returns a stable challenge error', async () => {
    const response = await handleContactRequest(request(validRequest), () =>
      dependencies({ verified: false }),
    );
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'CHALLENGE_FAILED',
    });
  });

  it('awaits a successful delivery', async () => {
    const send = vi.fn().mockResolvedValue('sent');
    const response = await handleContactRequest(request(validRequest), () =>
      dependencies({ email: { send } }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(send).toHaveBeenCalledOnce();
  });

  it('hides Resend failures behind a temporary error', async () => {
    const email: EmailAdapter = {
      send: vi.fn().mockRejectedValue(new Error('provider internals')),
    };
    const response = await handleContactRequest(request(validRequest), () =>
      dependencies({ email }),
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'TEMPORARY_FAILURE',
    });
  });

  it('uses plain text and strips header control characters', () => {
    const message = '<script>alert("no html")</script>';
    const formatted = formatContactEmail({
      ...validRequest,
      name: 'Ada\r\nBcc: attacker@example.com',
      message,
    });
    expect(formatted.subject).not.toMatch(/[\r\n]/);
    expect(formatted.text).toContain(message);
  });

  it('uses the same idempotency key for repeated submissions', async () => {
    const send = vi.fn().mockResolvedValue('sent');
    const deps = dependencies({ email: { send } });
    await handleContactRequest(request(validRequest), () => deps);
    await handleContactRequest(request(validRequest), () => deps);
    expect(send.mock.calls[0]?.[1]).toBe(send.mock.calls[1]?.[1]);
  });

  it('returns a stable throttling error', async () => {
    const email: EmailAdapter = {
      send: vi.fn().mockResolvedValue('throttled'),
    };
    const response = await handleContactRequest(request(validRequest), () =>
      dependencies({ email }),
    );
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'THROTTLED',
    });
  });
});
