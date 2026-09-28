# Kalaris Labs Design System

This file is the visual source of truth for the Kalaris Labs website. Page-specific files in `pages/` may refine layout, but they must not replace this foundation without an explicit design decision.

## Direction

**Premium scientific interface: vertical, editorial, precise, and dark by default.**

The website should feel closer to a serious research tool or technical publication than a conventional startup landing page. The primary desktop composition is a fixed left navigation rail plus one focused reading column. Content moves vertically and deliberately. Avoid wide billboard sections, oversized decorative orbits, floating glass cards, gradient-heavy “AI” styling, and generic bento grids.

## Layout

- Desktop navigation rail: `18.5rem`, fixed to the left, full viewport height.
- Main reading column: `46rem` maximum, centered in the remaining viewport.
- Main sections are stacked vertically with a single-pixel separator.
- Use compact labels, generous vertical rhythm, and short readable line lengths.
- Mobile: replace the rail with a `4.1rem` sticky top bar and native `<details>` menu.
- Core breakpoints: 375, 768, 900, 1024, and 1440px.

## Color tokens

| Token            | Value     | Use                             |
| ---------------- | --------- | ------------------------------- |
| `--black`        | `#050505` | Default page background         |
| `--panel`        | `#0a0a0b` | Subtle sections and controls    |
| `--panel-raised` | `#101012` | Hover and raised states         |
| `--ink`          | `#f0eee8` | Primary text                    |
| `--subtle`       | `#949497` | Body and supporting copy        |
| `--line`         | `#29292c` | Dividers and control borders    |
| `--blue`         | `#4d7cff` | Primary action and active state |
| `--green`        | `#38d995` | Live/available status only      |

Black is the default, not a theme variant. Do not introduce a light-mode default. Blue should be used with restraint: primary actions, active navigation, diagrams, and meaningful links. Green is reserved for status, never general decoration.

## Typography

- Display and body: Manrope.
- Technical labels and metadata: DM Mono.
- Headlines are medium weight, tightly tracked, and sentence case.
- Body copy is 16–18px with 1.7–1.8 line height.
- Technical labels are 9–11px, uppercase, and letter-spaced.
- Do not use oversized text merely to fill the viewport. Headings must remain readable within the vertical content column.

## Components

### Navigation rail

- Wordmark at top, primary routes beneath, contextual “On this page” index below.
- Active route uses a small blue square plus brighter text.
- External routes include a restrained northeast arrow.

### Buttons

- Rectangular with minimal radius.
- Primary button: blue surface, white text.
- Secondary button: near-black surface with visible gray border.
- 44px minimum height and a subtle `scale(.97)` pressed state.
- Transitions use named properties only and complete within 160ms.

### Content sections

- One column, one clear headline, one primary idea.
- Separate sections with a `1px` rule rather than floating cards.
- Use numbered rows for principles, research, and updates.
- Diagrams live inside bounded dark technical canvases, not glass panels.

## Motion

- Motion is sparse and explains state.
- Navigation and button feedback: 140–160ms with `cubic-bezier(.23,1,.32,1)`.
- Do not animate layout, width, height, or long page entrances.
- Respect `prefers-reduced-motion`; the page must remain complete without animation or JavaScript.

## Accessibility

- Text contrast must meet WCAG AA.
- Maintain visible blue focus outlines on all interactive controls.
- Touch targets are at least 44×44px.
- Keep semantic landmarks, sequential headings, skip navigation, and keyboard-operable mobile menus.
- Never rely on color alone to communicate meaning.

## Avoid

- Light backgrounds as the default.
- Neumorphism, glassmorphism, glowing blobs, and excessive gradients.
- Wide centered hero billboards.
- Decorative animation without an explanatory purpose.
- Invented team members, traction, partners, customers, or product capabilities.
- Generic claims such as “revolutionary,” “cutting-edge,” or “changing the world.”

## Pre-delivery checks

- Test at 375, 768, 1024, and 1440px.
- Confirm the rail becomes a usable mobile menu.
- Confirm no horizontal overflow.
- Confirm focus visibility and logical tab order.
- Confirm reduced-motion behavior.
- Confirm production assets load through Wrangler/Workers Static Assets.
