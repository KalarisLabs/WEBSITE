---
name: impeccable
description: Impeccable design audit skill for Kalaris Labs. Enforces editorial restraint, visual hierarchy, typography ratios, and thinkingmachines.ai-level aesthetic quality.
---

# Impeccable — Design Audit Skill

This skill guides agents and engineers in auditing and perfecting every pixel, line of copy, typographic choice, and layout spacing for **Kalaris Labs** ([kalarislabs.com](https://kalarislabs.com)).

## The Benchmark: Editorial Restraint (Thinking Machines Standard)

The reference benchmark for Kalaris Labs is [thinkingmachines.ai](https://thinkingmachines.ai):
- **Quiet Authority**: A serious scientific research lab publishing a thesis—not a glossy SaaS product, not an AI chatbot wrapper.
- **Paper & Ink Foundation**: The baseline is warm laboratory paper (`#f6f4ef`), near-black ink (`#171914`), and sparse organic green accent (`#2e5c49`).
- **One Considered Reading Measure**: 620px to 700px max width for reading copy (~65-75 characters per line).
- **Type Pairing**: Utilitarian sans for navigation, labels, numbers, and product titles; literary serif for long-form prose and lede statements.
- **Air & Rhythm**: Generous vertical separation (104px–144px on desktop, 72px–96px on mobile).

---

## The Impeccable Audit Checklist

When reviewing any page, component, or layout change, verify all items:

### 1. Typography & Hierarchy
- [ ] Only one `<h1>` per page.
- [ ] Heading hierarchy (`h1` -> `h2` -> `h3`) is strictly monotonic and semantic.
- [ ] Body copy is set in literary serif with `line-height: 1.55–1.65` for optimal reading flow.
- [ ] No arbitrary font sizes: adhere strictly to `--font-size-*` scale tokens.
- [ ] Letter-spacing (tracking) is tight on large headings (`-0.03em` to `-0.05em`) and spaced on uppercase labels/eyebrows (`0.06em` to `0.12em`).

### 2. Color Contrast & Palette Discipline
- [ ] All text passes WCAG AA contrast ratio (4.5:1 for regular text, 3:1 for large text).
- [ ] Background is always `--paper` (`#f6f4ef`) or subtle tinted card `--paper-tint` (`#efede6`).
- [ ] Primary ink is `--ink` (`#171914`).
- [ ] Secondary/metadata text is `--muted-ink` (`#676a61`)—never used for long paragraphs.
- [ ] Accent color `--kalari-green` (`#2e5c49`) is used sparingly: links, focus rings, subtle active indicators.
- [ ] Zero neon colors, purple gradients, rainbow borders, or glassmorphic blur filters.

### 3. Layout, Gutters & Alignment
- [ ] Full width is reserved only for top nav, hairline rules, hero wordmark alignment, and footer.
- [ ] Content uses `.reading-column` (`max-width: 43rem` / ~688px) centered with `margin-inline: auto`.
- [ ] Outer desktop padding: `clamp(1.5rem, 5vw, 5rem)`.
- [ ] Mobile gutters: `1.25rem` to `1.5rem`.
- [ ] Hairline rules (`--rule: #d7d7ce`) use `1px solid` dividers to separate major chapters.

### 4. Interactive Polish & Micro-interactions
- [ ] Pill buttons (`border-radius: 9999px`) have crisp borders, subtle background hover shifts, and no heavy drop shadows.
- [ ] Links feature subtle underlines (`text-underline-offset: 3px; text-decoration-thickness: 1px`).
- [ ] Focus outlines (`outline: 2px solid var(--kalari-green); outline-offset: 4px`) are fully accessible.
- [ ] No distracting hover jumps or jitter; transitions are under 250ms with easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`).

### 5. Content Framing
- [ ] Quotes use authentic left-border rule in `--kalari-green` with italic serif styling.
- [ ] Diagrams are static, crisp line-art by default; any animation is an optional, slow, ambient trace.
- [ ] Wireframe slots are clearly marked with editorial guidance and data schemas.

---

## Invoking the Audit

Run this audit mentally or in code reviews before approving any PR or committing new layouts:
```
Audit Result: [PASS / REVISE]
Violations:
- Item: <details>
- Remediation: <exact CSS or markup fix>
```
