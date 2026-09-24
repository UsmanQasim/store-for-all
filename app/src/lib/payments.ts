import type { PaymentMethodType } from '@/types/models';

export const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  sadapay: 'SadaPay',
  nayapay: 'NayaPay',
  raast: 'Raast',
  bank_account: 'Bank transfer',
  upi: 'UPI',
  paypal: 'PayPal',
  wise: 'Wise',
  other: 'Other',
};

/** Which methods to suggest first per country. Everything is always available. */
export const PAYMENT_TYPES_BY_COUNTRY: Record<string, PaymentMethodType[]> = {
  PK: ['jazzcash', 'easypaisa', 'raast', 'bank_account', 'sadapay', 'nayapay', 'other'],
  IN: ['upi', 'bank_account', 'other'],
  DEFAULT: ['bank_account', 'paypal', 'wise', 'other'],
};

export function paymentTypesFor(countryCode: string): PaymentMethodType[] {
  const first = PAYMENT_TYPES_BY_COUNTRY[countryCode] ?? PAYMENT_TYPES_BY_COUNTRY.DEFAULT!;
  const all = Object.keys(PAYMENT_LABELS) as PaymentMethodType[];
  return [...first, ...all.filter((t) => !first.includes(t))];
}

export const COUNTRY_DEFAULTS: Record<string, { currency: string; timezone: string }> = {
  PK: { currency: 'PKR', timezone: 'Asia/Karachi' },
  IN: { currency: 'INR', timezone: 'Asia/Kolkata' },
  AE: { currency: 'AED', timezone: 'Asia/Dubai' },
  SA: { currency: 'SAR', timezone: 'Asia/Riyadh' },
  GB: { currency: 'GBP', timezone: 'Europe/London' },
  US: { currency: 'USD', timezone: 'America/New_York' },
  BD: { currency: 'BDT', timezone: 'Asia/Dhaka' },
};

/** Brand-ish label colour per method (P01 / C06 tiles). */
export const PAYMENT_TONE: Record<PaymentMethodType, string> = {
  jazzcash: '#D93F3F',
  easypaisa: '#1E8E4E',
  sadapay: '#0042a3',
  nayapay: '#0042a3',
  raast: '#A86A00',
  bank_account: '#00543b',
  upi: '#A86A00',
  paypal: '#0042a3',
  wise: '#1E8E4E',
  other: '#6B645C',
};

/** Steps shown on the counter poster, matched to what the shop actually offers. */
export function posterSteps(shop: { accepts_bookings: boolean; accepts_orders: boolean; offers_delivery: boolean }, methodLabels: string[]) {
  const steps: { title: string; body: string }[] = [];
  if (shop.accepts_bookings) steps.push({ title: 'Book Appointment', body: 'Skip the waiting bench & lock your slot' });
  if (shop.accepts_orders) steps.push({ title: 'Pre-order from Home', body: shop.offers_delivery ? 'We pack it — pick up or get it delivered' : 'We pack it — just pick it up' });
  steps.push({ title: shop.accepts_bookings ? 'View Service Menu & Rates' : 'See Prices & Offers', body: 'Always up to date, right on your phone' });
  steps.push({ title: 'Direct 0% Fee Payment', body: methodLabels.length ? methodLabels.slice(0, 3).join(', ') : 'Pay the shop directly' });
  return steps.slice(0, 3);
}

/** Readable account numbers: IBAN in groups of 4, PK mobile wallets as "0300 1234567". */
export function formatAccount(v: string | null | undefined): string {
  const s = (v ?? '').replace(/\s/g, '');
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{8,}$/i.test(s)) return s.replace(/(.{4})/g, '$1 ').trim();
  if (/^03\d{9}$/.test(s)) return `${s.slice(0, 4)} ${s.slice(4)}`;
  return v ?? '';
}
