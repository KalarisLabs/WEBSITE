// Submits every URL in the live sitemaps to IndexNow (Bing, which powers
// ChatGPT Search and Copilot, plus Yandex, Seznam, Naver, and others).
// Run after a production deploy:  npm run indexnow   (add --dry-run to preview)
import { readdirSync } from 'node:fs';

const site = (process.env.PUBLIC_SITE_URL ?? 'https://kalarislabs.com').replace(
  /\/$/,
  '',
);
const dryRun = process.argv.includes('--dry-run');

// The key is the name of the 32-hex-character .txt file in public/.
const keyFile = readdirSync('public').find((name) =>
  /^[a-f0-9]{32}\.txt$/.test(name),
);
if (!keyFile) throw new Error('No IndexNow key file found in public/.');
const key = keyFile.replace(/\.txt$/, '');
const keyLocation = `${site}/${keyFile}`;

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

const locs = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);

const index = await text(`${site}/sitemap-index.xml`);
const urls = new Set();
for (const sitemap of locs(index)) {
  for (const url of locs(await text(sitemap))) urls.add(url);
}

const urlList = [...urls].filter((url) => url.startsWith(site));
console.log(`Found ${urlList.length} URLs in the sitemaps.`);

if (dryRun) {
  console.log(urlList.join('\n'));
  process.exit(0);
}

if ((await text(keyLocation)).trim() !== key) {
  throw new Error(
    `${keyLocation} does not serve the IndexNow key. Deploy first.`,
  );
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(site).host,
    key,
    keyLocation,
    urlList,
  }),
});

// 200 and 202 both mean accepted; 202 means the key is still being verified.
if (response.status !== 200 && response.status !== 202) {
  throw new Error(
    `IndexNow returned ${response.status}: ${await response.text()}`,
  );
}
console.log(`IndexNow accepted ${urlList.length} URLs (${response.status}).`);
