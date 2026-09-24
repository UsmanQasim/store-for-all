import { LEGAL, type LegalSlug } from '@/lib/legal';
import { SiteFooter, SiteHeader } from './Chrome';

export function LegalPage({ slug }: { slug: LegalSlug }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <article className="doc" dangerouslySetInnerHTML={{ __html: LEGAL[slug].html }} />
      </main>
      <SiteFooter />
    </>
  );
}
