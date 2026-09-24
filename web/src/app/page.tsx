import type { Metadata } from 'next';
import { Landing } from '@/components/Landing';
import { JsonLd } from '@/lib/jsonld';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { en: '/', ur: '/ur', 'x-default': '/' } },
  openGraph: { url: '/', locale: 'en_PK', alternateLocale: ['ur_PK'] },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', '@id': `${site.url}/#org`, name: site.name, url: site.url, logo: `${site.url}/icon.svg`, email: site.supportEmail },
            { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name, url: site.url, inLanguage: ['en', 'ur'], publisher: { '@id': `${site.url}/#org` } },
            {
              '@type': 'MobileApplication',
              name: site.name,
              operatingSystem: 'ANDROID',
              applicationCategory: 'ShoppingApplication',
              installUrl: site.playUrl,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' },
              publisher: { '@id': `${site.url}/#org` },
            },
          ],
        }}
      />
      <Landing locale="en" />
    </>
  );
}
