---
name: gsap-motion
description: GSAP and Framer Motion animation guidelines for Kalaris Labs. Enforces restrained, purposeful editorial motion and strict prefers-reduced-motion accessibility.
---

# GSAP & Motion — Agent Skill

This skill governs the implementation of animations using **GSAP** and **Framer Motion** across the Kalaris Labs site.

---

## 1. Philosophical Mandate: Restraint Over Spectacle

Kalaris Labs is an editorial, research-driven institution. Motion must serve comprehension and physical feedback—never decorative dazzle or distraction.

- **Diagrams are Static by Default**: Scientific diagrams (such as the Kalari feedback loop) must be immediately legible with zero JavaScript. Motion is an optional, gentle enhancement.
- **No Continuous Looping Spectacle**: Avoid continuous spinning icons, pulsing background blobs, or particle fields that drain CPU/battery and distract readers.
- **Immediate Content Delivery**: Critical text must never be hidden behind 1-second entrance fade-ins. Readers and search bots must see the prose instantaneously.

---

## 2. Tool Specialization

| Tool | Primary Use Case in Kalaris Stack |
|------|-----------------------------------|
| **GSAP** (`gsap`) | Complex SVG path animations, sequential architectural stack highlights, and timeline-controlled scientific loop visualizations. |
| **Framer Motion** (`framer-motion`) | React interactive islands: mobile navigation slide-in, accordion transitions, filter tab indicator morphs, and springy pill button tap feedback. |
| **Pure CSS Transitions** | Navigation link hover underlines, button background hover states, header translucency on scroll. |

---

## 3. The Reduced Motion Mandate

Every single animated component **MUST** respect the user's accessibility preferences:

### In CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### In Framer Motion:
```tsx
import { useReducedMotion } from 'framer-motion';

export function AnimatedDrawer({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

### In GSAP:
```typescript
import { gsap } from 'gsap';

export function initLoopAnimation(selector: string) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // Leave static
  }

  gsap.fromTo(selector, 
    { strokeDashoffset: 100 }, 
    { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' }
  );
}
```
