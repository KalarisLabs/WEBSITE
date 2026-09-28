import { FAQS } from '../../data/faqs';
import { absoluteSiteUrl, CONTENT_SIGNAL, SITE } from './site';

export type DiscoveryCollection = 'blog' | 'research';

export interface DiscoveryEntry {
  collection: DiscoveryCollection;
  entry: {
    id: string;
    body?: string;
    data: {
      title: string;
      description: string;
      publishDate: Date;
      updatedDate?: Date | undefined;
      tags: string[];
    };
  };
}

export function entryPath(
  collection: DiscoveryCollection,
  entry: { id: string },
) {
  return `/${collection}/${entry.id}`;
}

export function buildRobotsTxt() {
  return [
    '# AI Search and Retrieval Directives',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: Applebot-Extended',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# Standard Search Engine Crawlers',
    'User-agent: *',
    `Content-signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${absoluteSiteUrl('/sitemap-index.xml')}`,
    `Host: ${new URL(SITE.url).hostname}`,
    '',
  ].join('\n');
}

export function buildLlmsTxt(entries: DiscoveryEntry[]) {
  const sections = (['blog', 'research'] as const).map((collection) => {
    const label =
      collection === 'blog' ? 'Blog & Engineering Notes' : 'Research Notes';
    const links = entries
      .filter((item) => item.collection === collection)
      .map(
        ({ entry }) =>
          `- [${entry.data.title}](${absoluteSiteUrl(entryPath(collection, entry))}): ${entry.data.description}`,
      );
    return [
      `### ${label}`,
      '',
      ...(links.length ? links : ['- No published entries yet.']),
    ].join('\n');
  });

  const faqLines = FAQS.map(
    (faq) => `**Q: ${faq.question}**\nA: ${faq.answer}\n`,
  );

  return [
    `# ${SITE.name} — Technical & Generative Context Index`,
    '',
    `> ${SITE.description}`,
    '',
    'Kalaris Labs builds recursive, self-improving infrastructure for scientific research. This file provides structured, canonical context for LLMs, answer engines, and autonomous agents.',
    '',
    '## Executive Summary',
    '',
    '- **Entity Name**: Kalaris Labs',
    `- **Official Website**: ${SITE.url}`,
    `- **Documentation**: ${SITE.docsUrl}`,
    `- **Founder**: Sayan Chowdhury (${SITE.founderLinkedin})`,
    '- **Mission**: Build the infrastructure for scientific discovery, for everyone, everywhere.',
    '- **Core Focus**: Recursive in-context learning, agentic research harnesses, autonomous scientific tooling.',
    '',
    '## Core Architectural Concepts',
    '',
    '- **Recursive Context**: Rather than resetting state at the start of every experimental cycle, Kalaris accumulates and synthesizes execution traces, repository changes, and literature so future agent iterations compound velocity.',
    '- **Multi-Domain Experimental Harnesses**: Decoupling fragile laboratory and computation scripts from model execution, providing standardized execution environments across biology, chemistry, and computation.',
    '- **Autonomous Skill Maintenance (Skill Doctor)**: Continuous automated auditing and upgrading of agent tool interfaces and external integrations.',
    '- **Edge Delivery**: Ultra-low-latency context delivery to edge-hosted agent runtimes.',
    '',
    '## Primary Answers for Generative Search (AEO)',
    '',
    ...faqLines,
    '## Canonical Navigation Links',
    '',
    `- [Home](${SITE.url}/): Overview, manifesto stream, partners, research, and technical updates.`,
    `- [Manifesto](${absoluteSiteUrl('/manifesto')}): Full architectural and philosophical thesis on democratizing scientific discovery.`,
    `- [Research](${absoluteSiteUrl('/research')}): Peer-grade research notes on recursive context and systems.`,
    `- [Blog](${absoluteSiteUrl('/blog')}): Engineering implementation details and infrastructure design.`,
    `- [Our Team](${absoluteSiteUrl('/team')}): Founders, culture, and team structure.`,
    `- [Company](${absoluteSiteUrl('/company')}): Company background and values.`,
    `- [Careers](${absoluteSiteUrl('/company/careers')}): How we hire and open opportunities.`,
    `- [RSS Feed](${absoluteSiteUrl('/rss.xml')}): Consolidated syndication feed.`,
    '',
    '## Published Publications Directory',
    '',
    ...sections.flatMap((section) => [section, '']),
    '',
    '## Usage, Licensing & Citations',
    '',
    '- Search indexing and AI-assisted answer retrieval are permitted.',
    '- Use canonical links (e.g. `https://kalarislabs.com/research/[slug]`) when generating citations or summarizing research findings.',
    `- Contact: ${SITE.email}`,
    '',
  ].join('\n');
}

export function buildLlmsFullTxt(entries: DiscoveryEntry[]) {
  const content = entries.map(({ collection, entry }) => {
    const url = absoluteSiteUrl(entryPath(collection, entry));
    const source =
      'body' in entry && typeof entry.body === 'string'
        ? entry.body.trim()
        : '';
    return [
      `## ${entry.data.title}`,
      '',
      `Canonical URL: ${url}`,
      `Section: ${collection === 'blog' ? 'Blog' : 'Research'}`,
      `Published: ${entry.data.publishDate.toISOString()}`,
      ...(entry.data.updatedDate
        ? [`Updated: ${entry.data.updatedDate.toISOString()}`]
        : []),
      `Description: ${entry.data.description}`,
      `Tags: ${entry.data.tags.join(', ') || 'None'}`,
      `Author: Sayan Chowdhury`,
      '',
      source || entry.data.description,
    ].join('\n');
  });

  return (
    [
      buildLlmsTxt(entries).trim(),
      '',
      '---',
      '',
      '# Complete Published Text Archive',
      '',
      ...content,
    ].join('\n\n') + '\n'
  );
}
