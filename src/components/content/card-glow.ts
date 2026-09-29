import { borderGlowStyle } from '../react-bits/border-glow';

/** BorderGlow tuned to the site's blue accents for blog and research cards. */
export const cardGlowStyle = borderGlowStyle({
  edgeSensitivity: 30,
  glowColor: '224 100 75',
  glowRadius: 28,
  glowIntensity: 0.9,
  coneSpread: 25,
  colors: ['#4d7cff', '#a9bcff', '#7da0ff'],
  fillOpacity: 0.3,
});
