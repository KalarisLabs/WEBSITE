import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const country = request.headers.get('cf-ipcountry') || 'GLO';
  const ray = request.headers.get('cf-ray') || 'LOCAL-DEV';
  const colo = ray.includes('-') ? ray.split('-')[1] : 'EDGE';
  const connectingIp = request.headers.get('cf-connecting-ip') ? 'anonymized' : 'localhost';

  return new Response(
    JSON.stringify({
      status: 'operational',
      runtime: 'Cloudflare Workers (SSR)',
      edge: {
        country,
        colo,
        ray,
        clientStatus: connectingIp,
      },
      system: {
        engine: 'Astro 7 SSR',
        timestamp: new Date().toISOString(),
        protocol: 'HTTP/3 / QUIC',
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
};
