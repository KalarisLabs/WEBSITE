import { z } from 'zod';

export const MAX_CONTACT_BODY_BYTES = 16_384;

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().max(254),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(5_000),
  turnstileToken: z.string().min(1).max(2_048),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;

export type ContactErrorCode =
  | 'INVALID_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'CHALLENGE_FAILED'
  | 'THROTTLED'
  | 'TEMPORARY_FAILURE';

export type ContactResponse =
  { ok: true } | { ok: false; code: ContactErrorCode; message: string };

export interface TurnstileAdapter {
  verify(token: string, remoteIp?: string): Promise<boolean>;
}

export interface EmailAdapter {
  send(
    input: ContactRequest,
    idempotencyKey: string,
  ): Promise<'sent' | 'throttled'>;
}
