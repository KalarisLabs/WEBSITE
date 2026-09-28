import sharp from 'sharp';

async function generateOgImage() {
  const bannerWidth = 1060;
  const bannerHeight = Math.round((bannerWidth * 173) / 1024); // ~179px

  // Resize banner and apply rounded corners
  const roundedCornersSvg = Buffer.from(`
    <svg><rect x="0" y="0" width="${bannerWidth}" height="${bannerHeight}" rx="12" ry="12"/></svg>
  `);

  const processedBanner = await sharp('./public/images/kalaris-hero-banner.png')
    .resize(bannerWidth, bannerHeight)
    .composite([
      {
        input: roundedCornersSvg,
        blend: 'dest-in',
      },
    ])
    .toBuffer();

  const bannerX = Math.round((1200 - bannerWidth) / 2); // 70
  const bannerY = 60;

  // Background and content SVG
  const backgroundSvg = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="15%" r="65%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#08080a" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#1e293b" stop-opacity="0.2"/>
        </linearGradient>
        <linearGradient id="bannerFrameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.15"/>
        </linearGradient>
      </defs>

      <!-- Background color & ambient radial glow -->
      <rect width="1200" height="630" fill="#08080a"/>
      <rect width="1200" height="630" fill="url(#glow)"/>

      <!-- Subtle technical grid lines -->
      <line x1="70" y1="0" x2="70" y2="630" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
      <line x1="1130" y1="0" x2="1130" y2="630" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
      <line x1="0" y1="530" x2="1200" y2="530" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>

      <!-- Outer Card Border -->
      <rect x="36" y="32" width="1128" height="566" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="1.2"/>

      <!-- Banner Header Frame with subtle glow border -->
      <rect x="${bannerX - 1}" y="${bannerY - 1}" width="${bannerWidth + 2}" height="${bannerHeight + 2}" rx="13" fill="none" stroke="url(#bannerFrameGrad)" stroke-width="1.5"/>

      <!-- Content Section below the banner header -->
      <g transform="translate(70, 305)">
        <!-- Eyebrow -->
        <rect width="210" height="28" rx="14" fill="#1e293b" fill-opacity="0.7" stroke="#3b82f6" stroke-opacity="0.35"/>
        <text x="105" y="18" fill="#60a5fa" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" text-anchor="middle">RESEARCH INFRASTRUCTURE</text>

        <!-- Main Title / Tagline -->
        <text x="0" y="70" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" letter-spacing="-0.5">
          Recursive, self-improving infrastructure
        </text>
        <text x="0" y="112" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="400" letter-spacing="-0.5">
          for scientific research.
        </text>

        <!-- Descriptive Subtitle -->
        <text x="0" y="165" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="18">
          In-context recursive learning • Multi-domain harnesses • Continuous discovery
        </text>
      </g>

      <!-- Bottom Bar: Metadata & Canonical URL -->
      <g transform="translate(70, 565)">
        <text x="0" y="0" fill="#3b82f6" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" letter-spacing="0.5">kalarislabs.com</text>
        <text x="1060" y="0" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" text-anchor="end">Kalaris Labs Research Notes</text>
      </g>
    </svg>
  `);

  await sharp(backgroundSvg)
    .composite([
      {
        input: processedBanner,
        top: bannerY,
        left: bannerX,
      },
    ])
    .png({ quality: 95 })
    .toFile('./public/og-image.png');

  console.log(
    'Successfully generated ./public/og-image.png with hero banner header!',
  );
}

generateOgImage().catch(console.error);
