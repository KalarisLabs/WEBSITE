# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Researchers, students, research engineers, and interdisciplinary teams who want to understand what Kalaris Labs is building and follow its research notes and posts.
- Prospective hires evaluating open roles on `/careers`.
- Prospective fellows: high-agency designers, growth marketers, and marketing people. They wear different hats, take responsibility, and think from first principles. The fellowship is **not** recruiting researchers.

## Product Purpose

Kalaris Labs builds recursive, self-improving infrastructure for scientific research, so more people can spend their time on questions, experiments, and results instead of repetitive technical setup. Mission: build the infrastructure for scientific discovery, for everyone, everywhere.

The website explains the company, publishes research and writing, and recruits: employees through Careers and fellows through the Fellowship. Fellowship success means a visitor prints their name badge, completes the Typeform application, and shares the fellowship.

## Positioning

Research infrastructure that compounds: it learns from workflows, repositories, papers, and every iteration instead of resetting at the start of each project.

## Operating Context

- Fellowship flow: type a name, see it printed live on a draggable 3D lanyard badge, register interest, then apply at `https://form.typeform.com/to/Wty2XU7s` (the name is appended as `?name=`).
- Share buttons for X, LinkedIn, and WhatsApp are always available on the fellowship page. Shared links unfurl with the fellowship graphic as the preview image.
- The homepage carries a Fellowship section before Careers, using the fellowship graphic.

## Capabilities and Constraints

- Astro site on Cloudflare Workers; React islands for interactive parts.
- The site cannot verify that a Typeform application was submitted; sharing is not gated on submission.
- Fellowship logistics (dates, duration, compensation, location, support) are not decided publicly and must not be stated.

## Brand Commitments

- Name: Kalaris Labs; programme name: Kalaris Labs Fellowship.
- Never use the term "agent-powered".
- Values stated on the site: agency, curiosity, shared knowledge, commitment.

## Evidence on Hand

- Fellowship graphic: `public/fellowship/kalaris labs fellowship.png` (web copies `fellowship-poster.webp`, `fellowship-poster-960.webp`).
- Brand marks: `public/kalaris-wordmark.png`, `public/fellowship/kalaris-mark.webp`.
- Manifesto: `manifesto.md`. Company copy: `src/data/company.ts`.
- No fellow testimonials, alumni, cohort sizes, or outcomes exist; do not invent them.

## Product Principles

1. Agency over credentials: invite people by what they do, not by titles or résumés.
2. State only decided facts; leave undecided programme details out rather than implying them.
3. Make the first action effortless and a little fun, then get out of the way of the application.
4. Everything learned is shared, including the fellowship itself.
