// Generated from the Stitch landing design (landing/index.html), then maintained by hand.
import { Icon } from './Icon';
import { LangSwitch } from './LangSwitch';
import { PlayQr } from './PlayQr';
import { site } from '@/lib/site';
import { tr, type Locale } from '@/lib/i18n';

export function Landing({ locale }: { locale: Locale }) {
  const t = (s: string) => tr(locale, s);
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-border-hairline/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <a className="flex items-center gap-3 shrink-0 group" href={locale === 'ur' ? '/ur' : '/'}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Icon name="storefront" className="text-[26px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-primary">{t("Dukaan")}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-soft text-primary uppercase tracking-wide">{t("Pk")}</span>
              </div>
              <span className="text-[10px] font-medium text-text-muted -mt-1">{t("محلہ کامرس")}</span>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            <a className="text-sm font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5" href="#customers">
              <span>{t("For Customers")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
            </a>
            <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#dukaandars">{t("For Dukaandars")}</a>
            <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#counter-qr">{t("Counter QR")}</a>
            <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#trades">{t("Supported Trades")}</a>
            <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" href="#faq">
              <span>{t("0% Commission")}</span>
              <span className="text-[10px] font-bold bg-success-soft text-success-green px-1.5 py-0.5 rounded">{t("Forever")}</span>
            </a>
            <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#faq">{t("FAQ")}</a>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <LangSwitch locale={locale} />
            <a className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-hairline text-sm font-bold text-on-surface hover:bg-surface-container transition-all" href={site.playUrl}>
              <Icon name="store" className="text-[18px] text-secondary-container" />
              <span>{t("Register Shop")}</span>
            </a>
            <a className="inline-flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:bg-primary-pressed hover:shadow-lg transition-all" href={site.playUrl} aria-label={t("Get App")}>
              <Icon name="download" className="text-[18px]" />
              <span className="hidden min-[440px]:inline">{t("Get App")}</span>
            </a>
          </div>
        </div>
      </header>
      <main className="pt-20">
        <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-[#FAF8F5]">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />
          <div className="absolute top-48 right-10 w-[400px] h-[350px] bg-secondary-container/15 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-primary/20 shadow-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                  <span className="text-xs font-bold text-primary tracking-wide">{t("Neighbourhood Commerce, Reimagined")}</span>
                  <span className="text-xs text-text-muted">|</span>
                  <span className="text-xs font-semibold text-text-muted">{t("0% Commission Forever 🇵🇰")}</span>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-on-surface leading-[1.08]">
                    {t("Every shop on your street.")}{' '}
                    <br />
                    <span className="relative inline-block text-primary">
                      {t("One powerful app.")}{' '}
                      <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary-container -z-10 fill-current opacity-80" preserveAspectRatio="none" viewBox="0 0 100 20">
                        <path d="M0,15 Q50,0 100,12 L100,20 Q50,8 0,20 Z" />
                      </svg>
                    </span>
                  </h1>
                  <p className="font-urdu text-lg sm:text-xl text-primary font-bold pt-1 leading-relaxed opacity-95">{t("آپ کے محلے کی ہر دکان، اب آپ کے ہاتھ میں — بغیر کسی اضافی چارجز کے")}</p>
                </div>
                <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">{t("Book salon chairs ahead of time, order packed fresh ration from Tariq Bhai’s kiryana, and scan the counter QR to pay the shop directly by JazzCash, Easypaisa, Raast or bank — no middleman.")}</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
                  <a className="group flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-pressed transition-all transform hover:-translate-y-0.5" href={site.playUrl}>
                    <Icon name="android" className="text-[30px] group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-soft">{t("Free Download")}</span>
                      <span className="block text-base font-bold leading-tight">{t("Get Dukaan for Android")}</span>
                    </div>
                  </a>
                  <a className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-secondary-container text-on-secondary-container shadow-md shadow-secondary-container/20 hover:brightness-105 transition-all transform hover:-translate-y-0.5 font-bold text-base" href={site.playUrl}>
                    <Icon name="add_business" className="text-[22px]" />
                    <span>{t("Register Your Shop (Free)")}</span>
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-hairline/80 w-full max-w-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                    <Icon name="verified_user" className="text-primary text-[18px]" />
                    <span>{t("0% Commission")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                    <Icon name="timer" className="text-primary text-[18px]" />
                    <span>{t("2-Min Setup")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                    <Icon name="credit_card_off" className="text-primary text-[18px]" />
                    <span>{t("No Card Required")}</span>
                  </div>
                </div>
              </div>
              <div dir="ltr" className="lg:col-span-5 relative flex justify-center items-center py-6 perspective-mockup">
                <div className="absolute -top-4 -left-4 sm:-left-10 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-border-hairline/80 max-w-[240px] animate-bounce" style={{animationDuration: "4s"}}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <Icon name="event_seat" className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">{t("Seat Confirmed!")}</span>
                      <span className="text-[11px] text-text-muted">{t("Ali's Cuts • Haircut + Beard")}</span>
                      <span className="text-[10px] font-bold text-primary mt-0.5">{t("Today 10:30 AM Slot")}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-2 sm:-right-8 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-border-hairline/80 max-w-[260px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success-soft text-success-green flex items-center justify-center shrink-0">
                      <Icon name="account_balance_wallet" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-on-surface">{t("Paid Directly")}</span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-success-soft text-success-green">{t("0% FEE")}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">{t("Rs 650 via Raast")}</span>
                      <span className="text-[10px] text-text-muted font-mono">{t("To: Ali's Cuts")}</span>
                    </div>
                  </div>
                </div>
                <div className="relative w-full max-w-[340px] aspect-[9/18.5] bg-[#1A1A1A] rounded-[46px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-white/20">
                  <div className="relative w-full h-full bg-[#FAF8F5] rounded-[38px] overflow-hidden flex flex-col justify-between border border-gray-200">
                    <div className="h-6 bg-white px-5 flex items-center justify-between text-[11px] font-bold text-on-surface shrink-0">
                      <span>9:41</span>
                      <div className="w-16 h-3 bg-black rounded-full mx-auto -mt-1" />
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Icon name="signal_cellular_4_bar" className="text-[13px]" />
                        <Icon name="wifi" className="text-[13px]" />
                        <Icon name="battery_full" className="text-[13px]" />
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 border-b border-border-hairline flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Icon name="location_on" className="text-primary text-[18px]" />
                        <div>
                          <span className="text-xs font-extrabold text-on-surface block leading-tight">{t("Gulberg III, Lahore")}</span>
                          <span className="text-[9px] text-text-muted">{t("Main Market & Ghalib Rd")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-success-soft text-success-green text-[9px] font-extrabold tracking-wider">{t("LIVE")}</span>
                        <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                          <Icon name="notifications" className="text-[14px]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-3 overflow-y-auto flex-1 text-left">
                      <div className="bg-surface-container rounded-xl px-3 py-2 flex items-center gap-2 border border-border-hairline/60">
                        <Icon name="search" className="text-text-muted text-[16px]" />
                        <span className="text-xs text-text-muted font-medium">{t("Search barber, kiryana, naan shop...")}</span>
                      </div>
                      <div className="flex gap-1.5 overflow-x-hidden text-[10px] font-bold">
                        <span className="px-2.5 py-1 rounded-full bg-primary text-white shrink-0">{t("All Shops")}</span>
                        <span className="px-2.5 py-1 rounded-full bg-white border border-border-hairline text-on-surface shrink-0">{t("Barbers")}</span>
                        <span className="px-2.5 py-1 rounded-full bg-white border border-border-hairline text-on-surface shrink-0">{t("Kiryana")}</span>
                        <span className="px-2.5 py-1 rounded-full bg-white border border-border-hairline text-on-surface shrink-0">{t("Bakeries")}</span>
                      </div>
                      <div className="bg-white rounded-2xl p-3 shadow-xs border border-border-hairline space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">{t("AC")}</div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-on-surface">{t("Ali's Cuts & Salon")}</span>
                                <Icon name="verified" className="text-info-blue text-[13px]" />
                              </div>
                              <span className="text-[10px] text-text-muted">{t("150m away • ★ 4.9 (420)")}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-accent-soft text-warning-amber text-[9px] font-extrabold">{t("2 SEATS OPEN")}</span>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-2 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-on-surface block">{t("Signature Haircut + Beard")}</span>
                            <span className="text-[10px] text-text-muted">{t("25 mins • Book a slot")}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-primary block">{t("Rs 650")}</span>
                            <span className="text-[9px] font-bold text-success-green">{t("0% Advance Fee")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-3 shadow-xs border border-border-hairline space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">{t("TK")}</div>
                            <div>
                              <span className="text-xs font-bold text-on-surface block">{t("Tariq General Store")}</span>
                              <span className="text-[10px] text-text-muted">{t("30m away • Kiryana & Atta")}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-success-soft text-success-green text-[9px] font-bold">{t("READY TO PICK")}</span>
                        </div>
                        <div className="text-[10px] text-text-muted bg-surface-container-low px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                          <span>{t("Order #1042 (5 items packed)")}</span>
                          <span className="font-bold text-on-surface">{t("Rs 1,420")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-14 bg-white border-t border-border-hairline px-4 flex items-center justify-between shrink-0">
                      <div className="flex flex-col items-center text-primary">
                        <Icon name="home" className="text-[19px]" />
                        <span className="text-[9px] font-bold">{t("Mohalla")}</span>
                      </div>
                      <div className="flex flex-col items-center text-text-muted">
                        <Icon name="calendar_today" className="text-[19px]" />
                        <span className="text-[9px] font-semibold">{t("Bookings")}</span>
                      </div>
                      <div className="w-10 h-10 -mt-5 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30">
                        <Icon name="qr_code_scanner" className="text-[20px]" />
                      </div>
                      <div className="flex flex-col items-center text-text-muted">
                        <Icon name="receipt_long" className="text-[19px]" />
                        <span className="text-[9px] font-semibold">{t("Orders")}</span>
                      </div>
                      <div className="flex flex-col items-center text-text-muted">
                        <Icon name="person" className="text-[19px]" />
                        <span className="text-[9px] font-semibold">{t("Profile")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-white border-y border-border-hairline py-8 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-border-hairline/60">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-success-green" />
                <span className="text-sm font-extrabold uppercase tracking-wider text-text-muted">{t("Made for every mohalla:")}</span>
                <span className="text-sm font-bold text-on-surface">{t("Karachi • Lahore • Rawalpindi • Multan • Faisalabad • Peshawar")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-surface-container-low px-3 py-1.5 rounded-full">
                <Icon name="verified" className="text-primary text-[16px]" />
                <span>{t("Works with Raast, JazzCash, Easypaisa & banks")}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
              <div className="flex flex-col items-center lg:items-start p-2">
                <span className="text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">0%</span>
                <span className="text-sm font-bold text-on-surface mt-1">{t("Platform Commission")}</span>
                <span className="text-xs text-text-muted">{t("No cuts on your sales forever")}</span>
              </div>
              <div className="flex flex-col items-center lg:items-start p-2">
                <span className="text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">100%</span>
                <span className="text-sm font-bold text-on-surface mt-1">{t("Direct P2P Settlement")}</span>
                <span className="text-xs text-text-muted">{t("Funds go directly to shopkeeper wallet")}</span>
              </div>
              <div className="flex flex-col items-center lg:items-start p-2">
                <span className="text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">{t("< 2 min")}</span>
                <span className="text-sm font-bold text-on-surface mt-1">{t("Free Store Setup")}</span>
                <span className="text-xs text-text-muted">{t("No credit card or paperwork")}</span>
              </div>
              <div className="flex flex-col items-center lg:items-start p-2">
                <div className="flex items-center gap-1">
                  <span className="text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">{t("Rs 0")}</span>
                </div>
                <span className="text-sm font-bold text-on-surface mt-1">{t("Free for Customers")}</span>
                <span className="text-xs text-text-muted">{t("Browse shops without even signing up")}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 lg:py-28 bg-[#FAF8F5] relative overflow-hidden" id="counter-qr">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider">
                <Icon name="qr_code_2" className="text-[16px]" />
                <span>{t("Bridging The Counter & The Smartphone")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">
                {t("The Counter QR Poster:")}{' '}
                <br />
                <span className="text-primary">{t("Instant Booking & Direct Pay")}</span>
              </h2>
              <p className="text-base sm:text-lg text-text-muted">{t("Every registered shop gets a print-ready A4 QR poster from the app. Customers just point their camera — payment details open right in the browser, no app needed.")}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 flex justify-center">
                <div dir="ltr" className="relative w-full max-w-[420px] rounded-3xl p-6 bg-gradient-to-b from-[#3a2010] to-[#201108] shadow-2xl border-4 border-[#523018]">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl pointer-events-none" />
                  <div className="relative bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/80 flex flex-col items-center text-center">
                    <div className="w-16 h-2 rounded-full bg-gray-300 mx-auto -mt-3 mb-4" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">{t("DK")}</div>
                      <span className="text-xl font-extrabold text-primary tracking-tight">{t("Dukaan")}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-on-surface">{t("Madina Kiryana & General Store")}</h3>
                    <p className="text-xs text-text-muted font-medium mb-4">{t("Gulberg III • Shop #14, Mini Market")}</p>
                    <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-primary/40 shadow-inner my-2">
                      <div className="w-48 h-48 bg-[#0B6E4F]/5 rounded-xl p-3 flex flex-col justify-between border border-primary/20">
                        <div className="flex justify-between">
                          <div className="w-12 h-12 border-4 border-primary rounded-lg p-1 flex items-center justify-center">
                            <div className="w-5 h-5 bg-primary rounded-sm" />
                          </div>
                          <div className="w-12 h-12 border-4 border-primary rounded-lg p-1 flex items-center justify-center">
                            <div className="w-5 h-5 bg-primary rounded-sm" />
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto shadow-sm">
                          <Icon name="storefront" className="text-[20px]" />
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="w-12 h-12 border-4 border-primary rounded-lg p-1 flex items-center justify-center">
                            <div className="w-5 h-5 bg-primary rounded-sm" />
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-primary block mt-2">{t("SCAN TO PRE-ORDER & PAY")}</span>
                    </div>
                    <div className="w-full mt-4 pt-4 border-t border-border-hairline grid grid-cols-2 gap-2 text-left">
                      <div className="bg-surface-container rounded-lg p-2">
                        <span className="text-[9px] uppercase tracking-wider text-text-muted block font-bold">{t("Raast ID / Mobile")}</span>
                        <span className="text-xs font-mono font-bold text-on-surface">0301-4492817</span>
                      </div>
                      <div className="bg-surface-container rounded-lg p-2">
                        <span className="text-[9px] uppercase tracking-wider text-text-muted block font-bold">{t("JazzCash / SadaPay")}</span>
                        <span className="text-xs font-mono font-bold text-on-surface">0321-8891024</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-3 px-1">
                      <span className="text-[10px] font-bold text-success-green flex items-center gap-1">
                        <Icon name="check_circle" className="text-[14px]" />
                        {' '}{t("0% Commission Shop")}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">{t("dukaan.app/s/madina")}</span>
                    </div>
                  </div>
                  <div className="h-4 bg-black/60 rounded-full mx-8 -mt-2 blur-sm" />
                </div>
              </div>
              <div className="lg:col-span-6 flex flex-col space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 font-extrabold text-lg">1</div>
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">{t("No App Needed to Pay")}</h4>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{t("Walk-in customers scan with their normal camera and see your payment details instantly. Regulars get the free app to book, pre-order and favourite your shop.")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-extrabold text-lg">2</div>
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">{t("Direct Payment, Zero Middleman")}</h4>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{t("Dukaan never touches the money. Customers pay from their own bank or JazzCash/Easypaisa app straight into the dukaandar’s account.")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-info-soft text-info-blue flex items-center justify-center shrink-0 font-extrabold text-lg">3</div>
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">{t("Instant Booking & Order Alerts")}</h4>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{t("New bookings and pre-orders reach the shop as a push notification. Customers are notified the moment you confirm, pack or mark it ready.")}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="print" className="text-primary text-[28px]" />
                    <div>
                      <span className="text-xs font-bold text-on-surface block">{t("Print-Ready A4 Poster")}</span>
                      <span className="text-[11px] text-text-muted">{t("Download the PDF from the app and print it at any shop.")}</span>
                    </div>
                  </div>
                  <a className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary-pressed transition-colors shrink-0" href={site.playUrl}>{t("Get Your Poster")}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 lg:py-28 bg-white border-y border-border-hairline" id="customers">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-secondary text-xs font-bold uppercase tracking-wider">
                <span>{t("Two Sides of One Unified Ecosystem")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">
                {t("Crafted for Residents.")}{' '}
                <br />
                <span className="text-primary">{t("Built for Shopkeepers.")}</span>
              </h2>
              <p className="text-base sm:text-lg text-text-muted">{t("See how Dukaan eliminates everyday friction for both the customer in need and the dukaandar at the counter.")}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="rounded-3xl bg-surface-container-low p-8 border border-border-hairline flex flex-col justify-between shadow-xs hover:shadow-lg transition-all" id="residents">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs">
                        <Icon name="person" className="text-[26px]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary block">{t("For Everyday Residents")}</span>
                        <h3 className="text-2xl font-bold text-on-surface">{t("The Neighbourhood App")}</h3>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-border-hairline text-on-surface shrink-0 whitespace-nowrap">{t("Customer UI")}</span>
                  </div>
                  <p className="text-sm sm:text-base text-text-muted leading-relaxed">{t("Skip crowded waiting benches at barber shops, avoid waiting 20 minutes for atta to be weighed, and settle up via instant Raast transfers.")}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border-hairline/80">
                      <Icon name="event_seat" className="text-primary text-[20px]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-on-surface block">{t("Seat & Chair Reservation")}</span>
                        <span className="text-[11px] text-text-muted">{t("Pick a service and a free slot, then arrive exactly on time.")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border-hairline/80">
                      <Icon name="local_mall" className="text-secondary-container text-[20px]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-on-surface block">{t("Pre-Pack Grocery Orders")}</span>
                        <span className="text-[11px] text-text-muted">{t("Send ration list in advance. Simply grab the packed bag or get doorstep drop.")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border-hairline/80">
                      <Icon name="payments" className="text-info-blue text-[20px]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-on-surface block">{t("1-Tap Raast & Wallet Pay")}</span>
                        <span className="text-[11px] text-text-muted">{t("Copy the shop’s Raast ID or wallet number in one tap. Zero fee, paid directly.")}</span>
                      </div>
                    </div>
                  </div>
                  <div dir="ltr" className="bg-white rounded-2xl p-4 border border-border-hairline space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border-hairline/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-success-green" />
                        <span className="text-xs font-bold text-on-surface">{t("Active Appointment")}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">{t("IN 15 MINS")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-on-surface block">{t("Ali's Cuts & Salon")}</span>
                        <span className="text-text-muted text-[11px]">{t("Haircut + Beard • 10:30 AM")}</span>
                      </div>
                      <span className="font-bold text-primary">{t("Rs 650")}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-8">
                  <a className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-pressed transition-colors" href={site.playUrl}>
                    <Icon name="download" className="text-[18px]" />
                    <span>{t("Download App for Customers")}</span>
                  </a>
                </div>
              </div>
              <div className="rounded-3xl bg-surface-container-low p-8 border border-border-hairline flex flex-col justify-between shadow-xs hover:shadow-lg transition-all" id="dukaandars">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                        <Icon name="storefront" className="text-[26px]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary block">{t("For Dukaandars & Trades")}</span>
                        <h3 className="text-2xl font-bold text-on-surface">{t("The Merchant Operating System")}</h3>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-border-hairline text-on-surface shrink-0 whitespace-nowrap">{t("Merchant UI")}</span>
                  </div>
                  <p className="text-sm sm:text-base text-text-muted leading-relaxed">{t("Take control of your business without commissions. Manage waiting queues, organize pickup orders, and broadcast deals to loyal regulars.")}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border-hairline/80">
                      <Icon name="money_off" className="text-success-green text-[20px]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-on-surface block">{t("100% Revenue Retention (0% Cut)")}</span>
                        <span className="text-[11px] text-text-muted">{t("Dukaan takes zero commission on your sales.")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border-hairline/80">
                      <Icon name="table_rows" className="text-primary text-[20px]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-on-surface block">{t("Live Chair & Booking Triage")}</span>
                        <span className="text-[11px] text-text-muted">{t("See upcoming slots with one thumb tap. Never overbook or frustrate waiting clients.")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-border-hairline/80">
                      <Icon name="campaign" className="text-warning-amber text-[20px]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-on-surface block">{t("Broadcast Friday Deals")}</span>
                        <span className="text-[11px] text-text-muted">{t("Send push notification alerts to customers who follow your shop.")}</span>
                      </div>
                    </div>
                  </div>
                  <div dir="ltr" className="bg-white rounded-2xl p-4 border border-border-hairline space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-on-surface block">{t("Today's Store Performance")}</span>
                        <span className="text-[10px] text-text-muted">{t("Paid directly to you")}</span>
                      </div>
                      <span className="text-sm font-extrabold text-primary">{t("Rs 34,850")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-surface-container rounded-lg p-2 font-bold text-on-surface">{t("18 Bookings Done")}</div>
                      <div className="bg-surface-container rounded-lg p-2 font-bold text-success-green">{t("Rs 0 Commission Paid")}</div>
                    </div>
                  </div>
                </div>
                <div className="pt-8">
                  <a className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-bold shadow-md shadow-secondary-container/20 hover:brightness-105 transition-all" href={site.playUrl}>
                    <Icon name="add_business" className="text-[18px]" />
                    <span>{t("Register Shop (2-Minute Onboarding)")}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 lg:py-28 bg-[#FAF8F5]" id="trades">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider">
                <span>{t("Specialized Workflows")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">{t("Built For Every Corner of The Bazaar")}</h2>
              <p className="text-base sm:text-lg text-text-muted">{t("Tailor-made screens for every category of Pakistani micro-business. No complicated software — just fast mohalla commerce.")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-border-hairline shadow-xs hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <Icon name="content_cut" className="text-[26px]" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{t("Barbers & Men's Salons")}</h3>
                <span className="text-xs font-bold text-primary block mb-3">{t("Chair Scheduling & Wait Timers")}</span>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{t("Eliminate crowded evening lobbies. Clients pick a service, reserve a slot and get notified the moment you confirm.")}</p>
                <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>{t("Haircut & Beard Trim")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 500")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("Herbal Facial & Massage")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 1,200")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-border-hairline shadow-xs hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft text-secondary flex items-center justify-center mb-4">
                  <Icon name="local_grocery_store" className="text-[26px]" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{t("Kiryana & General Stores")}</h3>
                <span className="text-xs font-bold text-secondary block mb-3">{t("Ration Bundles & Quick Re-order")}</span>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{t("Customers tap their monthly ration (Chakki Atta, Daal Chana, Ghee, Spices) from your list. You pack it before pickup time.")}</p>
                <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>{t("10kg Chakki Atta (Fresh)")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 1,350")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("Olper's Milk Pack 1L x 12")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 3,400")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-border-hairline shadow-xs hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-warning-soft text-warning-amber flex items-center justify-center mb-4">
                  <Icon name="bakery_dining" className="text-[26px]" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{t("Bakeries & Sweet Marts")}</h3>
                <span className="text-xs font-bold text-warning-amber block mb-3">{t("Fresh Morning Batch Alerts")}</span>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{t("Broadcast when warm rusks, bakarkhani, or morning halwa puri is coming out fresh. Custom pre-orders for birthday cakes.")}</p>
                <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>{t("Fresh Naan Khatai (1kg)")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 850")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("Gulab Jamun (Pure Khoya)")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 1,100")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-border-hairline shadow-xs hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-info-soft text-info-blue flex items-center justify-center mb-4">
                  <Icon name="styler" className="text-[26px]" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{t("Tailors & Boutiques")}</h3>
                <span className="text-xs font-bold text-info-blue block mb-3">{t("Fitting Appointments & Eid Bookings")}</span>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{t("Schedule fitting and trial appointments before the Eid rush — no more lost paper notebooks. Customers get a push when you confirm.")}</p>
                <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>{t("Gents Shalwar Kameez Stitch")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 1,200")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("Ladies Formal Suit Fitting")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 2,500")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-border-hairline shadow-xs hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-danger-soft text-danger-red flex items-center justify-center mb-4">
                  <Icon name="medication" className="text-[26px]" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{t("Local Pharmacies & Chemists")}</h3>
                <span className="text-xs font-bold text-danger-red block mb-3">{t("Everyday Essentials & Pre-Pack")}</span>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{t("Customers pre-order everyday health and baby essentials from your list. You pack them and keep the bag ready for quick counter pickup.")}</p>
                <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>{t("Baby Care Monthly Pack")}</span>
                    <span className="font-bold text-on-surface">{t("Pre-Pack")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("ORS & First-Aid Kit")}</span>
                    <span className="font-bold text-on-surface">{t("In Stock")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-border-hairline shadow-xs hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-success-soft text-success-green flex items-center justify-center mb-4">
                  <Icon name="restaurant" className="text-[26px]" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{t("Mutton & Chicken Shops")}</h3>
                <span className="text-xs font-bold text-success-green block mb-3">{t("Custom Cuts & Morning Weights")}</span>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{t("Customers add a note — boneless, karahi pieces or mince — and collect it fresh without waiting in the rush-hour queue.")}</p>
                <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>{t("Fresh Chicken (Karahi Cut 1kg)")}</span>
                    <span className="font-bold text-on-surface">{t("Live Market Rate")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("Mutton Dasti (Cut & Cleaned)")}</span>
                    <span className="font-bold text-on-surface">{t("Rs 2,300/kg")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 lg:py-28 bg-white border-y border-border-hairline" id="how">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider">{t("How It Works")}</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">{t("Live In Three Simple Steps")}</h2>
              <p className="text-base sm:text-lg text-text-muted">{t("No paperwork, no card, no commission. Set up from your phone while you wait for the next customer.")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="rounded-3xl bg-surface-container-low p-8 border border-border-hairline flex flex-col gap-5 shadow-xs hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                  <Icon name="add_business" className="text-[26px]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{t("Step 1")}</span>
                  <h3 className="text-xl font-bold text-on-surface">{t("Register your shop")}</h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">{t("Add your name, category, area and opening hours. Your shop page goes live the moment you publish.")}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-surface-container-low p-8 border border-border-hairline flex flex-col gap-5 shadow-xs hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft text-secondary flex items-center justify-center">
                  <Icon name="payments" className="text-[26px]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{t("Step 2")}</span>
                  <h3 className="text-xl font-bold text-on-surface">{t("Add how you get paid")}</h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">{t("JazzCash, Easypaisa, Raast or bank account. Customers see these details and pay you directly.")}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-surface-container-low p-8 border border-border-hairline flex flex-col gap-5 shadow-xs hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-success-soft text-success-green flex items-center justify-center">
                  <Icon name="qr_code_2" className="text-[26px]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{t("Step 3")}</span>
                  <h3 className="text-xl font-bold text-on-surface">{t("Print your counter QR")}</h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">{t("Download the A4 poster, stick it at your counter and start taking bookings and pre-orders.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 lg:py-28 bg-[#FAF8F5]" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider">
                <span>{t("Clear Transparency")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">{t("Frequently Asked Questions")}</h2>
              <p className="text-base sm:text-lg text-text-muted">{t("All your questions about 0% commission, direct payments and your counter QR poster, answered.")}</p>
            </div>
            <div className="space-y-4">
              <details className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs  group">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">{t("How is Dukaan genuinely 0% commission forever?")}</h3>
                  <Icon name="expand_more" className="text-primary text-[24px] transition-transform group-open:rotate-180" />
                </summary>
                <div className="pt-4 text-sm text-text-muted leading-relaxed">{t("Dukaan is not a payment middleman or delivery aggregator. Customers pay your own JazzCash, Easypaisa, Raast or bank account directly, so there is nothing for us to take a cut from. Listing your shop, bookings, pre-orders and your QR poster are free.")}</div>
              </details>
              <details className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs  group">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">{t("Does Dukaan hold or keep customer money in escrow?")}</h3>
                  <Icon name="expand_more" className="text-primary text-[24px] transition-transform group-open:rotate-180" />
                </summary>
                <div className="pt-4 text-sm text-text-muted leading-relaxed">{t("Never. When a customer pays, money moves from their banking or wallet app straight into the account you added. Dukaan never holds, holds back or delays your funds — we never see the money at all.")}</div>
              </details>
              <details className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs  group">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">{t("How do I get my counter QR poster?")}</h3>
                  <Icon name="expand_more" className="text-primary text-[24px] transition-transform group-open:rotate-180" />
                </summary>
                <div className="pt-4 text-sm text-text-muted leading-relaxed">
                  {t("Register your shop in the app, add your payment methods and open")}{' '}
                  <b>{t("QR poster")}</b>
                  {t(". Tap")}{' '}
                  <b>{t("Download A4 Print PDF")}</b>
                  {' '}{t("and print it at any photocopy shop — or share it on WhatsApp. You can also put it in an acrylic stand from your local market.")}
                </div>
              </details>
              <details className="bg-white rounded-2xl p-6 border border-border-hairline shadow-xs  group">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">{t("Do my walk-in customers need to download the app to pay or book?")}</h3>
                  <Icon name="expand_more" className="text-primary text-[24px] transition-transform group-open:rotate-180" />
                </summary>
                <div className="pt-4 text-sm text-text-muted leading-relaxed">{t("Not to pay. Any smartphone camera can scan your QR — it opens your shop page in the browser with your payment details and a copy button. To book a seat or pre-order, customers use the free Dukaan app, which the same QR helps them install.")}</div>
              </details>
            </div>
          </div>
        </section>
        <section className="py-16 lg:py-24 bg-[#FAF8F5]" id="download">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[40px] bg-primary overflow-hidden p-8 sm:p-14 lg:p-16 text-white shadow-2xl">
              <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-secondary-container" />
                    <span>{t("Free for every Pakistani dukaan")}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">{t("Bring your shop online in under 2 minutes. Empower your neighbourhood.")}</h2>
                  <p className="text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">{t("Download the app to discover nearby shops and book chairs, or register your shop for free and print your counter QR poster today.")}</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <a className="flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-white text-primary text-base font-bold shadow-lg hover:bg-[#FAF8F5] transition-all transform hover:-translate-y-0.5" href={site.playUrl}>
                      <Icon name="android" className="text-[24px]" />
                      <span>{t("Download for Android")}</span>
                    </a>
                    <a className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-secondary-container text-on-secondary-container text-base font-bold shadow-lg hover:brightness-105 transition-all transform hover:-translate-y-0.5" href={site.playUrl} id="register">
                      <Icon name="storefront" className="text-[22px]" />
                      <span>{t("Register Your Shop (Free)")}</span>
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-4 flex justify-center lg:justify-end">
                  <div className="bg-white rounded-3xl p-6 text-center text-on-surface shadow-xl max-w-[240px] w-full">
                    <div className="w-36 h-36 bg-surface-container rounded-2xl mx-auto flex items-center justify-center border border-border-hairline mb-3 p-2">
                      <div className="w-full h-full rounded-xl bg-white p-2 flex items-center justify-center">
                        <PlayQr className="w-full h-full" label={t("QR code to the Dukaan app on Google Play")} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-on-surface block leading-tight">{t("Scan to Get the App")}</span>
                    <span className="text-[10px] text-text-muted">{t("Free on Google Play")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white border-t border-border-hairline py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-border-hairline">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-primary">{t("Dukaan")}</span>
                <span className="px-2 py-0.5 rounded bg-primary-soft text-primary font-bold text-xs">{t("0% COMMISSION FOREVER")}</span>
              </div>
              <p className="text-sm text-text-muted">{t("The neighbourhood commerce operating system for Pakistan & South Asia.")}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-text-muted">
              <a className="hover:text-primary transition-colors" href="/privacy">{t("Privacy Policy")}</a>
              <a className="hover:text-primary transition-colors" href="/terms">{t("Terms of Service")}</a>
              <a className="hover:text-primary transition-colors" href="/community-guidelines">{t("Community Guidelines")}</a>
              <a className="hover:text-primary transition-colors" href="/delete-account">{t("Delete Account")}</a>
              <a className="hover:text-primary transition-colors" href={`mailto:${site.supportEmail}`}>{t("Help & Support")}</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <p>
              ©{' '}
              <span>{new Date().getFullYear()}</span>
              {' '}{t("Dukaan. All rights reserved.")}
            </p>
            <p className="flex items-center gap-1.5 font-medium">
              <span>{t("Made with")}</span>
              <span className="text-danger-red">❤️</span>
              <span>{t("for local dukaandars across Karachi, Lahore, Rawalpindi, Multan & Peshawar.")}</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
