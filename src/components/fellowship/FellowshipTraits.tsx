import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import FolderComponent from '@/components/ui/folder-component';
import { FELLOW_TRAITS } from '@/lib/fellowship';
import { trackEvent } from '@/lib/integrations/posthog';

const TRAITS = FELLOW_TRAITS;

/** "What we look for": a folder that opens onto the four traits. */
export default function FellowshipTraits() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) trackEvent('fellowship_traits_opened');
  }

  return (
    <div className="fellowship-traits-grid" data-md-skip>
      <div className="fellowship-traits-copy">
        <h2 id="traits-heading">Are you in that?</h2>
        <p className="fellowship-traits-lede">
          Four things we look for in every fellow.{' '}
          {open ? 'Recognise yourself?' : 'Open the folder to see them.'}
        </p>
        {/* On small screens the card text is too small, so list it here too. */}
        {open && compact ? (
          <dl className="fellowship-traits-list">
            {TRAITS.map((trait) => (
              <div key={trait.title}>
                <dt>{trait.title}</dt>
                <dd>{trait.body}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <a
          href="#register"
          className="button button-primary fellowship-traits-cta"
          data-visible={open ? 'true' : undefined}
          tabIndex={open ? undefined : -1}
          aria-hidden={open ? undefined : true}
          onClick={() => trackEvent('fellowship_traits_yes')}
        >
          Yes, that&rsquo;s me. Pick your hats <ArrowUp size={14} aria-hidden />
        </a>
      </div>
      <div className="fellowship-folder">
        <FolderComponent
          color="black"
          size={compact ? 'sm' : 'md'}
          spread={compact ? 0.62 : 1}
          items={TRAITS}
          label="What we look for: open the folder"
          onOpenChange={handleOpenChange}
          className="items-end"
        />
      </div>
    </div>
  );
}
