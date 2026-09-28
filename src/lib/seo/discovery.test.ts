import { describe, expect, it } from 'vitest';
import { buildLlmsTxt, buildRobotsTxt } from './discovery';

describe('SEO & GEO discovery generators', () => {
  it('generates robots.txt with explicit AI search bots and sitemap', () => {
    const robots = buildRobotsTxt();
    expect(robots).toContain('User-agent: OAI-SearchBot');
    expect(robots).toContain('User-agent: PerplexityBot');
    expect(robots).toContain('User-agent: ClaudeBot');
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain(
      'Sitemap: https://kalarislabs.com/sitemap-index.xml',
    );
  });

  it('generates llms.txt containing executive summary and entity facts', () => {
    const llms = buildLlmsTxt([]);
    expect(llms).toContain('# Kalaris Labs');
    expect(llms).toContain('Sayan Chowdhury');
    expect(llms).toContain('Recursive Context');
    expect(llms).toContain('Primary Answers for Generative Search (AEO)');
    expect(llms).toContain('What is Kalaris Labs?');
  });
});
