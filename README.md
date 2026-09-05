# Kalaris Labs landing page

A dependency-free, static landing page designed for Cloudflare Pages. The page ships no JavaScript runtime, no external fonts, and no third-party analytics, so all core content is immediately available to search engines and answer engines.

## Run locally

Use any static server, for example:

```powershell
npx serve .
```

## Deploy to Cloudflare Pages

1. Create a Pages project in **Workers & Pages** and connect this directory/repository.
2. Use no build command and set the output directory to the project root (`.`), or deploy directly:

```powershell
npx wrangler pages deploy . --project-name=kalaris-labs
```

3. Add the production custom domain, then ensure it is `https://kalarislabs.com` before publishing. If a different domain is used, replace every `https://kalarislabs.com/` occurrence in `index.html`, `robots.txt`, and `sitemap.xml` first.

## Search and answer-engine readiness

- Single, descriptive H1; concise semantic chapters; and real HTML text.
- Organization, WebSite, and FAQ structured data that mirrors visible content.
- Canonical URL, Open Graph metadata, sitemap, and robots directives.
- Accessible FAQ using native `details` elements.

Before launch, add verified social/organization profile URLs, a real sharing image (`og:image`), and a consented analytics solution if needed. Do not add claims, partner logos, metrics, or product links that are not public and verified.
