import type { CSSProperties, JSX } from 'react';

/** Types for the vendored React Bits DitherVeil component (DitherVeil.jsx). */
export interface DitherVeilProps {
  src?: string;
  fit?: 'contain' | 'cover';
  pattern?: 'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines';
  palette?: 'duotone' | 'rgb';
  pixelSize?: number;
  levels?: number;
  inkColor?: string;
  paperColor?: string;
  contrast?: number;
  brightness?: number;
  revealRadius?: number;
  softness?: number;
  linger?: number;
  rimColor?: string;
  rim?: number;
  reverse?: boolean;
  wander?: boolean;
  clickBurst?: boolean;
  className?: string;
  style?: CSSProperties;
}

declare function DitherVeil(props: DitherVeilProps): JSX.Element;
export default DitherVeil;
