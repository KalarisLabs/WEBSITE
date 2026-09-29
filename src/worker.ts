import astro from '@astrojs/cloudflare/entrypoints/server';
import { canonicalRedirect } from './lib/seo/canonical-redirect';
import { applyDiscoveryHeaders, negotiateMarkdown } from './lib/seo/headers';
import { applySecurityHeaders } from './lib/security/headers';
import { enforceRateLimits } from './lib/security/rate-limit';

async function route(
  request: Request,
  workerEnv: Env,
  context: ExecutionContext,
): Promise<Response> {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;

  const throttled = await enforceRateLimits(request, workerEnv);
  if (throttled) return throttled;

  if (workerEnv.ASSETS) {
    const markdown = await negotiateMarkdown(request, workerEnv.ASSETS);
    if (markdown) return markdown;

    const assetResponse = await workerEnv.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return applyDiscoveryHeaders(request, assetResponse);
    }
  }

  const response = await astro.fetch(request, workerEnv, context);
  return applyDiscoveryHeaders(request, response);
}

export default {
  async fetch(request: Request, workerEnv: Env, context: ExecutionContext) {
    return applySecurityHeaders(
      request,
      await route(request, workerEnv, context),
    );
  },
} satisfies ExportedHandler<Env>;
