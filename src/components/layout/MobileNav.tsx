import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLink {
  label: string;
  href: string;
  section?: string;
}

const primaryLinks: NavLink[] = [
  { label: 'Research', href: '/research' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Products', href: '/products' },
  { label: 'Manifesto', href: '/manifesto' },
  { label: 'Join Us', href: '/careers' },
];

const secondaryLinks: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Brand & Media', href: '/brand' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Supported Tech', href: '/support' },
  { label: 'Customer Stories', href: '/customer-stories' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Programs & Grants', href: '/programs' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <div className="mobile-nav-container">
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className={`hamburger-bar ${isOpen ? 'open' : ''}`} />
        <span className={`hamburger-bar ${isOpen ? 'open' : ''}`} />
        <span className={`hamburger-bar ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-nav-inner">
              <div className="mobile-nav-section">
                <span className="mobile-nav-heading">PAGES</span>
                <div className="mobile-nav-links">
                  {primaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="mobile-nav-item primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mobile-nav-divider" />

              <div className="mobile-nav-section">
                <span className="mobile-nav-heading">SECTIONS & ECOSYSTEM</span>
                <div className="mobile-nav-grid">
                  {secondaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="mobile-nav-item secondary"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mobile-nav-footer">
                <span className="mobile-nav-tagline">AI infrastructure for scientific discovery.</span>
                <a href="/llms.txt" className="mobile-nav-agent-link">
                  [agent: llms.txt]
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .mobile-nav-container {
          display: none;
        }

        @media (max-width: 860px) {
          .mobile-nav-container {
            display: block;
          }
        }

        .mobile-nav-toggle {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          width: 2rem;
          height: 2rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.3rem;
          z-index: 200;
        }

        .hamburger-bar {
          width: 1.4rem;
          height: 1.5px;
          background-color: var(--ink);
          transition: all 0.2s ease-in-out;
          transform-origin: 1px;
        }

        .hamburger-bar.open:nth-child(1) {
          transform: rotate(45deg);
        }

        .hamburger-bar.open:nth-child(2) {
          opacity: 0;
        }

        .hamburger-bar.open:nth-child(3) {
          transform: rotate(-45deg);
        }

        .mobile-nav-overlay {
          position: fixed;
          top: var(--header-height);
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--paper);
          border-top: 1px solid var(--rule);
          padding: var(--space-6) var(--space-6);
          overflow-y: auto;
          z-index: 150;
        }

        .mobile-nav-inner {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          max-width: 28rem;
          margin-inline: auto;
        }

        .mobile-nav-heading {
          display: block;
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--muted-ink);
          margin-bottom: var(--space-3);
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .mobile-nav-item.primary {
          font-family: var(--font-sans);
          font-size: var(--text-xl);
          font-weight: 500;
          color: var(--ink);
          text-decoration: none;
        }

        .mobile-nav-divider {
          height: 1px;
          background: var(--rule-light);
        }

        .mobile-nav-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .mobile-nav-item.secondary {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          color: var(--muted-ink);
          text-decoration: none;
        }

        .mobile-nav-item.secondary:hover {
          color: var(--kalari-green);
        }

        .mobile-nav-footer {
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--rule-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          color: var(--muted-ink);
        }

        .mobile-nav-agent-link {
          font-family: var(--font-mono);
          color: var(--kalari-green);
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
