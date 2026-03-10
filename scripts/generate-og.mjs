import sharp from 'sharp';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f1117"/>
      <stop offset="100%" stop-color="#1a1f2e"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Orange left accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="#F56400"/>

  <!-- Histogram bars (decorative, bottom right) -->
  <g opacity="0.12">
    <rect x="780" y="390" width="48" height="180" rx="4" fill="#F56400"/>
    <rect x="840" y="310" width="48" height="260" rx="4" fill="#F56400"/>
    <rect x="900" y="250" width="48" height="320" rx="4" fill="#F56400"/>
    <rect x="960" y="180" width="48" height="390" rx="4" fill="#F56400"/>
    <rect x="1020" y="280" width="48" height="290" rx="4" fill="#F56400"/>
    <rect x="1080" y="360" width="48" height="210" rx="4" fill="#F56400"/>
    <rect x="1140" y="430" width="48" height="140" rx="4" fill="#F56400"/>
  </g>

  <!-- Logo mark -->
  <g transform="translate(80, 180)">
    <rect width="72" height="72" rx="16" fill="#F56400"/>
    <circle cx="31" cy="31" r="14" stroke="white" stroke-width="5" fill="none"/>
    <line x1="41" y1="41" x2="54" y2="54" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <line x1="25" y1="31" x2="37" y2="31" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <line x1="31" y1="25" x2="31" y2="37" stroke="white" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Title -->
  <text x="80" y="310" font-family="ui-monospace, monospace" font-size="72" font-weight="700" fill="white" letter-spacing="-1">Etsy Scout</text>

  <!-- Subtitle -->
  <text x="80" y="370" font-family="ui-monospace, monospace" font-size="28" fill="#94a3b8">Market research for 3D print &amp; laser cut sellers</text>

  <!-- Stat pills -->
  <g transform="translate(80, 420)">
    <rect width="200" height="44" rx="8" fill="#1e2535"/>
    <text x="16" y="28" font-family="ui-monospace, monospace" font-size="18" fill="#F56400">Avg price</text>
  </g>
  <g transform="translate(296, 420)">
    <rect width="200" height="44" rx="8" fill="#1e2535"/>
    <text x="16" y="28" font-family="ui-monospace, monospace" font-size="18" fill="#F56400">Top listings</text>
  </g>
  <g transform="translate(512, 420)">
    <rect width="220" height="44" rx="8" fill="#1e2535"/>
    <text x="16" y="28" font-family="ui-monospace, monospace" font-size="18" fill="#F56400">Favorites rank</text>
  </g>

  <!-- Bottom domain -->
  <text x="80" y="580" font-family="ui-monospace, monospace" font-size="22" fill="#475569">etsyscout.netlify.app</text>
</svg>
`;

sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toFile('./public/og-image.png')
  .then(() => console.log('OG image generated: public/og-image.png'))
  .catch(err => { console.error(err); process.exit(1); });
