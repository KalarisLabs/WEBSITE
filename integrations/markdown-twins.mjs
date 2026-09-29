// Build step: makes every prerendered HTML page machine-readable.
//
// 1. Writes a Markdown twin next to each page that lacks one
//    (`/` -> `/index.md`, `/team` -> `/team.md`). Articles already get
//    source-accurate twins from src/pages/{blog,research}/[slug].md.ts.
// 2. Appends those pages to /llms-full.txt so it is a zero-hop archive.
// 3. Annotates every Markdown/archive link in /llms.txt and /llms-full.txt
//    with its token count (o200k_base tokenizer).
//
// The twin paths must match markdownPathFor() in src/lib/seo/markdown.ts,
// which the Worker uses for `Accept: text/markdown` content negotiation.
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countTokens } from 'gpt-tokenizer';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const SKIP_DIRS = new Set(['_astro', 'images', 'founders', 'models', 'videos']);

async function findHtmlPages(root, dir = root) {
  const pages = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name))
        pages.push(...(await findHtmlPages(root, full)));
    } else if (entry.name === 'index.html') {
      pages.push(full);
    }
  }
  return pages;
}

function routeFor(root, file) {
  const rel = path.relative(root, path.dirname(file)).split(path.sep).join('/');
  return rel ? `/${rel}` : '/';
}

function twinFileFor(root, route) {
  return path.join(root, route === '/' ? 'index.md' : `${route.slice(1)}.md`);
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'");
}

function headValue(html, pattern) {
  const match = pattern.exec(html);
  return match?.[1] ? decodeEntities(match[1].trim()) : undefined;
}

export function shiftHeadings(markdown, levels) {
  let fence = null;
  return markdown
    .split('\n')
    .map((line) => {
      const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
      if (fenceMatch) {
        if (!fence) fence = fenceMatch[1];
        else if (fenceMatch[1].startsWith(fence[0])) fence = null;
        return line;
      }
      if (fence) return line;
      return line.replace(/^(#{1,6})(?=\s)/, (hashes) =>
        '#'.repeat(Math.min(6, hashes.length + levels)),
      );
    })
    .join('\n');
}

function createConverter(pageUrl) {
  const service = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
  });
  service.use(gfm);
  service.remove([
    'script',
    'style',
    'noscript',
    'template',
    'svg',
    'canvas',
    'iframe',
    'video',
    'form',
    'button',
    'input',
    'select',
    'textarea',
  ]);
  // Decorative or interactive-only elements.
  service.addRule('hidden', {
    filter: (node) =>
      node.getAttribute?.('aria-hidden') === 'true' ||
      node.hasAttribute?.('hidden') ||
      node.hasAttribute?.('data-md-skip'),
    replacement: () => '',
  });
  // Machine-only summaries of interactive UI: hidden in HTML, kept here.
  // Added after 'hidden' because later Turndown rules take precedence.
  service.addRule('mdOnly', {
    filter: (node) => node.hasAttribute?.('data-md-only'),
    replacement: (content) => `

${content}

`,
  });
  service.addRule('absoluteLinks', {
    filter: (node) => node.nodeName === 'A' && node.getAttribute('href'),
    replacement: (content, node) => {
      const href = node.getAttribute('href');
      const text = content.replace(/\s+/g, ' ').trim();
      if (!text || href.startsWith('#') || href.startsWith('javascript:')) {
        return text;
      }
      const url = new URL(href, pageUrl).toString();

      // Card links wrap a heading plus metadata: emit a linked heading
      // followed by the card's text, without the decorative images.
      const heading = node.querySelector?.('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const level = Number(heading.nodeName.slice(1));
        const title = heading.textContent.replace(/\s+/g, ' ').trim();
        const details = content
          .split('\n')
          .map((line) => line.trim())
          .filter(
            (line) =>
              line &&
              !line.startsWith('#') &&
              !/^!\[[^\]]*\]\([^)]*\)$/.test(line),
          )
          .map((line) => line.replace(/!\[[^\]]*\]\([^)]*\)\s*/g, '').trim())
          .filter(Boolean);
        return `\n\n${'#'.repeat(level)} [${title}](${url})\n\n${details.join('\n\n')}\n\n`;
      }
      return `[${text}](${url})`;
    },
  });
  service.addRule('absoluteImages', {
    filter: 'img',
    replacement: (_content, node) => {
      const alt = (node.getAttribute('alt') ?? '').trim();
      const src = node.getAttribute('src');
      if (!alt || !src) return '';
      return `![${alt}](${new URL(src, pageUrl).toString()})`;
    },
  });
  return service;
}

function htmlToTwin(html, pageUrl) {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1];
  if (!main) return undefined;

  const title = headValue(html, /<title>([\s\S]*?)<\/title>/i)?.replace(
    / \| Kalaris Labs$/,
    '',
  );
  const description = headValue(
    html,
    /<meta\s+name="description"\s+content="([^"]*)"/i,
  );
  const canonical =
    headValue(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i) ?? pageUrl;

  let body = createConverter(pageUrl)
    .turndown(main)
    // Decorative section markers ("| Research"), but not GFM table rows.
    .replace(/^\| [^|\n]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // The <title> names the page uniquely; the page's H1 (often a tagline
  // shared across pages) becomes a bold lead line.
  const heading = title ?? 'Kalaris Labs';
  const h1 = /^# (.+)$/m.exec(body);
  if (h1) {
    const lead = h1[1].trim();
    body = body
      .replace(h1[0], lead === heading ? '' : `**${lead}**`)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return [
    `# ${heading}`,
    '',
    ...(description ? [`> ${description}`, ''] : []),
    `- Canonical URL: ${canonical}`,
    '',
    body,
    '',
  ].join('\n');
}

function formatTokens(count) {
  if (count < 1000) return `~${count} tokens`;
  return `~${(count / 1000).toFixed(count < 10_000 ? 1 : 0)}k tokens`;
}

function annotateTokens(text, root, site, cache) {
  const origin = new URL(site).origin;
  return text.replace(
    /^(- \[[^\]]+\]\()([^)]+)(\))(.*)$/gm,
    (line, open, href, close, rest) => {
      if (!href.startsWith(origin) || !/\.(md|txt)$/.test(href)) return line;
      if (/\(~[\d.]+k? tokens\)$/.test(rest)) return line;
      const file = path.join(root, decodeURIComponent(new URL(href).pathname));
      if (!existsSync(file)) return line;
      if (!cache.has(file))
        cache.set(file, countTokens(cache.get(`raw:${file}`) ?? ''));
      const tokens = cache.get(file);
      return `${open}${href}${close}${rest} (${formatTokens(tokens)})`;
    },
  );
}

export default function markdownTwins({ site }) {
  return {
    name: 'kalaris:markdown-twins',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let root = fileURLToPath(dir);
        // Server builds report dist/; prerendered assets live in dist/client.
        if (!existsSync(path.join(root, 'llms.txt'))) {
          const client = path.join(root, 'client');
          if (existsSync(path.join(client, 'llms.txt'))) root = client;
        }

        const generated = [];
        for (const file of await findHtmlPages(root)) {
          const html = await readFile(file, 'utf8');
          if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html))
            continue;

          const route = routeFor(root, file);
          const twinFile = twinFileFor(root, route);
          if (existsSync(twinFile)) continue;

          const twin = htmlToTwin(html, new URL(route, site).toString());
          if (!twin) continue;
          await writeFile(twinFile, twin);
          generated.push({ route, twin });
        }

        // Home first, then alphabetical.
        generated.sort((a, b) =>
          a.route === '/'
            ? -1
            : b.route === '/'
              ? 1
              : a.route.localeCompare(b.route),
        );

        const fullPath = path.join(root, 'llms-full.txt');
        if (existsSync(fullPath) && generated.length) {
          const full = await readFile(fullPath, 'utf8');
          const pages = generated.map(({ twin }) =>
            shiftHeadings(twin.trim(), 1),
          );
          await writeFile(
            fullPath,
            [full.trimEnd(), '---', '# Site Pages', ...pages].join('\n\n') +
              '\n',
          );
        }

        // Token counts, measured on the final files.
        const cache = new Map();
        const load = async (file) => {
          if (existsSync(file))
            cache.set(`raw:${file}`, await readFile(file, 'utf8'));
        };
        for (const name of ['llms.txt', 'llms-full.txt']) {
          const file = path.join(root, name);
          if (!existsSync(file)) continue;
          const text = await readFile(file, 'utf8');
          const targets = [
            ...text.matchAll(/\]\((https?:\/\/[^)]+\.(?:md|txt))\)/g),
          ];
          for (const [, href] of targets) {
            const target = path.join(
              root,
              decodeURIComponent(new URL(href).pathname),
            );
            if (!cache.has(`raw:${target}`)) await load(target);
          }
          await writeFile(file, annotateTokens(text, root, site, cache));
        }

        logger.info(
          `Generated ${generated.length} page Markdown twins; annotated llms.txt token counts.`,
        );
      },
    },
  };
}
