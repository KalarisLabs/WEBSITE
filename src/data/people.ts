import { SITE } from '../lib/seo/site';

export type PersonGroup = 'founder' | 'team';

export interface PersonSocial {
  label: string;
  href: string;
}

export interface Person {
  slug: string;
  name: string;
  role: string;
  /** Longer role line shown beside article bylines. Defaults to `role`. */
  byline?: string;
  group: PersonGroup;
  /** Public portrait path. Without one, pages render an initials placeholder. */
  image?: string;
  summary: string;
  /** Paragraphs for the profile page. Empty until the person supplies a bio. */
  bio: readonly string[];
  focus: readonly string[];
  socials: readonly PersonSocial[];
}

const PENDING_SUMMARY = 'Member of the Kalaris Labs team.';

export const people: readonly Person[] = [
  {
    slug: 'sayan-chowdhury',
    name: 'Sayan Chowdhury',
    role: 'Founder',
    byline: 'Founder & Research Lead',
    group: 'founder',
    image: '/founders/sayan-chowdhury.jpg',
    summary:
      'Agentic researcher and builder focused on systems architecture, agent infrastructure, and the economic layer of agentic systems.',
    bio: [
      'Agentic researcher and builder focused on systems architecture, agent infrastructure, and the economic layer of agentic systems.',
      'He describes himself as an ADHD builder and entrepreneur at heart: architecture before wrappers.',
    ],
    focus: ['Agent infrastructure', 'Systems architecture', 'Agent economics'],
    socials: [
      { label: 'LinkedIn', href: SITE.founderLinkedin },
      { label: 'X', href: SITE.founderX },
    ],
  },
  {
    slug: 'aryan-kumar-jha',
    name: 'Aryan Kumar Jha',
    role: 'Team',
    group: 'team',
    image: '/team/aryan-kumar-jha.jpg',
    summary: PENDING_SUMMARY,
    bio: [],
    focus: [],
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/aryan-jha-amend/',
      },
    ],
  },
  {
    slug: 'adyan-rehman',
    name: 'Adyan Rehman',
    role: 'Team',
    group: 'team',
    image: '/team/adyan-rehman.jpg',
    summary: PENDING_SUMMARY,
    bio: [],
    focus: [],
    socials: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/adyanrehman/' },
    ],
  },
  {
    slug: 'yashvardhan-singh',
    name: 'Yashvardhan Singh',
    role: 'Team',
    group: 'team',
    image: '/team/yashvardhan-singh.jpg',
    summary: PENDING_SUMMARY,
    bio: [],
    focus: [],
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/yashvardhan-singh-795b73335/',
      },
    ],
  },
  {
    slug: 'srihari-murlikrishnan',
    name: 'Srihari Murlikrishnan',
    role: 'Team',
    group: 'team',
    image: '/team/srihari-murlikrishnan.jpg',
    summary: PENDING_SUMMARY,
    bio: [],
    focus: [],
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/sriharithebest/',
      },
    ],
  },
  {
    slug: 'ranvir-srivastava',
    name: 'Ranvir Srivastava',
    role: 'Team',
    group: 'team',
    image: '/team/ranvir-srivastava.jpg',
    summary: PENDING_SUMMARY,
    bio: [],
    focus: [],
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/ranvirsrivastava/',
      },
    ],
  },
  {
    slug: 'jazlyn-talwar',
    name: 'Jazlyn Talwar',
    role: 'Team',
    group: 'team',
    image: '/team/jazlyn-talwar.jpg',
    summary: PENDING_SUMMARY,
    bio: [],
    focus: [],
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/jazlyn-talwar-5b4855367/',
      },
    ],
  },
];

export function getPerson(slug: string) {
  return people.find((person) => person.slug === slug);
}

/**
 * Profiles without a bio are placeholder pages; they stay out of search
 * indexes and the sitemap until the person supplies one.
 */
export function isIndexableProfile(person: Pick<Person, 'bio'>) {
  return person.bio.length > 0;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join('');
}
