import { describe, expect, it } from 'vitest';
import {
  buildApplicationUrl,
  buildShareLinks,
  buildShareText,
  hatLabels,
  normalizeFellowName,
  normalizeHats,
  splitNameLines,
  validateFellowName,
} from './fellowship';

describe('normalizeFellowName', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeFellowName('  Ada   \n Lovelace ')).toBe('Ada Lovelace');
  });
});

describe('validateFellowName', () => {
  it('accepts international names with punctuation', () => {
    expect(validateFellowName("Zoë O'Brien-Núñez")).toEqual({
      ok: true,
      name: "Zoë O'Brien-Núñez",
    });
    expect(validateFellowName('সায়ন চৌধুরী').ok).toBe(true);
  });

  it('rejects empty, too long, and symbol-laden names', () => {
    expect(validateFellowName('   ').ok).toBe(false);
    expect(validateFellowName('a'.repeat(49)).ok).toBe(false);
    expect(validateFellowName('<script>').ok).toBe(false);
    expect(validateFellowName('-Ada').ok).toBe(false);
  });
});

describe('buildApplicationUrl', () => {
  it('prefills the name on a configured form URL', () => {
    expect(
      buildApplicationUrl('Ada Lovelace', 'https://tally.so/r/abc?ref=site'),
    ).toBe('https://tally.so/r/abc?ref=site&name=Ada+Lovelace');
  });

  it('prefills the name on the Typeform application', () => {
    expect(
      buildApplicationUrl(
        'Ada Lovelace',
        'https://form.typeform.com/to/Wty2XU7s',
      ),
    ).toBe('https://form.typeform.com/to/Wty2XU7s?name=Ada+Lovelace');
  });

  it('leaves the name out until one is printed', () => {
    expect(
      buildApplicationUrl('', 'https://form.typeform.com/to/Wty2XU7s'),
    ).toBe('https://form.typeform.com/to/Wty2XU7s');
  });

  it('passes chosen hats to the form', () => {
    expect(
      buildApplicationUrl('Ada', 'https://form.typeform.com/to/Wty2XU7s', [
        'design',
        'growth',
      ]),
    ).toBe(
      'https://form.typeform.com/to/Wty2XU7s?name=Ada&hats=design%2Cgrowth',
    );
  });

  it('falls back to an email application when unset or invalid', () => {
    const expected =
      'mailto:hello@kalarislabs.com?subject=Kalaris%20Fellowship%20application%3A%20Ada';
    expect(buildApplicationUrl('Ada', undefined)).toBe(expected);
    expect(buildApplicationUrl('Ada', 'not a url')).toBe(expected);
    expect(buildApplicationUrl('Ada', 'javascript:alert(1)')).toBe(expected);
  });
});

describe('splitNameLines', () => {
  it('keeps short names one word per line', () => {
    expect(splitNameLines('Ada Lovelace')).toEqual(['Ada', 'Lovelace']);
  });

  it('groups long names into at most three lines', () => {
    expect(splitNameLines('A B C D E F G')).toEqual(['A B C', 'D E F', 'G']);
  });
});

describe('hats', () => {
  it('keeps known hats in badge order without duplicates', () => {
    expect(normalizeHats(['marketing', 'design', 'wizard', 'design'])).toEqual([
      'design',
      'marketing',
    ]);
    expect(hatLabels(['growth', 'design'])).toEqual(['Design', 'Growth']);
  });
});

describe('sharing', () => {
  it('only claims an application after one was opened', () => {
    expect(buildShareText(true)).toMatch(/^I just applied/);
    expect(buildShareText(false)).not.toMatch(/applied/);
  });

  it('builds X, LinkedIn, and WhatsApp links to the fellowship page', () => {
    const links = buildShareLinks(
      'Hello',
      'https://kalarislabs.com/fellowship',
    );
    expect(links.x).toBe(
      'https://x.com/intent/post?text=Hello&url=https%3A%2F%2Fkalarislabs.com%2Ffellowship',
    );
    expect(links.linkedin).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fkalarislabs.com%2Ffellowship',
    );
    expect(links.whatsapp).toBe(
      'https://wa.me/?text=Hello+https%3A%2F%2Fkalarislabs.com%2Ffellowship',
    );
  });
});
