import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Chrome';
import { Icon } from '@/components/Icon';
import { listShops } from '@/lib/db';
import { categoryOf } from '@/lib/format';
import { site } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Local shops on Dukaan — barbers, kiryana, bakeries & more',
  description: 'Browse neighbourhood shops on Dukaan by city: barbers and salons you can book, kiryana and bakeries you can pre-order from, and their prices.',
  alternates: { canonical: '/shops' },
};

export default async function Shops() {
  const shops = await listShops().catch(() => []);
  const byCity = new Map<string, typeof shops>();
  for (const s of shops) {
    const c = s.city || 'Other';
    byCity.set(c, [...(byCity.get(c) ?? []), s]);
  }
  return (
    <>
      <SiteHeader />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">Shops on Dukaan</h1>
        <p className="text-text-muted mt-2 max-w-2xl">Neighbourhood shops you can book, pre-order from and pay directly. Open any shop to see its prices, timings and payment details.</p>
        {byCity.size === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-primary/30 bg-white p-8 sm:p-12 text-center">
            <span className="inline-flex w-16 h-16 rounded-2xl bg-primary-soft text-primary items-center justify-center">
              <Icon name="storefront" className="text-[32px]" />
            </span>
            <h2 className="text-xl font-bold text-on-surface mt-4">No shops listed yet</h2>
            <p className="text-text-muted mt-1 max-w-md mx-auto">Be the first in your area — register your shop in the free app and it will appear here with its prices and timings.</p>
            <a href={site.playUrl} className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-secondary-container text-on-secondary-container font-bold">
              <Icon name="add_business" className="text-[20px]" />
              Register your shop (free)
            </a>
          </div>
        ) : null}
        {[...byCity].map(([city, list]) => (
          <section key={city} id={encodeURIComponent(city)} className="mt-10">
            <h2 className="text-xl font-bold text-on-surface mb-3">
              Shops in {city} <span className="text-text-muted text-base font-medium">({list.length})</span>
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((s) => (
                <li key={s.slug}>
                  <Link href={`/s/${s.slug}`} className="flex gap-3 items-center p-4 rounded-2xl bg-white border border-border-hairline/70 shadow-xs hover:shadow-md transition-shadow">
                    <span className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center overflow-hidden shrink-0">
                      {s.logo_url ? <img src={s.logo_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Icon name={categoryOf(s.category_slug).icon} className="text-[24px]" />}
                    </span>
                    <span className="min-w-0">
                      <b className="block text-on-surface truncate">{s.name}</b>
                      <span className="block text-xs text-text-muted truncate">
                        {[s.area, s.rating_count ? `★ ${Number(s.rating_avg).toFixed(1)}` : null].filter(Boolean).join(' • ') || s.tagline}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
