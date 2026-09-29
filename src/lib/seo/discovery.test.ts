import { describe, expect, it } from 'vitest';
import { buildLlmsTxt, buildRobotsTxt } from './discovery';

describe('SEO & GEO discovery generators', () => {
  it('generates robots.txt with explicit AI search bots and sitemap', () => {
    const robots = buildRobotsTxt();
    expect(robots).toContain('User-agent: OAI-SearchBot');
    expect(robots).toContain('User-agent: PerplexityBot');
    expect(robots).toContain('User-agent: Claude-User');
    expect(robots).toContain('Content-Signal:');
    expect(robots).not.toContain('Host:');
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain(
      'Sitemap: https://kalarislabs.com/sitemap-index.xml',
    );
  });

  it('generates llms.txt containing executive summary and entity facts', () => {
    const llms = buildLlmsTxt([]);
    expect(llms).toContain('# Kalaris Labs');
    expect(llms).toContain('Sayan Chowdhury');
    expect(llms).toContain('## Research');
    expect(llms).toContain('## FAQ');
    expect(llms).toContain('### What is Kalaris Labs?');
    expect(llms).toContain('hello@kalarislabs.com');
  });

  it('links llms.txt entries to their Markdown twins', () => {
    const llms = buildLlmsTxt([
      {
        collection: 'research',
        entry: {
          id: 'skill-doctor',
          data: {
            title: 'Skill Doctor',
            description: 'Tool diagnostics.',
            publishDate: new Date('2026-09-28'),
            tags: [],
          },
        },
      },
    ]);
    expect(llms).toContain(
      '- [Skill Doctor](https://kalarislabs.com/research/skill-doctor.md): Tool diagnostics.',
    );
  });
});
