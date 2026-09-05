---
name: posthog-analytics
description: Official PostHog analytics and telemetry skill for Kalaris Labs, derived directly from posthog.com/docs/libraries/astro and Cloudflare reverse-proxy documentation.
---

# PostHog Analytics — Official Integration Skill

> **Source**: [PostHog Official Astro Docs](https://posthog.com/docs/libraries/astro) & [PostHog Cloudflare Proxy Docs](https://posthog.com/docs/advanced/proxy/cloudflare)

This skill guides the implementation, instrumentation, and privacy configuration of **PostHog** on the Kalaris Labs platform.

---

## 1. Official Astro Integration Pattern

PostHog's official documentation prescribes initializing `posthog-js` via a dedicated component in the `<head>` of your layout, guarded against re-initialization during Astro client-side navigations (`ClientRouter` / `astro:page-load`):

```astro
---
// src/components/PostHog.astro
---
<script is:inline>
  !(function (t, e) {
    var o, n, p, r;
    e.__SV ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split('.');
          2 == o.length && ((t = t[o[0]]), (e = o[1])),
            (t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            });
        }
        ((p = t.createElement('script')).type = 'text/javascript'),
          (p.crossOrigin = 'anonymous'),
          (p.async = !0),
          (p.src =
            s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') +
            '/static/array.js'),
          (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r);
        var u = e;
        for (
          void 0 !== a ? (u = e[a] = []) : (a = 'posthog'),
            u.people = u.people || [],
            u.toString = function (t) {
              var e = 'posthog';
              return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e;
            },
            u.people.toString = function () {
              return u.toString(1) + '.people (stub)';
            },
            o =
              'init capture register register_once unregister unregister_once get_distinct_id get_session_id identify reset set_config'.split(
                ' '
              ),
            n = 0;
          n < o.length;
          n++
        )
          g(u, o[n]);
        e._i.push([i, s, a]);
      }),
      (e.__SV = 1));
  })(document, window.posthog || []);

  // PostHog initialization guard
  if (!window.posthog?.__loaded) {
    posthog.init(
      import.meta.env.PUBLIC_POSTHOG_KEY || '<ph_project_token>',
      {
        api_host: import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: 'history_change', // Tracks automatically across Astro navigations
        person_profiles: 'identified_only',
        respect_dnt: true,
      }
    );
  }
</script>
```

---

## 2. Official Cloudflare Reverse Proxy Setup

To ensure 100% telemetry fidelity and prevent browser adblockers from dropping scientific paper reading events, PostHog officially recommends proxying requests through Cloudflare:

In `public/_redirects` or Cloudflare Pages Functions:
```
/ingest/static/*  https://us-assets.i.posthog.com/static/:splat  200
/ingest/*         https://us.i.posthog.com/:splat                200
```
Then update `api_host`:
```javascript
api_host: 'https://kalarislabs.com/ingest'
ui_host: 'https://us.posthog.com'
```

---

## 3. Official User Identification & Session Reset

Directly from PostHog best practices:
- **Never** use generic strings like `"anonymous"` or `"user"`.
- Call `posthog.identify('distinct_user_id')` when a researcher logs into the research platform.
- Call `posthog.reset()` upon logout to prevent session cross-contamination.

```typescript
import posthog from 'posthog-js';

export function identifyResearcher(id: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(id, properties);
  }
}

export function resetResearcherSession() {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset();
  }
}
```

---

## 4. Key Event Taxonomy for Kalaris Labs
- `research_paper_viewed`: `{ paper_id, title, category }`
- `bibtex_copied`: `{ paper_id }`
- `paper_pdf_downloaded`: `{ paper_id }`
- `brand_asset_downloaded`: `{ asset_name, format }`
- `contact_inquiry_submitted`: `{ type: 'partnership' | 'career' | 'general' }`
