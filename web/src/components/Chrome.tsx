import Link from 'next/link';
import { site } from '@/lib/site';
import { Icon } from './Icon';

export { Header as SiteHeader } from './Header';

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-border-hairline py-10 mt-auto">
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
