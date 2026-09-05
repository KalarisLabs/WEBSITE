---
name: astro-craftsman
description: Astro 5 architecture, Content Collections, and Islands guidelines for Kalaris Labs. Enforces type-safety, zero-JS defaults, and clean component isolation.
---

# Astro Craftsman — Agent Skill

This skill governs the Astro 5.x codebase architecture, file structures, Content Collections, and React Islands for **Kalaris Labs**.

---

## 1. Core Principles

1. **Static First (Zero JS by Default)**: Astro pages output pure, static HTML and CSS. JavaScript is only bundled for specific islands that require client-side interaction.
2. **Type-Safe Content Collections**: All blogs, research papers, changelog entries, and products are defined using Zod schemas in `src/content.config.ts`.
3. **Partial Hydration (Islands)**: Interactive React components (e.g. `MobileNav`, `ResearchFilter`, `BibtexCopyButton`) must be hydrated using the least aggressive client directive:
   - `client:idle`: For non-critical widgets (search filters, copy buttons).
   - `client:media="(max-width: 768px)"`: For mobile-only drawers.
   - `client:visible`: For elements below the fold.
   - Avoid `client:load` unless strictly necessary for initial paint.

---

## 2. Directory Layout Standard

```
src/
├── components/
│   ├── layout/       # Header, Footer, SkipLink (Astro components)
│   ├── motion/       # GSAP & Framer Motion components
│   ├── seo/          # BaseHead, JsonLd, OpenGraph
│   └── ui/           # Button, Badge, WireframeSlot, ReadingColumn
├── content/
│   ├── blogs/        # Markdown / MDX blog articles
│   ├── changelog/    # Versioned release notes
│   ├── customer-stories/ # Research lab case studies
│   ├── partnerships/ # Institutional partner briefs
│   ├── products/     # System architecture layers
│   ├── programs/     # Grants, fellowships, compute credits
│   └── research/     # Research papers and technical preprints
├── layouts/
│   ├── BaseLayout.astro        # Top-level HTML shell with BaseHead & PostHog
│   ├── PageLayout.astro        # Standard page with Header & Footer
│   ├── BlogPostLayout.astro    # Literary reading layout with author byline
│   └── ResearchPaperLayout.astro # Academic preprint layout with BibTeX & abstract
├── lib/
│   ├── posthog.ts    # Analytics helper
│   └── seo.ts        # Schema.org structured data generators
├── pages/            # File-based routing
└── styles/
    ├── tokens.css    # Colors, typography, spacing variables
    └── global.css    # Reset, base typography, wireframe utility classes
```

---

## 3. Adding New Content

When adding a research paper or blog post:
1. Ensure the file has valid frontmatter matching the schema defined in `src/content.config.ts`.
2. Do not omit required fields (`title`, `pubDate`, `description` / `abstract`).
3. For research papers, specify `authors`, `category`, and optional `doi`.
4. Validate build types by running `cmd /c "npx astro check"`.
