import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const configPath = process.argv[2] ?? 'astro.config.mjs';
const assetPaths = [
  '/site.webmanifest',
  '/images/logos/anthropic.svg',
  '/founders/sayan-chowdhury.jpg',
  '/kalaris-wordmark.png',
  '/favicon.png',
  '/@vite/client',
];

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Could not allocate a local test port.'));
        return;
      }

      server.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Astro dev exited early with code ${child.exitCode}.`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error('Timed out waiting for Astro dev.');
}

const port = await getAvailablePort();
const origin = `http://127.0.0.1:${port}`;
const astroBin = fileURLToPath(
  new URL('../node_modules/astro/bin/astro.mjs', import.meta.url),
);
const child = spawn(
  process.execPath,
  [
    astroBin,
    'dev',
    '--config',
    configPath,
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

let output = '';
child.stdout.on('data', (chunk) => {
  output += chunk;
});
child.stderr.on('data', (chunk) => {
  output += chunk;
});

try {
  await waitForServer(origin, child);

  const results = await Promise.all(
    assetPaths.map(async (path) => {
      const response = await fetch(`${origin}${path}`);
      return { path, status: response.status };
    }),
  );
  const failures = results.filter(({ status }) => status !== 200);

  for (const { path, status } of results) {
    console.log(`${status} ${path}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  if (output.trim()) console.error(output.trim());
  throw error;
} finally {
  child.kill();
  if (process.exitCode && output.trim()) {
    console.error(output.trim());
  }
}
