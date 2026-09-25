import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Chrome';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="w-full max-w-xl mx-auto px-4 py-20 text-center">
        <span className="inline-flex w-16 h-16 rounded-full bg-primary-soft text-primary items-center justify-center">
          <Icon name="storefront" className="text-[32px]" />
        </span>
        <h1 className="text-2xl font-extrabold text-on-surface mt-4">This page or shop isn’t here</h1>
        <p className="text-text-muted mt-2">The QR code may be old, or the shop is no longer listed.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/shops" className="px-5 py-3 rounded-xl bg-primary text-white font-bold">Browse shops</Link>
          <Link href="/" className="px-5 py-3 rounded-xl bg-surface-container text-on-surface font-bold">Home</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
