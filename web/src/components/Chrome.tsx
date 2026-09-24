import Link from 'next/link';
import { site } from '@/lib/site';
import { Icon } from './Icon';

/** Header/footer for inner pages (shop pages, directory, legal) — same brand bar as the landing page. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-border-hairline/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Dukaan home">
          <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Icon name="storefront" className="text-[22px]" />
          </span>
          <span className="font-extrabold text-xl tracking-tight text-primary">Dukaan</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
          <Link href="/shops" className="hidden sm:inline text-on-surface-variant hover:text-primary">
            Shops
          </Link>
          <a href={site.playUrl} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/25 hover:bg-primary-pressed">
            <Icon name="download" className="text-[18px]" />
            Get App
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-border-hairline py-10 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-6 justify-between text-sm">
        <div className="space-y-1">
          <span className="font-extrabold text-xl tracking-tight text-primary">Dukaan</span>
          <p className="text-text-muted">© {new Date().getFullYear()} Dukaan. Every shop on your street, one app.</p>
        </div>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 font-semibold text-text-muted">
          <Link href="/shops" className="hover:text-primary">All shops</Link>
          <Link href="/privacy" className="hover:text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
          <Link href="/community-guidelines" className="hover:text-primary">Community guidelines</Link>
          <Link href="/delete-account" className="hover:text-primary">Delete account</Link>
          <a href={`mailto:${site.supportEmail}`} className="hover:text-primary">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
