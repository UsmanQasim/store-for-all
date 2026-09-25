import Link from 'next/link';
import { tr, type Locale } from '@/lib/i18n';
import { site } from '@/lib/site';
import { Icon } from './Icon';
import { LangSwitch } from './LangSwitch';
import { MobileMenu } from './MobileMenu';

/**
 * One header for every page (landing, shop pages, directory, legal).
 * ≥1280px: full nav inline. Below that: logo, language, Get App and a menu button that opens a panel with the same links.
 */
export function Header({ locale = 'en' }: { locale?: Locale }) {
  const t = (s: string) => tr(locale, s);
  const home = locale === 'ur' ? '/ur' : '/';
  const nav = [
    { href: `${home}#customers`, label: t('For Customers'), icon: 'person' },
    { href: `${home}#dukaandars`, label: t('For Dukaandars'), icon: 'storefront' },
    { href: `${home}#counter-qr`, label: t('Counter QR'), icon: 'qr_code_2' },
    { href: `${home}#trades`, label: t('Supported Trades'), icon: 'category' },
    { href: '/shops', label: t('Shops'), icon: 'location_on' },
    { href: `${home}#faq`, label: t('FAQ'), icon: 'help' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-border-hairline/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-3">
        <Link href={home} className="flex items-center gap-2.5 shrink-0 group" aria-label={`${site.name} — ${t('Dukaan home')}`}>
          <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Icon name="storefront" className="text-[24px]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-primary">Dukaan</span>
              <span className="max-[379px]:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-soft text-primary uppercase tracking-wide">PK</span>
            </span>
            <span className="hidden sm:block font-urdu text-[11px] text-text-muted mt-1" lang="ur">
              محلہ کامرس
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden xl:flex items-center gap-1">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="px-3 py-2 rounded-lg text-sm font-semibold text-on-surface-variant whitespace-nowrap hover:text-primary hover:bg-primary-soft transition-colors">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LangSwitch locale={locale} />
          <a
            href={site.playUrl}
            className="hidden md:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border-hairline bg-white/60 text-sm font-bold text-on-surface whitespace-nowrap hover:bg-surface-container transition-colors"
          >
            <Icon name="add_business" className="text-[18px] text-secondary-container" />
            {t('Register Shop')}
          </a>
          <a
            href={site.playUrl}
            aria-label={t('Get App')}
            className="max-[359px]:hidden inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-primary text-white text-sm font-bold whitespace-nowrap shadow-md shadow-primary/25 hover:bg-primary-pressed transition-colors"
          >
            <Icon name="download" className="text-[18px]" />
            <span className="hidden sm:inline">{t('Get App')}</span>
          </a>
          <MobileMenu label={t('Menu')} closeLabel={t('Close menu')}>
            <nav aria-label="Main" className="max-w-7xl mx-auto px-4 sm:px-6 py-3 grid sm:grid-cols-2 gap-1">
              {nav.map((n) => (
                <a key={n.href} href={n.href} className="flex items-center gap-3 min-h-12 px-3 rounded-xl text-base font-semibold text-on-surface hover:bg-primary-soft hover:text-primary">
                  <Icon name={n.icon} className="text-[22px] text-primary" />
                  {n.label}
                </a>
              ))}
              <a href={site.playUrl} className="min-[360px]:hidden flex items-center justify-center gap-2 h-12 mt-2 rounded-xl bg-primary text-white font-bold">
                <Icon name="download" className="text-[20px]" />
                {t('Get App')}
              </a>
              <a href={site.playUrl} className="md:hidden sm:col-span-2 mt-2 flex items-center justify-center gap-2 h-12 rounded-xl bg-secondary-container text-on-secondary-container font-bold">
                <Icon name="add_business" className="text-[20px]" />
                {t('Register Your Shop (Free)')}
              </a>
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
