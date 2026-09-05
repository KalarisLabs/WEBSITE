---
name: ui-slop
description: Anti-slop design audit skill for Kalaris Labs. Detects and eliminates AI SaaS tropes, purple neon gradients, floating glass cards, buzzwords, and decorative noise.
---

# UI Slop Detector — Design Audit Skill

The **UI Slop Audit** protects Kalaris Labs from falling into the trap of generic AI SaaS templates, hype-driven startup clichés, and low-effort aesthetic shortcuts.

> **Principle**: Kalaris Labs is a serious scientific infrastructure institution grounded in India building recursive agentic systems for global science. It must look and read like a research paper or monograph, not a ProductHunt launch template.

---

## The 10 Deadly Slop Patterns (Strictly Prohibited)

| # | Slop Pattern | Why It Fails | Mandated Replacement |
|---|--------------|--------------|----------------------|
| 1 | **Purple/Blue/Violet Neon Gradients** | Stereotypical AI cliché; looks cheap and undifferentiated. | Warm paper (`#f6f4ef`), charcoal ink (`#171914`), organic green (`#2e5c49`). |
| 2 | **Frosted Glass / Glassmorphism** | Unreadable text, heavy GPU draw, tacky 2021 Dribbble trend. | Solid warm paper backgrounds or crisp 1px borders (`#d7d7ce`). |
| 3 | **Floating Cards with Heavy Box Shadows** | Breaks editorial reading rhythm; feels like a template marketplace. | One considered reading column or vertically stacked structural layers. |
| 4 | **Floating Particle Meshes & Spinning 3D Globes** | Distracting spectacle with zero information density. | Static, high-precision SVG diagrams (e.g. the Kalari scientific loop). |
| 5 | **Buzzword Bingo** | Claims without evidence erode trust among principal investigators and scientists. | Ban: "revolutionary", "supercharge", "magic", "one-click", "game-changing". Use: "recursive", "reproducible", "verifiable", "audit-trail". |
| 6 | **Animated Count-Up Vanity Metrics** | E.g., "10,000,000+ tokens processed", "99.99% accuracy" without benchmark context. | Verifiable benchmarks or transparent placeholders awaiting peer review. |
| 7 | **Stock Science Imagery** | Stock photos of people looking at glowing test tubes or floating blue DNA strands. | Monochromatic diagrams, real architecture schematics, or clean typographic layout. |
| 8 | **Scroll-Jacking & Cursor Trails** | Violates basic accessibility and user autonomy. | Native browser scrolling with smooth CSS scroll-behavior. |
| 9 | **Auto-Rotating Carousels** | Content hides from readers and search bots; frustrating UX. | Static vertical reading columns, tabs, or cleanly indexed lists. |
| 10 | **Decorative "Bento Grids" with Blank Space Fillers** | Arbitrary boxes with random icons and shiny gradient borders. | Deliberate vertical information hierarchy with clear editorial logic. |

---

## Slop Audit Checklist

Run this check against every page component:

- [ ] Does any element use a multi-stop gradient (especially violet to cyan)? **If YES, reject.**
- [ ] Are there decorative cards where simple typography and a thin rule would suffice? **If YES, refactor.**
- [ ] Does any copy use hyperbole instead of describing technical architecture? **If YES, rewrite.**
- [ ] Are there floating elements with `box-shadow: 0 20px 50px rgba(0,0,0,0.2)`? **If YES, remove.**
- [ ] Does the page require JavaScript just to display primary text? **If YES, fix to static HTML.**
- [ ] Is there any element that moves continuously without user interaction? **If YES, stop animation.**

---

## Tone Calibration Guide

| Do Not Write (Slop) | Write Instead (Kalaris Voice) |
|---------------------|-------------------------------|
| "Supercharge your research with our next-gen agentic platform!" | "We build recursive, self-improving AI infrastructure for scientific discovery." |
| "Unlock the magic of automated paper discovery in one click." | "Paper ingestion, indexing, hybrid search, and citation graphs for scientific corpora." |
| "The world's smartest AI assistant for researchers." | "AI systems that can read, reason, plan, test, improve, and support discovery—reproducibly." |
| "Join 10,000+ happy scientists!" | "Partner labs, research groups, and builders collaborating on verifiable discovery loops." |
