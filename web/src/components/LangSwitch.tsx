import Link from 'next/link';
import type { Locale } from '@/lib/i18n';

/** EN / اردو pill from the Stitch header — each side is a real link to that language's page. */
export function LangSwitch({ locale }: { locale: Locale }) {
  const pill = 'px-2.5 py-1 rounded-full text-xs font-bold transition-all';
  const on = 'bg-surface-card text-on-surface shadow-xs';
  const off = 'text-on-surface-variant hover:text-on-surface';
  return (
    <nav aria-label="Language" className="flex items-center bg-surface-container rounded-full p-1 border border-border-hairline/80 shadow-inner" dir="ltr">
      <Link prefetch={false} href="/" hrefLang="en" lang="en" aria-current={locale === 'en' ? 'page' : undefined} className={`${pill} ${locale === 'en' ? on : off}`}>
        EN
      </Link>
      <Link prefetch={false} href="/ur" hrefLang="ur" lang="ur" aria-current={locale === 'ur' ? 'page' : undefined} className={`${pill} font-urdu text-[11px] leading-none ${locale === 'ur' ? on : off}`}>
        اردو
      </Link>
    </nav>
  );
}
