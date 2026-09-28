import astro from '@astrojs/cloudflare/entrypoints/server';
import { applyDiscoveryHeaders } from './lib/seo/headers';

export default {
  async fetch(request: Request, workerEnv: Env, context: ExecutionContext) {
    const url = new URL(request.url);
    if (url.hostname === 'www.kalarislabs.com') {
      url.hostname = 'kalarislabs.com';
      return Response.redirect(url, 308);
    }

    if (workerEnv.ASSETS) {
      const assetResponse = await workerEnv.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return applyDiscoveryHeaders(request, assetResponse);
      }
    }

    const response = await astro.fetch(request, workerEnv, context);
    return applyDiscoveryHeaders(request, response);
  },
} satisfies ExportedHandler<Env>;
