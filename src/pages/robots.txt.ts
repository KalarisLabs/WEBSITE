import type { APIRoute } from 'astro';
import { buildRobotsTxt } from '../lib/seo/discovery';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(buildRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
