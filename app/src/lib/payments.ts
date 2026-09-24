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
