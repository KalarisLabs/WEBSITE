import { useState, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ShareArticleBarProps {
  title: string;
  url?: string;
}

export default function ShareArticleBar({ title, url }: ShareArticleBarProps) {
  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Hacker News',
      href: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
      icon: (
        <span className="font-mono font-bold text-xs leading-none">Y</span>
      ),
    },
  ];

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] tracking-wider uppercase text-[#6B7280] font-mono font-semibold">
          Share this article
        </span>
        <div className="flex items-center gap-2">
          {shareLinks.map((link) => (
            <Tooltip.Root key={link.name}>
              <Tooltip.Trigger asChild>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${link.name}`}
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] flex items-center justify-center transition-colors shadow-xs"
                >
                  {link.icon}
                </a>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  className="z-50 px-2 py-1 text-[11px] font-mono text-white bg-[#111827] border border-[#374151] rounded shadow-md animate-in fade-in-0 zoom-in-95"
                >
                  Share on {link.name}
                  <Tooltip.Arrow className="fill-[#111827]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}

          {/* Copy Link Button */}
          <Tooltip.Root open={copied ? true : undefined}>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy link to article"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-[#1B4D3E] border-[#1B4D3E] text-white'
                    : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                }`}
              >
                {copied ? (
                  <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                sideOffset={6}
                className="z-50 px-2 py-1 text-[11px] font-mono text-white bg-[#111827] border border-[#374151] rounded shadow-md animate-in fade-in-0 zoom-in-95"
              >
                {copied ? 'Link copied!' : 'Copy link'}
                <Tooltip.Arrow className="fill-[#111827]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
