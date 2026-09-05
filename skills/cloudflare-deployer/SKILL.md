---
name: cloudflare-deployer
description: Official Cloudflare Pages deployment, edge caching, headers, and Wrangler CLI skill for Kalaris Labs, derived directly from developers.cloudflare.com/pages.
---

# Cloudflare Deployer — Official Cloudflare Pages Skill

> **Source**: [Cloudflare Pages Astro Deployment Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) & [Cloudflare Pages Configuration Docs](https://developers.cloudflare.com/pages/configuration/)

This skill governs building, configuring, and deploying Kalaris Labs to **Cloudflare Pages**.

---

## 1. Cloudflare Pages Project Configuration

| Setting | Value | Official Guidance |
|---|---|---|
| **Framework Preset** | `Astro` | Cloudflare automatically detects Astro configuration |
| **Build Command** | `npm run build` | Runs `astro check && astro build` |
| **Build Output Directory** | `dist` | Default output directory for Astro static builds |
| **Node Version** | `20` or `24` | Set via `NODE_VERSION=24` env var in Cloudflare dashboard |

---

## 2. Deployment via Wrangler CLI (Official Command)

To deploy directly to Cloudflare Pages from the terminal or CI/CD pipeline:

```powershell
# Deploy a production release
npx wrangler pages deploy dist --project-name=kalaris-labs --branch=main

# Deploy a preview branch
npx wrangler pages deploy dist --project-name=kalaris-labs --branch=preview
```

---

## 3. Official Configuration Files (`public/`)

Cloudflare Pages natively parses files in the `public/` directory (copied into `dist/` at build time):

### A. `_headers` (Security & Edge Caching)
```http
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/brand/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/llms.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### B. `_redirects` (Clean Rewrites & Reverse Proxies)
```
# PostHog First-Party Reverse Proxy
/ingest/static/*  https://us-assets.i.posthog.com/static/:splat  200
/ingest/*         https://us.i.posthog.com/:splat                200

# Canonical Redirects
https://www.kalarislabs.com/*  https://kalarislabs.com/:splat  301!
```

---

## 4. Custom Domains & Edge Features
- **Global Anycast Network**: Assets are cached across 330+ edge locations worldwide.
- **Instant Cache Purge**: Executed via Cloudflare API or dashboard upon publishing new research preprints.
- **Zero Cold Starts**: Static files serve with single-digit millisecond latency worldwide.
