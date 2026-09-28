'use client';

import { ParticleHoverButton } from './buttons/particle-hover-button';

interface Props {
  href: string;
  children: string;
  variant?: 'primary' | 'secondary';
}

export function SoraCtaButton({ href, children, variant = 'primary' }: Props) {
  return (
    <ParticleHoverButton className="sora-cta-particle">
      <a className={`button button-${variant}`} href={href}>
        {children}
      </a>
    </ParticleHoverButton>
  );
}
