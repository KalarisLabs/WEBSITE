# Kalaris Labs: Landing Page Design Direction

## Purpose

Create an authoritative, quiet home for **Kalaris Labs**, an AI research and infrastructure company for scientific discovery. The landing page is inspired by Thinking Machines Lab (`thinkingmachines.ai`), styled as an elegant, centered monograph framed by full-width extreme navigation.

## Core Visual Architecture

### 1. Extreme Edge Framing (Header & Footer)
To ensure the page feels structurally grounded and never empty on large viewports:
- **Header**: Spans the full screen width (`width: 100%; padding-inline: clamp(1.25rem, 3.5vw, 3.5rem)`).
  - **Extreme Left**: Brand mark icon (`kalaris-mark.png`) + `KALARIS` typography.
  - **Extreme Right**: Primary navigation links (`Research`, `Blogs`, `Products`, `Manifesto`, `Join Us`, `More ▾`).
- **Footer**: Anchored across the extremes with multi-column index, copyright, and edge system status.

### 2. Centered Editorial Monograph (Middle of Page with Central Padding)
All page content is unified inside a single centered reading column (`width: 100%; max-width: 42rem; margin-inline: auto; padding-inline: clamp(1.25rem, 4vw, 2.5rem)`):
- **1. Centered Wordmark Logo**: `public/kalaris-wordmark.png` centered horizontally at the top middle of the page (`max-width: 380px; width: 82%`).
- **2. Centered Announcement Pill**: `[NEW] AI for Science and Good →` centered directly below the logo.
- **3. Editorial Body**: Four focused mission paragraphs set in crisp sans typography (`Inter`), line-height 1.7, dark ink (`#1F2937`), with lead paragraph emphasis.
- **4. Quick Links Row**: Inline editorial links (`Join us →`, `Research →`, `Manifesto →`, `Writing →`) with clean underlines and hover transitions.
- **5. Founders & Team Section**: Dedicated full-page horizontal section with full vertical stretch (`min-height: calc(100vh - var(--header-height))`), 4 tall vertical founder cards side-by-side in one frame, top LinkedIn badge, and individual member profile links (`LinkedIn ↗`).
- **6. Hiring Section Box**: An interactive callout box highlighting open roles (`We Are Hiring`, `Bengaluru · Remote friendly`, `Explore open positions →`) routing directly to `/careers`.
- **7. Recent Publications & Notes**: Showcases the top two (2) featured research papers and notes with category/date metadata, underlined title links, abstracts, directional action links (`Read Preprint →`, `Explore Architecture →`), and a link to view all publications.

## Brand & Typography Rules

- **Brand Assets**: Only official assets `public/kalaris-mark.png` and `public/kalaris-wordmark.png` are used. No synthetic bloated vector art.
- **Punctuation Rule**: **No em dashes (`—`)** anywhere on the website.
- **Color Palette**: Pure white (`#FFFFFF`) background, crisp neutral ink (`#111827`), subtle green accents (`#1B4D3E`, `#EAF2ED`), hairline dividers (`#E5E7EB`).
- **Responsiveness**: Fluid typography and elastic layout scaling smoothly across mobile, tablet, desktop, and ultra-wide viewports with robust central padding.
