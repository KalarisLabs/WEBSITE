# Agent skill catalog

Project skills live only in `.agents/skills/<skill-name>`. `skills-lock.json` records their sources and versions so a clean checkout can restore the catalog. Do not add mirrors under `.claude`, `.devin`, or `agent`.

## Infrastructure

- `cloudflare`, `wrangler`, `workers-best-practices`, `web-perf`, `turnstile-spin`

## Framework and UI

- `astro`, `react`, `typescript`, `tailwind-css-patterns`, `shadcn`

## Motion and graphics

- `gsap-scrolltrigger`, `motion-framer`, `rive-interactive`, `spline-interactive`
- `cinematic-gsap-lenis-motion-system`

## Product services

- PostHog: `instrument-product-analytics`, `diagnosing-sdk-health`
- Resend: `resend`, `email-best-practices`
- Sentry: `sentry-sdk-setup`, `sentry-cloudflare-sdk`
- Mintlify: `mintlify-docs`

The repository-mandated `posthog-cli api` workflow must be attempted first for PostHog work. Windows Application Control currently blocks `posthog-cli.exe`; the two official `PostHog/skills` packages above are the documented fallback until that policy changes.

## Engineering and design

- Matt Pocock: `codebase-design`, `improve-codebase-architecture`, `diagnosing-bugs`, `tdd`, `code-review`
- Emil Kowalski: `emil-design-eng`, `review-animations`
- Locally managed: `ui-ux-pro-max`

## Maintenance

Run `npx skills list --json` to inspect the catalog. Every directory under `.agents/skills` must contain a valid `SKILL.md`; install and update skills through the skills CLI so `skills-lock.json` remains authoritative.
