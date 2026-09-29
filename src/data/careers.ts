import { SITE } from '../lib/seo/site';

export interface Posting {
  id: string;
  title: string;
  type: string;
  location: string;
  summary: string;
}

// Add a role here and it appears on /careers with its own apply button.
export const POSTINGS: Posting[] = [
  {
    id: 'open-application',
    title: 'Open application',
    type: 'Any discipline',
    location: 'India / Remote',
    summary:
      'No roles are listed right now. If you investigate problems without waiting for permission and share what you learn, tell us what you have built and why scientific infrastructure matters to you.',
  },
];

/** One-click apply: opens the visitor's mail client addressed to the team. */
export function applyHref(posting: Posting) {
  const subject = `Application: ${posting.title}`;
  const body = [
    `Role: ${posting.title}`,
    '',
    'Name:',
    'Links (GitHub, portfolio, papers):',
    '',
    'What I have built or investigated:',
    '',
  ].join('\n');
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
