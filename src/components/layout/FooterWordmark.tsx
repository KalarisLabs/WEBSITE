import { lazy, Suspense, useEffect, useState } from 'react';

// ogl and the dither shaders only load when the footer scrolls into view.
const DitherVeil = lazy(() => import('../react-bits/DitherVeil'));

const WORD = 'kalarislabs';
const WIDTH = 2400;
const HEIGHT = 480; // Matches the 5 / 1 aspect ratio of .footer-wordmark.
const INK = '#050505';

/**
 * Renders the bold wordmark to an image for DitherVeil. Drawn at runtime so
 * it uses the loaded Manrope face and needs no extra asset or CORS setup.
 */
async function renderWordmark(): Promise<string> {
  const font = `700 400px Manrope, ui-sans-serif, system-ui, sans-serif`;
  await document.fonts?.load(font).catch(() => undefined);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.font = font;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '-18px';
  const metrics = ctx.measureText(WORD);
  const scale = Math.min(
    (WIDTH * 0.96) / metrics.width,
    (HEIGHT * 0.92) /
      (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent),
  );
  const size = Math.floor(400 * scale);
  ctx.font = `700 ${size}px Manrope, ui-sans-serif, system-ui, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${-0.045 * size}px`;

  const fitted = ctx.measureText(WORD);
  const textHeight =
    fitted.actualBoundingBoxAscent + fitted.actualBoundingBoxDescent;
  const x = (WIDTH - fitted.width) / 2;
  const y = (HEIGHT - textHeight) / 2 + fitted.actualBoundingBoxAscent;

  // Ink-white into brand blue: the dither shows the tonal sweep, the reveal
  // shows the colour.
  const gradient = ctx.createLinearGradient(x, 0, x + fitted.width, 0);
  gradient.addColorStop(0, '#f0eee8');
  gradient.addColorStop(0.55, '#9db4ff');
  gradient.addColorStop(1, '#4d7cff');
  ctx.fillStyle = gradient;
  ctx.fillText(WORD, x, y);

  return canvas.toDataURL('image/png');
}

function supportsWebGL2() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

export default function FooterWordmark() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!supportsWebGL2()) return;
    let cancelled = false;
    renderWordmark()
      .then((url) => !cancelled && setSrc(url))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="footer-wordmark" role="img" aria-label="Kalaris Labs">
      {/* Static bold wordmark: shown before hydration and without WebGL2. */}
      <span className="footer-wordmark-text" aria-hidden="true">
        {WORD}
      </span>
      {src && (
        <Suspense fallback={null}>
          <DitherVeil
            src={src}
            fit="contain"
            pattern="floyd"
            pixelSize={3}
            inkColor={INK}
            paperColor="#f0eee8"
            contrast={1.2}
            revealRadius={140}
            softness={0.6}
            linger={1.2}
            rimColor="#4d7cff"
            rim={0.18}
            wander
            className="footer-wordmark-veil"
          />
        </Suspense>
      )}
    </div>
  );
}
