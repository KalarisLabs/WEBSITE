'use client';

// Adapted from rare-ui's hook-sidebar (swamimalode07/rare-ui) for Astro:
// plain anchors instead of next/link, the active item comes from a prop or a
// scroll spy, and hover can be rendered with the Sora Highlight primitive.

import { motion, useReducedMotion } from 'motion/react';
import {
  Component,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Highlight,
  HighlightItem,
} from '@/components/sora-ui/effects/highlight';
import { cn } from '@/lib/utils/cn';

const CORNER = 6;

// Hover effects are decoration: if one throws, keep the links on screen
// instead of letting React unmount the whole navigation island.
class DecorationBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
const DASH =
  'repeating-linear-gradient(to top, transparent 0 2px, currentColor 2px 4px)';

export interface HookSidebarItem {
  label: string;
  href: string;
  /** Indent level, e.g. 1 for an h3 below an h2. */
  depth?: number;
}

export type HookSidebarProps = Omit<ComponentProps<'nav'>, 'onChange'> & {
  items: HookSidebarItem[];
  label?: string;
  /** Href of the active item. Ignored when `spy` is enabled. */
  activeHref?: string | undefined;
  /** Track `#hash` targets on the page and mark the visible one as active. */
  spy?: boolean;
  /** Render a sliding hover pill behind items. */
  highlight?: boolean;
  color?: string;
  dashed?: boolean;
  itemClassName?: string;
};

function Rail({
  from = 0,
  y,
  visible,
  color,
  dashed,
  className,
}: {
  from?: number;
  y: number | null;
  visible: boolean;
  color?: string | undefined;
  dashed: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const travel = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 };

  return (
    <motion.span
      aria-hidden
      initial={false}
      style={{ color }}
      animate={{ opacity: visible && y !== null ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2 }}
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <motion.span
        initial={false}
        animate={{ top: from, height: Math.max(0, (y ?? 0) - CORNER - from) }}
        transition={travel}
        style={
          dashed
            ? { backgroundImage: DASH }
            : { backgroundColor: 'currentColor' }
        }
        className="absolute left-0.5 w-px"
      />
      <motion.svg
        initial={false}
        animate={{ top: (y ?? 0) - CORNER }}
        transition={travel}
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="none"
        className="absolute left-0.5"
      >
        <path
          d="M0.5 0a6 6 0 0 0 6 6H12"
          stroke="currentColor"
          strokeDasharray={dashed ? '2 2' : undefined}
        />
      </motion.svg>
    </motion.span>
  );
}

function useScrollSpy(enabled: boolean, hrefs: string[]) {
  const [active, setActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    const targets = hrefs
      .filter((href) => href.startsWith('#'))
      .map((href) => document.getElementById(decodeURIComponent(href.slice(1))))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // The active section is the last one whose top has crossed 30% of the
    // viewport, which stays stable for long sections and short trailing ones.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) current = target;
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = targets[targets.length - 1];
      setActive(current ? `#${current.id}` : undefined);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled, hrefs.join('|')]);

  return active;
}

export function HookSidebar({
  items,
  label,
  activeHref,
  spy = false,
  highlight = false,
  color = 'var(--blue)',
  dashed = true,
  className,
  itemClassName,
  ...props
}: HookSidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [centers, setCenters] = useState<number[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);

  const spiedHref = useScrollSpy(
    spy,
    items.map((item) => item.href),
  );
  const currentHref = spy ? spiedHref : activeHref;
  const activeIndex = items.findIndex((item) => item.href === currentHref);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // offsetTop is relative to the nearest positioned ancestor, which is the
    // list itself or the Highlight container that exactly overlays it.
    const measure = () =>
      setCenters(
        itemRefs.current.map((el) =>
          el ? el.offsetTop + el.offsetHeight / 2 : 0,
        ),
      );

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items.length]);

  const activeY = activeIndex < 0 ? null : (centers[activeIndex] ?? null);
  const hoverY = hoverIndex === null ? null : (centers[hoverIndex] ?? null);

  // Above the active row the accent line already covers the span, so only
  // the corner is drawn.
  const hoverFrom =
    activeY !== null && hoverY !== null && hoverY <= activeY
      ? Math.max(0, hoverY - CORNER)
      : (activeY ?? 0);

  const rows = items.map((item, index) => {
    const isActive = index === activeIndex;
    return (
      <a
        key={item.href}
        ref={(el) => {
          itemRefs.current[index] = el;
        }}
        href={item.href}
        data-slot="hook-sidebar-item"
        data-active={isActive}
        aria-current={isActive ? (spy ? 'location' : 'page') : undefined}
        onMouseEnter={() => {
          setHoverIndex(index);
          setPointerInside(true);
        }}
        onFocus={() => {
          setHoverIndex(index);
          setFocusInside(true);
        }}
        onBlur={() => setFocusInside(false)}
        style={
          item.depth ? { paddingLeft: `${1.25 + item.depth * 0.75}rem` } : {}
        }
        className={cn(
          'relative z-1 block py-1.5 pr-2 pl-5 text-left transition-colors duration-200 motion-reduce:transition-none',
          isActive
            ? 'text-foreground'
            : 'text-foreground/50 hover:text-foreground/85',
          itemClassName,
        )}
      >
        {item.label}
      </a>
    );
  });

  return (
    <nav
      data-slot="hook-sidebar"
      aria-label={label}
      className={cn('flex flex-col', className)}
      {...props}
    >
      {label && (
        <span
          data-slot="hook-sidebar-label"
          className="text-foreground/45 pb-3 pl-0.5 font-mono text-[0.6rem] tracking-[0.14em] uppercase"
        >
          {label}
        </span>
      )}

      <div
        ref={listRef}
        onMouseLeave={() => {
          setPointerInside(false);
          setHoverIndex(null);
        }}
        className="relative flex flex-col"
      >
        <Rail
          from={hoverFrom}
          y={hoverY}
          visible={(pointerInside || focusInside) && hoverIndex !== activeIndex}
          dashed={dashed}
          className="text-foreground/30"
        />
        <Rail
          y={activeY}
          visible={activeY !== null}
          color={color}
          dashed={dashed}
        />

        {highlight ? (
          <DecorationBoundary fallback={rows}>
            <Highlight
              mode="parent"
              trigger="hover"
              exitDelay={80}
              boundsOffset={{ left: 14, width: -14 }}
              containerClassName="flex flex-col"
              className="rounded-sm bg-white/[0.06]"
            >
              {/* Wrapper mode keeps the anchor's own ref, which the rail
                measures; asChild would replace it. */}
              {rows.map((row) => (
                <HighlightItem key={row.key} value={String(row.key)}>
                  {row as ReactElement}
                </HighlightItem>
              ))}
            </Highlight>
          </DecorationBoundary>
        ) : (
          rows
        )}
      </div>
    </nav>
  );
}
