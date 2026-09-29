import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { ArrowUpRight, Check, Pencil } from 'lucide-react';
import {
  FELLOW_APPLIED_STORAGE_KEY,
  FELLOW_HATS,
  FELLOW_HATS_STORAGE_KEY,
  FELLOW_NAME_MAX_LENGTH,
  FELLOW_NAME_STORAGE_KEY,
  buildApplicationUrl,
  buildShareLinks,
  buildShareText,
  hatLabels,
  normalizeFellowName,
  normalizeHats,
  validateFellowName,
  type FellowHat,
} from '@/lib/fellowship';
import { trackEvent } from '@/lib/integrations/posthog';
import {
  BADGE_PANEL,
  BADGE_PLACEHOLDER_NAME,
  drawBadgeFront,
  loadBadgeAssets,
  type BadgeAssets,
} from './badge-art';
import { ShareIcon, type ShareNetwork } from './share-icons';

// three.js, rapier, and the model are split into their own chunk.
const Lanyard = lazy(() => import('@/components/react-bits/Lanyard'));

interface Props {
  /** Application form URL; name and hats are appended as query params. */
  applicationUrl?: string | undefined;
  /** Heading and introduction, rendered above the stations. */
  children?: ReactNode;
}

const SHARE_TARGETS: { network: ShareNetwork; label: string }[] = [
  { network: 'x', label: 'X' },
  { network: 'linkedin', label: 'LinkedIn' },
  { network: 'whatsapp', label: 'WhatsApp' },
];

// Storage is a convenience; every read and write tolerates it being blocked.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // The flow works without persistence.
  }
}

function readStoredName(): string | null {
  const stored = readStorage(FELLOW_NAME_STORAGE_KEY);
  if (!stored) return null;
  const result = validateFellowName(stored);
  return result.ok ? result.name : null;
}

function readStoredHats(): FellowHat[] {
  return normalizeHats((readStorage(FELLOW_HATS_STORAGE_KEY) ?? '').split(','));
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

type StationState = 'done' | 'current' | undefined;

export default function FellowshipInterest({
  applicationUrl,
  children,
}: Props) {
  const [hats, setHats] = useState<FellowHat[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [swing, setSwing] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const applyRef = useRef<HTMLAnchorElement>(null);

  // Returning visitors keep their hats, name, and application state.
  useEffect(() => {
    const storedName = readStoredName();
    if (storedName) {
      setName(storedName);
      setDraft(storedName);
    }
    setHats(readStoredHats());
    setApplied(readStorage(FELLOW_APPLIED_STORAGE_KEY) === 'true');
  }, []);

  function toggleHat(hat: FellowHat, worn: boolean) {
    const next = normalizeHats(
      worn ? [...hats, hat] : hats.filter((id) => id !== hat),
    );
    setHats(next);
    writeStorage(FELLOW_HATS_STORAGE_KEY, next.join(',') || null);
    setSwing((count) => count + 1);
    trackEvent('fellowship_hat_toggled', { hat, worn });
  }

  function handlePrint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateFellowName(draft);
    if (!result.ok) {
      setError(result.error);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setName(result.name);
    writeStorage(FELLOW_NAME_STORAGE_KEY, result.name);
    setSwing((count) => count + 1);
    setAnnouncement(`Badge printed for ${result.name}.`);
    trackEvent('fellowship_interest_submitted', { hats });
    requestAnimationFrame(() => applyRef.current?.focus());
  }

  function handleEdit() {
    setName(null);
    writeStorage(FELLOW_NAME_STORAGE_KEY, null);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function handleApply() {
    setApplied(true);
    writeStorage(FELLOW_APPLIED_STORAGE_KEY, 'true');
    trackEvent('fellowship_application_opened', { hats });
  }

  // The badge previews the name while it is typed, capped to what fits.
  const badgeName =
    name ?? normalizeFellowName(draft).slice(0, FELLOW_NAME_MAX_LENGTH);
  const labels = useMemo(() => hatLabels(hats), [hats]);
  const href = buildApplicationUrl(name ?? '', applicationUrl, hats);
  const isEmail = href.startsWith('mailto:');
  const share = buildShareLinks(buildShareText(applied));

  const stations: StationState[] = [
    hats.length > 0 ? 'done' : 'current',
    name ? 'done' : hats.length > 0 || draft.trim() ? 'current' : undefined,
    applied ? 'done' : name ? 'current' : undefined,
  ];

  return (
    <div className="fellowship-register">
      <div className="fellowship-register-copy">
        {children}

        <ol className="fellowship-stations" data-md-skip>
          <li className="fellowship-station" data-state={stations[0]}>
            <fieldset className="fellowship-hats">
              <legend className="fellowship-station-title">
                <span className="fellowship-station-number" aria-hidden>
                  01
                </span>
                Pick your hats
              </legend>
              <p className="fellowship-hint">Choose every one you wear.</p>
              <div className="fellowship-hat-row">
                {FELLOW_HATS.map((hat) => {
                  const worn = hats.includes(hat.id);
                  return (
                    <label key={hat.id} className="fellowship-hat">
                      <input
                        type="checkbox"
                        name="hats"
                        value={hat.id}
                        checked={worn}
                        onChange={(e) => toggleHat(hat.id, e.target.checked)}
                      />
                      <span className="fellowship-hat-box" aria-hidden>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {hat.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>

          <li className="fellowship-station" data-state={stations[1]}>
            {name ? (
              <div className="fellowship-printed">
                <p className="fellowship-station-title">
                  <span className="fellowship-station-number" aria-hidden>
                    02
                  </span>
                  Printed for {name}
                </p>
                <button
                  type="button"
                  className="fellowship-edit"
                  onClick={handleEdit}
                >
                  <Pencil size={13} aria-hidden /> Change name
                </button>
              </div>
            ) : (
              <form onSubmit={handlePrint} noValidate>
                <label htmlFor={inputId} className="fellowship-station-title">
                  <span className="fellowship-station-number" aria-hidden>
                    02
                  </span>
                  Print your name
                </label>
                <p id={hintId} className="fellowship-hint">
                  It prints on the badge as you type. Grab the card and throw
                  it.
                </p>
                <div className="fellowship-field">
                  <input
                    ref={inputRef}
                    id={inputId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    maxLength={FELLOW_NAME_MAX_LENGTH + 8}
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : hintId}
                    required
                  />
                  <button type="submit" className="button button-secondary">
                    Print badge
                  </button>
                </div>
                <p id={errorId} className="fellowship-error" role="alert">
                  {error}
                </p>
              </form>
            )}
          </li>

          <li className="fellowship-station" data-state={stations[2]}>
            <p className="fellowship-station-title">
              <span className="fellowship-station-number" aria-hidden>
                03
              </span>
              Apply, then spread the word
            </p>
            <div className="fellowship-apply-row">
              <a
                ref={applyRef}
                className="button button-primary fellowship-apply"
                href={href}
                {...(isEmail
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' })}
                onClick={handleApply}
              >
                Apply to the fellowship <ArrowUpRight size={15} aria-hidden />
              </a>
              <div
                className="fellowship-share"
                role="group"
                aria-label="Share the fellowship"
              >
                <span className="fellowship-share-label" aria-hidden>
                  Share
                </span>
                {SHARE_TARGETS.map(({ network, label }) => (
                  <a
                    key={network}
                    className="fellowship-share-link"
                    href={share[network]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${label}`}
                    title={`Share on ${label}`}
                    onClick={() =>
                      trackEvent('fellowship_shared', { network, applied })
                    }
                  >
                    <ShareIcon network={network} />
                  </a>
                ))}
              </div>
            </div>
          </li>
        </ol>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div
        className="fellowship-badge"
        role="img"
        aria-label={`Kalaris Labs fellowship badge for ${badgeName || BADGE_PLACEHOLDER_NAME}${labels.length > 0 ? `, wearing ${labels.join(', ')}` : ''}`}
      >
        <BadgeStage name={badgeName} hats={labels} swing={swing} />
      </div>
    </div>
  );
}

function BadgeStage({
  name,
  hats,
  swing,
}: {
  name: string;
  hats: readonly string[];
  swing: number;
}) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  // Narrow stages pull the camera closer so the card stays legible.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    setWebgl(supportsWebGL());
    setCompact(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  // Until WebGL support is known, show the flat card so nothing jumps.
  if (!webgl) return <FlatBadge name={name} hats={hats} />;

  return (
    <BadgeErrorBoundary fallback={<FlatBadge name={name} hats={hats} />}>
      <Suspense fallback={<FlatBadge name={name} hats={hats} />}>
        <Lanyard
          name={name}
          hats={hats}
          position={compact ? [0, 0, 7.2] : [0, 0, 8]}
          gravity={[0, -40, 0]}
          swing={swing}
          className="h-[520px] md:h-[680px]"
        />
      </Suspense>
    </BadgeErrorBoundary>
  );
}

/**
 * Static 2D card for browsers without WebGL, while the 3D scene loads, or if
 * it fails. It still tilts towards the pointer and sways on its own.
 */
function FlatBadge({ name, hats }: { name: string; hats: readonly string[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [assets, setAssets] = useState<BadgeAssets>({});

  useEffect(() => {
    let cancelled = false;
    loadBadgeAssets().then((loaded) => {
      if (!cancelled) setAssets(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    element.width = BADGE_PANEL.width;
    element.height = BADGE_PANEL.height;
    drawBadgeFront(ctx, name, assets, hats);
  }, [name, hats, assets]);

  function tilt(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.setProperty(
      '--tilt-x',
      `${(-y * 14).toFixed(2)}deg`,
    );
    event.currentTarget.style.setProperty(
      '--tilt-y',
      `${(x * 18).toFixed(2)}deg`,
    );
    event.currentTarget.style.setProperty(
      '--sheen',
      `${((x + 0.5) * 100).toFixed(1)}%`,
    );
  }

  function reset(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty('--tilt-x');
    event.currentTarget.style.removeProperty('--tilt-y');
    event.currentTarget.style.removeProperty('--sheen');
  }

  return (
    <div className="fellowship-flat-stage">
      <span className="fellowship-flat-lanyard" aria-hidden />
      <div
        className="fellowship-flat-card"
        onPointerMove={tilt}
        onPointerLeave={reset}
      >
        <canvas ref={canvas} className="fellowship-flat-badge" />
        <span className="fellowship-flat-sheen" aria-hidden />
      </div>
    </div>
  );
}

class BadgeErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
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
