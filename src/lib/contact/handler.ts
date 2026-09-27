import {
  MAX_CONTACT_BODY_BYTES,
  contactRequestSchema,
  type ContactResponse,
  type EmailAdapter,
  type TurnstileAdapter,
} from './types';

interface ContactDependencies {
  turnstile: TurnstileAdapter;
  email: EmailAdapter;
}

function json(body: ContactResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

async function readBoundedBody(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_CONTACT_BODY_BYTES) throw new RangeError('payload');
  if (!request.body) return '';

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_CONTACT_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError('payload');
    }
    body += decoder.decode(value, { stream: true });
  }
  return body + decoder.decode();
}

async function idempotencyKey(email: string, message: string) {
  const bytes = new TextEncoder().encode(`${email.toLowerCase()}\n${message}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `contact/${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export async function handleContactRequest(
  request: Request,
  getDependencies: () => ContactDependencies,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { allow: 'POST' } });
  }

  let rawBody: string;
  try {
    rawBody = await readBoundedBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return json(
        {
          ok: false,
          code: 'PAYLOAD_TOO_LARGE',
          message: 'The request is too large.',
        },
        413,
      );
    }
    return json(
      {
        ok: false,
        code: 'INVALID_REQUEST',
        message: 'The request could not be read.',
      },
      400,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json(
      {
        ok: false,
        code: 'INVALID_REQUEST',
        message: 'Enter valid contact details.',
      },
      400,
    );
  }

  const result = contactRequestSchema.safeParse(parsed);
  if (!result.success) {
    return json(
      {
        ok: false,
        code: 'INVALID_REQUEST',
        message: 'Enter valid contact details.',
      },
      400,
    );
  }

  const remoteIp = request.headers.get('cf-connecting-ip') ?? undefined;
  try {
    const dependencies = getDependencies();
    if (
      !(await dependencies.turnstile.verify(
        result.data.turnstileToken,
        remoteIp,
      ))
    ) {
      return json(
        {
          ok: false,
          code: 'CHALLENGE_FAILED',
          message: 'Please retry the security check.',
        },
        403,
      );
    }

    const status = await dependencies.email.send(
      result.data,
      await idempotencyKey(result.data.email, result.data.message),
    );
    if (status === 'throttled') {
      return json(
        {
          ok: false,
          code: 'THROTTLED',
          message: 'Please wait before trying again.',
        },
        429,
      );
    }
    return json({ ok: true }, 200);
  } catch {
    return json(
      {
        ok: false,
        code: 'TEMPORARY_FAILURE',
        message: 'We could not send your message. Please try again shortly.',
      },
      503,
    );
  }
}
