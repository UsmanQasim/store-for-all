import localFont from 'next/font/local';

// (next/font options must be literals, so the Urdu unicode-range is repeated below.)

// Self-hosted at build time (no Google Fonts request), with size-adjusted fallbacks to avoid layout shift.
export const jakarta = localFont({
  src: '../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  weight: '200 800',
  variable: '--font-jakarta',
  display: 'swap',
});

// Only Arabic-script glyphs — the browser downloads it only on pages that actually show Urdu text.
export const nastaliq = localFont({
  // One weight covers 400–800: Nastaliq bold adds ~160 KB for a barely visible difference.
  src: '../../node_modules/@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-400-normal.woff2',
  weight: '400 800',
  variable: '--font-urdu',
  display: 'swap',
  preload: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0898-08E1, U+08E3-08FF, U+200C-200E, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC' }],
});

// ~80 KB subset covering only the Urdu words on English pages (built by scripts/subset-urdu.py).
export const nastaliqLite = localFont({
  src: '../fonts/nastaliq-lite-400.woff2',
  weight: '400 800',
  variable: '--font-urdu-lite',
  display: 'swap',
  preload: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0898-08E1, U+08E3-08FF, U+200C-200E, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC' }],
});
