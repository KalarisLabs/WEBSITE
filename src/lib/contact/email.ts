import { Resend } from 'resend';
import type { ContactRequest, EmailAdapter } from './types';

export interface EmailConfiguration {
  apiKey: string;
  from: string;
  to: string;
}

function removeHeaderControls(value: string) {
  return Array.from(value, (character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? ' ' : character;
  })
    .join('')
    .trim();
}

export function formatContactEmail(input: ContactRequest): {
  subject: string;
  text: string;
} {
  const safeName = removeHeaderControls(input.name);
  const safeCompany = input.company
    ? removeHeaderControls(input.company)
    : undefined;
  return {
    subject: `Website enquiry from ${safeName}`,
    text: [
      'New Kalaris Labs website enquiry',
      '',
      `Name: ${safeName}`,
      `Email: ${input.email}`,
      `Company: ${safeCompany || 'Not provided'}`,
      '',
      'Message:',
      input.message,
    ].join('\n'),
  };
}

export function createResendAdapter(config: EmailConfiguration): EmailAdapter {
  const resend = new Resend(config.apiKey);
  return {
    async send(input, idempotencyKey) {
      const content = formatContactEmail(input);
      const { error } = await resend.emails.send(
        {
          from: config.from,
          to: [config.to],
          replyTo: input.email,
          subject: content.subject,
          text: content.text,
          tags: [{ name: 'source', value: 'website-contact' }],
        },
        { idempotencyKey },
      );

      if (!error) return 'sent';
      if (error.name === 'rate_limit_exceeded') return 'throttled';
      throw new Error('Email provider rejected the request');
    },
  };
}
