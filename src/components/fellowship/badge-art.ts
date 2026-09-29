import { splitNameLines } from '@/lib/fellowship';

/**
 * Canvas artwork for the fellowship badge.
 *
 * The badge model's card UVs use a 1024×1024 atlas (GLTF, no Y flip):
 * the front face samples the left panel (x 0–512, y 0–773) and the back face
 * samples the right panel (x 512–1024, y 0–773). Both panels are drawn the
 * right way round; the model's UVs already account for the card turning.
 */
export const BADGE_ATLAS_SIZE = 1024;
export const BADGE_PANEL = { width: 512, height: 773 } as const;
export const BADGE_PLACEHOLDER_NAME = 'Your Name';

export const BADGE_WORDMARK_SRC = '/kalaris-wordmark.png';
export const BADGE_MARK_SRC = '/fellowship/kalaris-mark.webp';

const INK = '#f0eee8';
const BLACK = '#050505';
const BLUE = '#4d7cff';
/** Lighter blue for small type on the navy card, where #4d7cff reads faint. */
const BLUE_BRIGHT = '#8fadff';
const SUBTLE = '#8d8d93';
const LINE = 'rgba(240, 238, 232, 0.14)';
const SANS = 'Manrope, ui-sans-serif, system-ui, sans-serif';
const MONO = '"DM Mono", ui-monospace, monospace';

type Drawable = CanvasImageSource & { width: number; height: number };

export interface BadgeAssets {
  /** Kalaris wordmark (black on transparent); tinted per panel. */
  wordmark?: Drawable;
  /** Chrome sunburst brand mark (transparent background). */
  mark?: Drawable;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | undefined>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(undefined);
    image.src = src;
  });
}

let assetsPromise: Promise<BadgeAssets> | undefined;

/** Loads fonts and brand images once per page and shares the result. */
export function loadBadgeAssets(): Promise<BadgeAssets> {
  assetsPromise ??= Promise.all([
    typeof document !== 'undefined' && 'fonts' in document
      ? Promise.all([
          document.fonts.load(`800 64px ${SANS}`),
          document.fonts.load(`500 16px ${MONO}`),
        ]).catch(() => undefined)
      : undefined,
    loadImage(BADGE_WORDMARK_SRC),
    loadImage(BADGE_MARK_SRC),
  ]).then(([, wordmark, mark]) => ({
    ...(wordmark ? { wordmark } : {}),
    ...(mark ? { mark } : {}),
  }));
  return assetsPromise;
}

const tintCache = new WeakMap<Drawable, Map<string, HTMLCanvasElement>>();

function tint(image: Drawable, color: string): HTMLCanvasElement {
  let byColor = tintCache.get(image);
  if (!byColor) tintCache.set(image, (byColor = new Map()));
  const cached = byColor.get(color);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  byColor.set(color, canvas);
  return canvas;
}

function drawWordmark(
  ctx: CanvasRenderingContext2D,
  assets: BadgeAssets,
  color: string,
  x: number,
  y: number,
  width: number,
) {
  if (assets.wordmark) {
    const height = (assets.wordmark.height / assets.wordmark.width) * width;
    ctx.drawImage(tint(assets.wordmark, color), x, y, width, height);
    return;
  }
  // Text fallback while the image is unavailable.
  ctx.fillStyle = color;
  ctx.font = `800 ${Math.round(width / 6.5)}px ${SANS}`;
  ctx.textBaseline = 'top';
  ctx.fillText('KALARIS LABS', x, y + width / 14);
}

function drawMark(
  ctx: CanvasRenderingContext2D,
  assets: BadgeAssets,
  x: number,
  y: number,
  size: number,
) {
  if (!assets.mark) return;
  ctx.drawImage(assets.mark, x, y, size, size);
}

function fitNameLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number,
  maxHeight: number,
) {
  for (let size = 84; size > 26; size -= 2) {
    ctx.font = `800 ${size}px ${SANS}`;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest <= maxWidth && lines.length * size * 1.02 <= maxHeight) {
      return size;
    }
  }
  return 26;
}

/** Diagonal holographic sheen, the "foil" on the card. */
function drawSheen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sheen = ctx.createLinearGradient(0, h * 0.15, w, h * 0.55);
  sheen.addColorStop(0, 'rgba(77, 124, 255, 0)');
  sheen.addColorStop(0.42, 'rgba(77, 124, 255, 0.10)');
  sheen.addColorStop(0.5, 'rgba(198, 121, 196, 0.12)');
  sheen.addColorStop(0.58, 'rgba(255, 176, 5, 0.08)');
  sheen.addColorStop(0.7, 'rgba(56, 189, 248, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Front panel: wordmark, chrome mark, fellow name, and the hats worn. */
export function drawBadgeFront(
  ctx: CanvasRenderingContext2D,
  rawName: string,
  assets: BadgeAssets,
  hats: readonly string[] = [],
) {
  const { width: w, height: h } = BADGE_PANEL;
  const pad = 44;
  const name = rawName.trim() || BADGE_PLACEHOLDER_NAME;
  const isPlaceholder = !rawName.trim();

  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, w, h);

  // Blue glow behind the mark.
  const glow = ctx.createRadialGradient(
    w * 0.82,
    h * 0.3,
    10,
    w * 0.82,
    h * 0.3,
    w * 0.8,
  );
  glow.addColorStop(0, 'rgba(77, 124, 255, 0.34)');
  glow.addColorStop(1, 'rgba(77, 124, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Faint blueprint grid.
  ctx.strokeStyle = 'rgba(77, 124, 255, 0.07)';
  ctx.lineWidth = 1;
  for (let gx = 32; gx < w; gx += 32) {
    ctx.beginPath();
    ctx.moveTo(gx + 0.5, 0);
    ctx.lineTo(gx + 0.5, h);
    ctx.stroke();
  }
  for (let gy = 32; gy < h; gy += 32) {
    ctx.beginPath();
    ctx.moveTo(0, gy + 0.5);
    ctx.lineTo(w, gy + 0.5);
    ctx.stroke();
  }

  // Oversized chrome mark bleeding off the right edge.
  drawMark(ctx, assets, w - 250, 120, 330);

  drawSheen(ctx, w, h);

  drawWordmark(ctx, assets, INK, pad, 58, 176);

  ctx.fillStyle = BLUE_BRIGHT;
  ctx.font = `500 21px ${MONO}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('FELLOWSHIP', pad, 162);

  // Name block, bottom-aligned above the label.
  const nameBottom = h - 150;
  const lines = splitNameLines(name);
  const size = fitNameLines(ctx, lines, w - pad * 2, 250);
  const lineHeight = size * 1.02;
  ctx.fillStyle = isPlaceholder ? 'rgba(240, 238, 232, 0.35)' : INK;
  ctx.font = `800 ${size}px ${SANS}`;
  ctx.textBaseline = 'alphabetic';
  lines.forEach((line, i) => {
    ctx.fillText(line, pad, nameBottom - (lines.length - 1 - i) * lineHeight);
  });

  // Hats print in blue under the name; without any it reads as a plain fellow.
  ctx.fillStyle = hats.length > 0 ? BLUE_BRIGHT : SUBTLE;
  ctx.font = hats.length > 0 ? `500 25px ${MONO}` : `500 17px ${MONO}`;
  const hatLine =
    hats.length > 0 ? hats.join(' · ').toUpperCase() : 'KALARIS FELLOW';
  ctx.fillText(hatLine, pad, nameBottom + 40, w - pad * 2);

  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(pad, h - 80.5);
  ctx.lineTo(w - pad, h - 80.5);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText('kalarislabs.com/fellowship', pad, h - 42);
  drawMark(ctx, assets, w - pad - 36, h - 66, 36);
}

/** Back panel: centred chrome mark, mission line, and name. */
export function drawBadgeBack(
  ctx: CanvasRenderingContext2D,
  rawName: string,
  assets: BadgeAssets,
) {
  const { width: w, height: h } = BADGE_PANEL;
  const name = rawName.trim() || BADGE_PLACEHOLDER_NAME;

  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w / 2, 260, 10, w / 2, 260, w * 0.7);
  glow.addColorStop(0, 'rgba(77, 124, 255, 0.28)');
  glow.addColorStop(1, 'rgba(77, 124, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  drawMark(ctx, assets, (w - 220) / 2, 150, 220);
  drawSheen(ctx, w, h);

  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `500 16px ${MONO}`;
  ctx.fillText('SCIENTIFIC INFRASTRUCTURE', w / 2, 440);
  ctx.fillText('FOR EVERYONE, EVERYWHERE.', w / 2, 466);

  ctx.fillStyle = SUBTLE;
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText(name.toUpperCase().slice(0, 36), w / 2, h - 170);
  ctx.textAlign = 'start';

  drawWordmark(ctx, assets, INK, (w - 180) / 2, h - 130, 180);
}

/** Paints both panels into the 1024×1024 badge atlas. */
export function drawBadgeAtlas(
  canvas: HTMLCanvasElement,
  name: string,
  assets: BadgeAssets,
  hats: readonly string[] = [],
) {
  if (canvas.width !== BADGE_ATLAS_SIZE) canvas.width = BADGE_ATLAS_SIZE;
  if (canvas.height !== BADGE_ATLAS_SIZE) canvas.height = BADGE_ATLAS_SIZE;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, BADGE_ATLAS_SIZE, BADGE_ATLAS_SIZE);

  drawBadgeFront(ctx, name, assets, hats);
  ctx.save();
  ctx.translate(BADGE_PANEL.width, 0);
  drawBadgeBack(ctx, name, assets);
  ctx.restore();
}

/** Lanyard strip, repeated along the band's length. */
export function drawLanyard(canvas: HTMLCanvasElement) {
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0b0b0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 58px ${SANS}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('KALARIS LABS', 256, 66);
  ctx.fillStyle = BLUE;
  ctx.fillText('FELLOWSHIP', 768, 66);
}
