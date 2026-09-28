# Kalaris Labs Website - Agent Documentation

## Project Overview

Official website for Kalaris Labs (kalarislabs.com) built with modern web technologies and production-grade infrastructure.

## Tech Stack

### Framework & Language

- **Astro** - Static site generator with islands architecture
- **React** - UI library for interactive components
- **TypeScript** - Type-safe development

### Styling & UI

- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible components
- **Lucide** - Icon library
- **Google Fonts** - Typography

### Motion & Animation

- **GSAP** - Professional-grade animations
- **Motion (Framer Motion)** - React animation library
- **Lenis** - Smooth scrolling

### JS Graphics

- **Rive** - Interactive vector animations
- **Spline** - 3D design tool integration

### Content / CMS

- **Astro MDX content collections** - Current blog and research source
- **EmDash** - Future content adapter; not part of the current runtime

### Analytics

- **PostHog** - Consent-gated launch analytics; GTM and GA are intentionally omitted

### Email

- **Resend** - Transactional email service

### Observability

- **Sentry** - Error tracking and performance monitoring

### Documentation

- **Mintlify** - Documentation platform

### Infrastructure / Hosting

- **Cloudflare** - Workers, Static Assets, CDN, DNS, WAF, Wrangler

### Standards

- **RSS** - Feed syndication
- **Open Graph** - Social media sharing
- **HTTP/3** - Modern HTTP protocol
- **PWA** - Planned after the foundation pass

## Installed Skills

The canonical project catalog contains 31 flat skill directories under `.agents/skills`. See `docs/skills.md` for the curated infrastructure, framework, analytics, email, observability, engineering, and design categories. `skills-lock.json` is the reproducible source catalog.

## Project Structure

```
kalaris-labs-website/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── sections/        # Page sections (Hero, Features, CTA)
│   │   ├── content/         # Blog and research presentation
│   │   └── integrations/    # Consent-aware browser integrations
│   ├── content/             # Typed blog and research MDX
│   ├── lib/
│   │   ├── contact/         # Contact validation and provider adapters
│   │   ├── integrations/    # PostHog consent integration
│   │   └── utils/           # Utility functions
│   ├── pages/               # Prerendered pages and Worker API routes
│   ├── layouts/             # Astro layouts
│   ├── styles/              # Global styles
│   └── worker.ts            # Worker wrapper and canonical-host redirect
├── public/                  # Static assets
├── .agents/skills/          # Canonical installed skills
├── docs/skills.md           # Skill catalog documentation
├── package.json
├── tsconfig.json
├── astro.config.mjs
├── worker-configuration.d.ts
├── wrangler.jsonc
└── .env.example
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Verify Astro dev serves public assets and Vite client modules
npm run verify:dev-assets

# Build and run in the local Cloudflare Workers runtime
npm run dev:worker

# Build for production
npm run build

# Preview production build
npm run preview

# Validate and deploy the Cloudflare Worker
npm run deploy:dry-run
npm run deploy:staging
npm run deploy

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

## Environment Setup

1. Copy `.env.example` to `.env.local` for public/build configuration.
2. Copy `.dev.vars.example` to `.dev.vars` for local Worker secrets.
3. Public configuration uses `PUBLIC_SITE_URL`, `PUBLIC_DOCS_URL`, `PUBLIC_POSTHOG_TOKEN`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_TURNSTILE_SITE_KEY`, and `PUBLIC_SENTRY_DSN`.
4. Worker secrets are `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`. Production secrets must be stored with `wrangler secret put --env production`; never put them in `wrangler.jsonc`.
5. Sentry source-map upload uses server-only `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` during CI/builds.

## Integration Status

### ✅ Configured

- PostHog analytics integration
- Sentry error tracking
- Resend email service
- External Mintlify documentation URL
- Cloudflare infrastructure
- All animation libraries (GSAP, Motion, etc.)
- Tailwind CSS + shadcn/ui

### ⏳ Pending

- Real Turnstile widget provisioning and Worker secret entry
- EmDash CMS integration (kept as a future content adapter)

## Deployment

The site is configured as one Cloudflare Workers deployment; Cloudflare Pages is not used:

- Prerendered pages and static assets via Workers Static Assets
- Astro on-demand routes, including `/api/contact`, in the same Worker
- `kalarislabs.com` as the canonical production hostname with a Worker-level `www` redirect
- DNS managed by Cloudflare
- WAF protection enabled

`npm run dev` uses `astro.config.dev.mjs` and Astro's native development server so public assets and Vite modules resolve correctly on Windows. Production builds, Worker-local previews, and deployments continue to use the Cloudflare adapter in `astro.config.mjs`; use `npm run dev:worker` when Worker-runtime parity is required.

## Notes

- All skills are installed and available for agent use
- Project follows production-grade patterns with proper error handling, analytics, and observability
- Performance optimized with smooth scrolling, lazy loading, and modern CSS
- Security-first approach with Sentry monitoring and proper environment variable management
