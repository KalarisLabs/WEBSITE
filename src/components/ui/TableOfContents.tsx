import { useState, useEffect } from 'react';

export interface TocHeading {
  slug: string;
  text: string;
  depth: number;
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeSlug, setActiveSlug] = useState<string>(headings[0]?.slug || '');

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -65% 0%',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  return (
    <nav className="flex flex-col gap-3 font-sans" aria-label="Table of contents">
      <h4 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold m-0">
        On this page
      </h4>
      <div className="flex flex-col gap-1 border-l border-neutral-800/80 pl-3">
        {headings.map((heading) => {
          const isActive = activeSlug === heading.slug;
          return (
            <a
              key={heading.slug}
              href={`#${heading.slug}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.slug);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 85;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                  setActiveSlug(heading.slug);
                  history.pushState(null, '', `#${heading.slug}`);
                }
              }}
              className={`text-[13px] leading-snug transition-all duration-150 block py-1 no-underline ${
                heading.depth === 3 ? 'pl-3' : ''
              } ${
                isActive
                  ? 'text-white font-medium -ml-[13px] pl-3 border-l-2 border-[#1B4D3E] text-emerald-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {heading.text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
