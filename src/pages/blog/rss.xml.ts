import type { APIRoute } from 'astro';
import { buildFeed } from '../../lib/seo/feeds';

export const prerender = true;
export const GET: APIRoute = () => buildFeed('blog');
