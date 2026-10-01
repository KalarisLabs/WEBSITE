// Assembles the public brand kit: clean, well-named copies of the original
// brand assets in public/brand/, plus a downloadable zip of the same files.
//
//   node scripts/build-brand-kit.mjs
//
// Sources stay where the site already uses them; this only copies. Re-run it
// whenever a source mark changes, then commit public/brand/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (...parts) => path.join(root, 'public', ...parts);
const out = pub('brand');

const COLORS_CSS = `/* Kalaris Labs brand tokens. Dark is the default. */
:root {
  --kalaris-black: #050505; /* page background */
  --kalaris-panel: #0a0a0b; /* subtle sections and controls */
  --kalaris-panel-raised: #101012; /* hover and raised states */
  --kalaris-ink: #f0eee8; /* primary text */
  --kalaris-subtle: #949497; /* supporting copy */
  --kalaris-line: #29292c; /* dividers and control borders */
  --kalaris-blue: #4d7cff; /* primary action and active state */
  --kalaris-green: #38d995; /* live/available status only */
  --kalaris-font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
  --kalaris-font-mono: 'DM Mono', ui-monospace, monospace;
}
`;

const README = `Kalaris Labs brand kit
======================

Kalaris Labs is a research lab building the infrastructure for the agentic era.

Files
-----
kalaris-mark.png             Chrome mark, transparent, 1254x1254
kalaris-mark-512.png         Chrome mark, transparent, 512x512
kalaris-wordmark-white.png   Wordmark for dark backgrounds, transparent
kalaris-wordmark-black.png   Wordmark for light backgrounds, transparent
app-icon-512.png             App icon, 512x512
app-icon-180.png             Apple touch icon, 180x180
favicon-64.png               Favicon, 64x64
kalaris-banner.png           Social banner
colors.css                   Colour and font tokens

Fonts: Manrope (display and body) and DM Mono (technical labels), both from
Google Fonts.

Usage
-----
- Use the wordmark for headers and signatures; use the mark for icons.
- Do not recolour, stretch, rotate, outline, or add effects to either mark.
- Do not rebuild the marks with live text.
- Keep clear space around the marks and place them on backgrounds with strong
  contrast: white wordmark on dark, black wordmark on light.
- The name is written "Kalaris Labs".

Latest version and guidelines: https://kalarislabs.com/brand
Questions: hello@kalarislabs.com
`;

const files = [
  ['kalaris-mark.png', () => readFile(pub('kalaris-logo-geometric.png'))],
  [
    'kalaris-mark-512.png',
    () =>
      sharp(pub('kalaris-logo-geometric.png'))
        .resize(512, 512)
        .png()
        .toBuffer(),
  ],
  ['kalaris-wordmark-white.png', () => readFile(pub('LOGO ( TEXT )'))],
  ['kalaris-wordmark-black.png', () => readFile(pub('kalaris-wordmark.png'))],
  ['app-icon-512.png', () => readFile(pub('icon-512.png'))],
  ['app-icon-180.png', () => readFile(pub('apple-touch-icon.png'))],
  ['favicon-64.png', () => readFile(pub('favicon.png'))],
  [
    'kalaris-banner.png',
    () => readFile(pub('images', 'kalaris-hero-banner.png')),
  ],
  ['colors.css', async () => Buffer.from(COLORS_CSS)],
  ['README.txt', async () => Buffer.from(README)],
];

await mkdir(out, { recursive: true });
const archive = {};
for (const [name, load] of files) {
  const data = await load();
  await writeFile(path.join(out, name), data);
  archive[`kalaris-brand-kit/${name}`] = new Uint8Array(data);
}
// Fixed timestamps keep the zip byte-identical between runs.
const zip = zipSync(archive, {
  level: 6,
  mtime: new Date('2026-10-02T00:00:00Z'),
});
await writeFile(path.join(out, 'kalaris-brand-kit.zip'), zip);
console.log(
  `brand kit: ${files.length} files, zip ${(zip.length / 1024).toFixed(0)} KiB`,
);
