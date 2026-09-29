import { env } from 'cloudflare:workers';
import { getSecret } from 'astro:env/server';
import type { APIRoute } from 'astro';
import { createResendAdapter } from '../../lib/contact/email';
import { handleContactRequest } from '../../lib/contact/handler';
import {
  createTurnstileAdapter,
  turnstileHostnamesFor,
} from '../../lib/contact/turnstile';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return handleContactRequest(request, () => {
    const resendApiKey = getSecret('RESEND_API_KEY');
    const turnstileSecretKey = getSecret('TURNSTILE_SECRET_KEY');
    if (!resendApiKey || !turnstileSecretKey) {
      throw new Error('Contact service secrets are not configured');
    }

    return {
      turnstile: createTurnstileAdapter(
        turnstileSecretKey,
        turnstileHostnamesFor(env.APP_ENV, new URL(request.url).hostname),
      ),
      email: createResendAdapter({
        apiKey: resendApiKey,
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
      }),
    };
  });
};
