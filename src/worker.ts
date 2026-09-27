import astro from '@astrojs/cloudflare/entrypoints/server';

export default {
  async fetch(request: Request, workerEnv: Env, context: ExecutionContext) {
    const url = new URL(request.url);
    if (url.hostname === 'www.kalarislabs.com') {
      url.hostname = 'kalarislabs.com';
      return Response.redirect(url, 308);
    }

    return astro.fetch(request, workerEnv, context);
  },
} satisfies ExportedHandler<Env>;
