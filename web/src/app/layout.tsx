import type { Metadata, Viewport } from 'next';
import { jakarta, nastaliq, nastaliqLite } from '@/lib/fonts';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Dukaan — Every shop on your street, one app', template: '%s | Dukaan' },
  description:
    'Book a seat at your barber, pre-order ration from your kiryana and pay local shops directly by QR. Free for customers, 0% commission for shops.',
  applicationName: site.name,
  openGraph: { type: 'website', siteName: site.name, images: [{ url: '/og.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
  other: { 'google-play-app': `app-id=${site.androidPackage}` },
};

export const viewport: Viewport = { themeColor: '#0B6E4F', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${nastaliq.variable} ${nastaliqLite.variable}`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
