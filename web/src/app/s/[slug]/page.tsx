import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { SiteFooter, SiteHeader } from '@/components/Chrome';
import { CopyButton, OpenInApp } from '@/components/client';
import { Icon } from '@/components/Icon';
import { getShop, listShops, type Item } from '@/lib/db';
import { categoryOf, DAYS, formatAccount, groupHours, money, PAYMENT_LABELS, PAYMENT_TONE } from '@/lib/format';
import { JsonLd } from '@/lib/jsonld';
import { site } from '@/lib/site';

// Every shop page is static HTML, refreshed in the background at most every 5 minutes (ISR).
export const revalidate = 300;

export async function generateStaticParams() {
  try {
    return (await listShops()).slice(0, 1000).map((s) => ({ slug: s.slug }));
  } catch {
    return []; // no Supabase env at build time → pages are generated on first visit
  }
}

const load = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{3,64}$/.test(slug)) return null;
  return getShop(slug);
});

const place = (s: { area: string | null; city: string | null }) => [s.area, s.city].filter(Boolean).join(', ');

export async function generateMetadata({ params }: PageProps<'/s/[slug]'>): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return { title: 'Shop not found', robots: { index: false } };
  const { shop, items } = data;
  const cat = shop.category?.name_en ?? 'Shop';
  const where = place(shop);
  const offers = items.slice(0, 3).map((i) => i.name).join(', ');
  const description = [shop.tagline || shop.description, offers && `${offers} and more`, `Book, pre-order and pay on ${site.name}.`]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 160);
  const image = [shop.cover_url, shop.logo_url].find((u) => u && /^https?:\/\//.test(u));
  return {
    title: `${shop.name} — ${cat}${where ? ` in ${where}` : ''}`,
    description,
    alternates: { canonical: `/s/${shop.slug}` },
    openGraph: { type: 'website', url: `/s/${shop.slug}`, title: shop.name, description, ...(image ? { images: [{ url: image }] } : {}) },
  };
}

export default async function ShopPage({ params }: PageProps<'/s/[slug]'>) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { shop, items, methods, reviews } = data;
  const services = items.filter((i) => i.kind === 'service');
  const products = items.filter((i) => i.kind === 'product');
  const meta = categoryOf(shop.category_slug);
  const hours = groupHours(shop.opening_hours);
  const where = place(shop);
  const url = `${site.url}/s/${shop.slug}`;
  const maps = shop.lat != null && shop.lng != null ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}` : shop.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.address} ${where}`)}` : null;

  const ld = {
    '@context': 'https://schema.org',
    '@type': meta.schema,
    '@id': `${url}#business`,
    name: shop.name,
    url,
    description: shop.description || shop.tagline || undefined,
    image: [shop.cover_url, shop.logo_url].filter(Boolean),
    telephone: shop.phone || undefined,
    currenciesAccepted: shop.currency,
    address: { '@type': 'PostalAddress', streetAddress: shop.address || undefined, addressLocality: shop.area || undefined, addressRegion: shop.city || undefined, addressCountry: shop.country_code },
    geo: shop.lat != null && shop.lng != null ? { '@type': 'GeoCoordinates', latitude: shop.lat, longitude: shop.lng } : undefined,
    openingHoursSpecification: DAYS.flatMap((d, i) =>
      (shop.opening_hours?.[d] ?? []).map((r) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}`, opens: r.open, closes: r.close })),
    ),
    aggregateRating: shop.rating_count > 0 ? { '@type': 'AggregateRating', ratingValue: Number(shop.rating_avg).toFixed(1), reviewCount: shop.rating_count, bestRating: 5 } : undefined,
    review: reviews.filter((r) => r.comment).slice(0, 5).map((r) => ({ '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }, author: { '@type': 'Person', name: r.author_name || 'Dukaan user' }, reviewBody: r.comment, datePublished: r.created_at.slice(0, 10) })),
    hasOfferCatalog: items.length
      ? { '@type': 'OfferCatalog', name: 'Menu & prices', itemListElement: items.slice(0, 50).map((i) => ({ '@type': 'Offer', price: i.price, priceCurrency: shop.currency, itemOffered: { '@type': i.kind === 'service' ? 'Service' : 'Product', name: i.name, description: i.description || undefined } })) }
      : undefined,
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shops', item: `${site.url}/shops` },
      ...(shop.city ? [{ '@type': 'ListItem', position: 2, name: shop.city, item: `${site.url}/shops#${encodeURIComponent(shop.city)}` }] : []),
      { '@type': 'ListItem', position: shop.city ? 3 : 2, name: shop.name, item: url },
    ],
  };

  const card = 'bg-surface-card rounded-2xl border border-border-hairline/70 shadow-xs';
  const btn = 'inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-bold transition-colors';

  return (
    <>
      <JsonLd data={ld} />
      <JsonLd data={crumbs} />
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <nav aria-label="Breadcrumb" className="text-xs text-text-muted py-4 flex gap-1.5 flex-wrap">
          <Link href="/shops" className="hover:text-primary">Shops</Link>
          {shop.city ? (
            <>
              <span aria-hidden>›</span>
              <Link href={`/shops#${encodeURIComponent(shop.city)}`} className="hover:text-primary">{shop.city}</Link>
            </>
          ) : null}
          <span aria-hidden>›</span>
          <span className="text-on-surface font-semibold">{shop.name}</span>
        </nav>

        {/* Identity */}
        <section className={`${card} overflow-hidden`}>
          <div className="h-36 sm:h-48 bg-gradient-to-br from-primary to-primary-pressed relative">
            {shop.cover_url ? <img src={shop.cover_url} alt="" className="w-full h-full object-cover" fetchPriority="high" /> : null}
          </div>
          <div className="px-5 sm:px-6 pb-6">
            <div className="-mt-10 mb-3 w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-primary">
              {shop.logo_url ? <img src={shop.logo_url} alt={`${shop.name} logo`} className="w-full h-full object-cover" /> : <Icon name={meta.icon} className="text-[40px]" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">{shop.name}</h1>
            {shop.tagline ? <p className="text-text-muted mt-1">{shop.tagline}</p> : null}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-soft text-primary font-semibold">
                <Icon name={meta.icon} className="text-[16px]" />
                {shop.category?.name_en ?? 'Shop'}
              </span>
              {shop.rating_count > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft text-warning-amber font-bold">
                  <Icon name="star" fill className="text-[16px]" />
                  {Number(shop.rating_avg).toFixed(1)} <span className="font-medium text-text-muted">({shop.rating_count} reviews)</span>
                </span>
              ) : null}
              {where ? (
                <span className="inline-flex items-center gap-1 text-text-muted">
                  <Icon name="location_on" className="text-[16px]" />
                  {where}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <OpenInApp slug={shop.slug} scheme={site.scheme} pkg={site.androidPackage} playUrl={site.playUrl} className={`${btn} bg-primary text-white hover:bg-primary-pressed shadow-md shadow-primary/25`}>
                <Icon name={shop.accepts_bookings ? 'event_seat' : 'shopping_bag'} className="text-[20px]" />
                {shop.accepts_bookings ? 'Book a seat in the app' : 'Pre-order in the app'}
              </OpenInApp>
              <div className="grid grid-cols-2 gap-3">
                {shop.phone ? (
                  <a href={`tel:${shop.phone}`} className={`${btn} bg-surface-container text-on-surface hover:bg-surface-container-high`}>
                    <Icon name="call" className="text-[20px] text-primary" />
                    Call
                  </a>
                ) : null}
                {maps ? (
                  <a href={maps} target="_blank" rel="noopener" className={`${btn} bg-surface-container text-on-surface hover:bg-surface-container-high`}>
                    <Icon name="directions" className="text-[20px] text-primary" />
                    Directions
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Payment — shown to the customer standing at the counter; kept out of search snippets. */}
        <section id="pay" className="mt-6" data-nosnippet>
          <h2 className="text-xl font-bold text-on-surface mb-1">Pay {shop.name} directly</h2>
          <p className="text-sm text-text-muted mb-3">Send money from your own wallet or bank app. Dukaan never handles your money.</p>
          {methods.length ? (
            <div className={`${card} p-3 sm:p-4 space-y-2.5 bg-surface-alt`}>
              {methods.map((m) => {
                const value = formatAccount(m.iban ?? m.account_number);
                return (
                  <div key={m.id} className="bg-white rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <b className="uppercase" style={{ color: PAYMENT_TONE[m.type] }}>{m.bank_name ?? PAYMENT_LABELS[m.type] ?? m.type}</b>
                        <span className="text-text-muted truncate">• {m.account_title}</span>
                        {m.is_primary ? <span className="ms-1 px-1.5 rounded bg-primary-soft text-primary font-bold">Primary</span> : null}
                      </div>
                      <div className={`font-bold text-on-surface mt-0.5 tabular-nums ${value.length > 16 ? 'text-sm' : 'text-lg'}`}>{value}</div>
                      {m.note ? <p className="text-xs text-text-muted mt-1">{m.note}</p> : null}
                    </div>
                    {value ? <CopyButton value={value} label={`${PAYMENT_LABELS[m.type] ?? ''} number`} /> : null}
                  </div>
                );
              })}
              <p className="text-xs text-on-surface bg-accent-soft rounded-lg p-3 flex gap-2">
                <Icon name="verified_user" className="text-[16px] text-warning-amber" />
                Always check the account title matches the shop before sending money.
              </p>
            </div>
          ) : (
            <p className={`${card} p-4 text-sm text-text-muted`}>This shop hasn’t added payment details yet — pay at the counter.</p>
          )}
        </section>

        {services.length ? <Menu title="Services & prices" items={services} currency={shop.currency} /> : null}
        {products.length ? <Menu title="Products & prices" items={products} currency={shop.currency} /> : null}


        {reviews.length ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-on-surface mb-3">
              Reviews{shop.rating_count ? <span className="text-warning-amber text-base ms-2">★ {Number(shop.rating_avg).toFixed(1)}</span> : null}
            </h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <article key={r.id} className={`${card} p-4`}>
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-on-surface">{r.author_name || 'Dukaan user'}</b>
                    <span className="text-warning-amber text-sm" aria-label={`${r.rating} out of 5 stars`}>
                      {'★'.repeat(r.rating)}
                      <span className="text-border-hairline">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  {r.comment ? <p className="text-sm text-on-surface-variant mt-1.5">{r.comment}</p> : null}
                  {r.owner_reply ? (
                    <p className="text-sm mt-2 bg-surface-alt rounded-lg p-2.5 border-s-2 border-primary">
                      <b className="text-primary text-xs uppercase block">Reply from the shop</b>
                      {r.owner_reply}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
            <p className="text-sm text-text-muted mt-3">Read all reviews or write your own in the free Dukaan app.</p>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-xl font-bold text-on-surface mb-3">About & timings</h2>
          <div className={`${card} p-5 space-y-4`}>
            {shop.description ? <p className="text-on-surface-variant whitespace-pre-line">{shop.description}</p> : null}
            {shop.address || where ? (
              <p className="flex gap-2 text-sm bg-surface-alt rounded-xl p-3">
                <Icon name="location_on" className="text-[20px] text-primary" />
                <span>
                  {shop.address ? <b className="block text-on-surface">{shop.address}</b> : null}
                  <span className="text-text-muted">{where}</span>
                </span>
              </p>
            ) : null}
            {hours.length ? (
              <dl className="text-sm divide-y divide-border-hairline">
                {hours.map((h) => (
                  <div key={h.label} className="flex justify-between gap-4 py-2">
                    <dt className="font-semibold text-on-surface">{h.label}</dt>
                    <dd className={h.closed ? 'text-danger-red font-bold' : 'text-text-muted'}>{h.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-primary text-white p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold">Save {shop.name} to your phone</h2>
            <p className="text-white/80 text-sm mt-1">
              {[shop.accepts_bookings && 'Book seats', shop.accepts_orders && 'pre-order', 'get offers'].filter(Boolean).join(', ')} — free on the Dukaan app.
            </p>
          </div>
          <a href={site.playUrl} className={`${btn} bg-white text-primary shrink-0`}>
            <Icon name="android" className="text-[22px]" />
            Get the app
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Menu({ title, items, currency }: { title: string; items: Item[]; currency: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-on-surface mb-3">{title}</h2>
      <ul className="bg-surface-card rounded-2xl border border-border-hairline/70 shadow-xs divide-y divide-border-hairline">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 p-4">
            {i.image_url ? <img src={i.image_url} alt="" loading="lazy" className="w-14 h-14 rounded-lg object-cover bg-surface-container-low shrink-0" /> : null}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-on-surface">{i.name}</h3>
              {i.description ? <p className="text-sm text-text-muted line-clamp-2">{i.description}</p> : null}
            </div>
            <div className="text-end shrink-0">
              <b className="text-primary">{money(i.price, currency)}</b>
              <span className="block text-xs text-text-muted">{i.unit ? `per ${i.unit}` : i.duration_minutes ? `${i.duration_minutes} min` : ''}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
