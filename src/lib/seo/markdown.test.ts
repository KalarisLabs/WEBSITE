import { describe, expect, it } from 'vitest';
import {
  absolutizeMarkdownLinks,
  markdownPathFor,
  prefersMarkdown,
  shiftHeadings,
} from './markdown';

describe('markdownPathFor', () => {
  it('maps pages to their Markdown twins', () => {
    expect(markdownPathFor('/')).toBe('/index.md');
    expect(markdownPathFor('/team')).toBe('/team.md');
    expect(markdownPathFor('/research/skill-doctor/')).toBe(
      '/research/skill-doctor.md',
    );
  });

  it('ignores files and API routes', () => {
    expect(markdownPathFor('/llms.txt')).toBeUndefined();
    expect(markdownPathFor('/team.md')).toBeUndefined();
    expect(markdownPathFor('/api/contact')).toBeUndefined();
  });
});

describe('prefersMarkdown', () => {
  it('honours explicit Markdown requests', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true);
    expect(prefersMarkdown('text/markdown, text/html;q=0.9')).toBe(true);
    expect(prefersMarkdown('text/x-markdown')).toBe(true);
  });

  it('keeps browsers and generic clients on HTML', () => {
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown('*/*')).toBe(false);
    expect(
      prefersMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ),
    ).toBe(false);
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBe(false);
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false);
  });
});

describe('absolutizeMarkdownLinks', () => {
  it('rewrites root-relative links and images only', () => {
    expect(
      absolutizeMarkdownLinks(
        'See [manifesto](/manifesto), ![x](/a.png), [ext](https://x.dev), [p](//cdn.x)',
      ),
    ).toBe(
      'See [manifesto](https://kalarislabs.com/manifesto), ![x](https://kalarislabs.com/a.png), [ext](https://x.dev), [p](//cdn.x)',
    );
  });
});

describe('shiftHeadings', () => {
  it('demotes headings outside code fences', () => {
    const input = '## A\n```bash\n# comment\n```\n### B\n###### C';
    expect(shiftHeadings(input, 1)).toBe(
      '### A\n```bash\n# comment\n```\n#### B\n###### C',
    );
  });
});
