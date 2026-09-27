import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(
  async ({ request, redirect }, next) => {
    const url = new URL(request.url);
    if (url.hostname === 'www.kalarislabs.com') {
      url.hostname = 'kalarislabs.com';
      return redirect(url.toString(), 308);
    }

    return next();
  },
);
