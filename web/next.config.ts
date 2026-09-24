import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Inline the (small, purged) Tailwind CSS into the HTML — removes the render-blocking stylesheet request.
  experimental: { inlineCss: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }] },
  // Old static-site URLs (the app and printed posters may still link to them).
  async redirects() {
    return ['privacy', 'terms', 'delete-account', 'community-guidelines'].map((p) => ({ source: `/${p}.html`, destination: `/${p}`, permanent: true }));
  },
  async headers() {
    return [
      { source: '/.well-known/assetlinks.json', headers: [{ key: 'Content-Type', value: 'application/json' }, { key: 'Access-Control-Allow-Origin', value: '*' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
