export const FELLOW_NAME_STORAGE_KEY = 'kalaris-fellowship-name';
export const FELLOW_HATS_STORAGE_KEY = 'kalaris-fellowship-hats';
export const FELLOW_APPLIED_STORAGE_KEY = 'kalaris-fellowship-applied';
export const FELLOW_NAME_MIN_LENGTH = 2;
export const FELLOW_NAME_MAX_LENGTH = 48;

/** Typeform application; PUBLIC_FELLOWSHIP_APPLICATION_URL overrides it. */
export const FELLOWSHIP_APPLICATION_URL =
  'https://form.typeform.com/to/Wty2XU7s';

/** Public page that shared links point to; it unfurls with the poster. */
export const FELLOWSHIP_PAGE_URL = 'https://kalarislabs.com/fellowship';

/** What we look for in every fellow, shown in the folder on /fellowship. */
export const FELLOW_TRAITS = [
  {
    title: 'High agency',
    body: 'You start things without waiting to be asked.',
  },
  {
    title: 'Many hats',
    body: 'You move between design, growth, and marketing as the work needs.',
  },
  {
    title: 'Responsibility',
    body: 'You own the outcome, including the parts that go wrong.',
  },
  {
    title: 'First principles',
    body: 'You reason from what is true, not from what is usual.',
  },
] as const;

/** The hats a fellow can wear. Order is the order they print on the badge. */
export const FELLOW_HATS = [
  { id: 'design', label: 'Design' },
  { id: 'growth', label: 'Growth' },
  { id: 'marketing', label: 'Marketing' },
] as const;

export type FellowHat = (typeof FELLOW_HATS)[number]['id'];

/** Keeps known hats only, in badge order, without duplicates. */
export function normalizeHats(input: readonly string[]): FellowHat[] {
  return FELLOW_HATS.map((hat) => hat.id).filter((id) => input.includes(id));
}

export function hatLabels(hats: readonly FellowHat[]): string[] {
  return FELLOW_HATS.filter((hat) => hats.includes(hat.id)).map(
    (hat) => hat.label,
  );
}

const FALLBACK_APPLICATION_EMAIL = 'hello@kalarislabs.com';
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

export type FellowNameResult =
  { ok: true; name: string } | { ok: false; error: string };

/** Trims and collapses internal whitespace so the badge renders cleanly. */
export function normalizeFellowName(input: string): string {
  return input.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function validateFellowName(input: string): FellowNameResult {
  const name = normalizeFellowName(input);

  if (name.length < FELLOW_NAME_MIN_LENGTH) {
    return { ok: false, error: 'Please enter your name.' };
  }
  if (name.length > FELLOW_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Please keep it under ${FELLOW_NAME_MAX_LENGTH} characters.`,
    };
  }
  if (!NAME_PATTERN.test(name)) {
    return {
      ok: false,
      error: 'Use letters, spaces, hyphens, apostrophes, or periods.',
    };
  }
  return { ok: true, name };
}

/**
 * Builds the application link for a fellow. HTTP(S) form links receive the
 * name as a `name` query parameter so form tools (Tally, Typeform, Google
 * Forms prefill, etc.) can prefill it. Without a configured URL the applicant
 * falls back to an email application.
 */
export function buildApplicationUrl(
  name: string,
  configuredUrl: string | undefined,
  hats: readonly FellowHat[] = [],
): string {
  const base = configuredUrl?.trim();

  if (base) {
    try {
      const url = new URL(base);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        if (name) url.searchParams.set('name', name);
        if (hats.length > 0) url.searchParams.set('hats', hats.join(','));
        return url.toString();
      }
    } catch {
      // Invalid configuration falls through to the email application.
    }
  }

  const subject = encodeURIComponent(`Kalaris Fellowship application: ${name}`);
  return `mailto:${FALLBACK_APPLICATION_EMAIL}?subject=${subject}`;
}

/**
 * Splits a name into at most `maxLines` lines, balancing word lengths so
 * long names wrap on the badge instead of overflowing.
 */
export function splitNameLines(name: string, maxLines = 3): string[] {
  const words = normalizeFellowName(name).split(' ').filter(Boolean);
  if (words.length <= maxLines) return words;

  const lines: string[] = [];
  const perLine = Math.ceil(words.length / maxLines);
  for (let i = 0; i < words.length; i += perLine) {
    lines.push(words.slice(i, i + perLine).join(' '));
  }
  return lines;
}

export interface ShareLinks {
  x: string;
  linkedin: string;
  whatsapp: string;
}

/**
 * Share copy for the fellowship. It only says someone applied once they have
 * opened the application; before that it invites others instead.
 */
export function buildShareText(applied: boolean): string {
  return applied
    ? 'I just applied to the Kalaris Labs Fellowship. If you wear more than one hat, you should too.'
    : 'The Kalaris Labs Fellowship is open to designers, growth marketers, and marketers who wear more than one hat.';
}

export function buildShareLinks(
  text: string,
  pageUrl: string = FELLOWSHIP_PAGE_URL,
): ShareLinks {
  const x = new URL('https://x.com/intent/post');
  x.searchParams.set('text', text);
  x.searchParams.set('url', pageUrl);

  // LinkedIn reads the title, description, and image from the page itself.
  const linkedin = new URL('https://www.linkedin.com/sharing/share-offsite/');
  linkedin.searchParams.set('url', pageUrl);

  const whatsapp = new URL('https://wa.me/');
  whatsapp.searchParams.set('text', `${text} ${pageUrl}`);

  return {
    x: x.toString(),
    linkedin: linkedin.toString(),
    whatsapp: whatsapp.toString(),
  };
}
