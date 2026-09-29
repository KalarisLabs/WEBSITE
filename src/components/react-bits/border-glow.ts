/**
 * BorderGlow from React Bits (reactbits.dev), ported to plain DOM so static
 * Astro cards get the effect without hydrating a React island per card.
 *
 * Markup: add `border-glow-card` to the card, put `<span class="edge-light" />`
 * as its first child, apply `borderGlowStyle()` as its inline style, and call
 * `initBorderGlow()` once from a client script. Base card visuals (background,
 * border, corner radius) stay with the card's own classes, which replaces the
 * original `backgroundColor` and `borderRadius` props; set `--card-bg` in CSS
 * to match the card surface.
 */

export interface BorderGlowOptions {
  /** How close the pointer must be to the edge for the glow (0-100). */
  edgeSensitivity?: number;
  /** HSL values for the glow colour, as "H S L". */
  glowColor?: string;
  /** How far the outer glow extends beyond the card in pixels. */
  glowRadius?: number;
  /** Multiplier for glow opacity (0.1-3.0). */
  glowIntensity?: number;
  /** Width of the directional cone mask as a percentage (5-45). */
  coneSpread?: number;
  /** Three hex colours for the mesh-gradient border. */
  colors?: [string, string, string];
  /** Opacity of the gradient fill near the edges. */
  fillOpacity?: number;
}

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return {
    h: parseFloat(match[1]!),
    s: parseFloat(match[2]!),
    l: parseFloat(match[3]!),
  };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  return keys.map(
    (key, i) =>
      `--glow-color${key}: hsl(${base} / ${Math.min(opacities[i]! * intensity, 100)}%)`,
  );
}

const GRADIENT_POSITIONS = [
  '80% 55%',
  '69% 34%',
  '8% 6%',
  '41% 38%',
  '86% 85%',
  '82% 18%',
  '51% 4%',
];
const GRADIENT_KEYS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: readonly string[]) {
  const vars = GRADIENT_KEYS.map((key, i) => {
    const color = colors[Math.min(COLOR_MAP[i]!, colors.length - 1)];
    return `--gradient-${key}: radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`;
  });
  vars.push(`--gradient-base: linear-gradient(${colors[0]} 0 100%)`);
  return vars;
}

export function borderGlowStyle({
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}: BorderGlowOptions = {}): string {
  return [
    `--edge-sensitivity: ${edgeSensitivity}`,
    `--glow-padding: ${glowRadius}px`,
    `--cone-spread: ${coneSpread}`,
    `--fill-opacity: ${fillOpacity}`,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  ].join('; ');
}

function edgeProximity(width: number, height: number, x: number, y: number) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
  const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function cursorAngle(width: number, height: number, x: number, y: number) {
  const dx = x - width / 2;
  const dy = y - height / 2;
  if (dx === 0 && dy === 0) return 0;
  const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

let initialized = false;

/** Tracks the pointer for every `.border-glow-card` via one listener. */
export function initBorderGlow(): void {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;

  let frame = 0;
  let pending: { card: HTMLElement; x: number; y: number } | null = null;

  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const card = (event.target as Element | null)?.closest<HTMLElement>(
        '.border-glow-card',
      );
      if (!card) return;

      pending = { card, x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pending) return;
        const { card: target, x, y } = pending;
        pending = null;

        const rect = target.getBoundingClientRect();
        const localX = x - rect.left;
        const localY = y - rect.top;
        const edge = edgeProximity(rect.width, rect.height, localX, localY);
        const angle = cursorAngle(rect.width, rect.height, localX, localY);
        target.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
        target.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
      });
    },
    { passive: true },
  );
}
