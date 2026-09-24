import type { DayKey, Hours } from './db';

export const DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAME: Record<DayKey, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

export function money(amount: number, currency = 'PKR') {
  if (currency === 'PKR') return `Rs ${Math.round(amount).toLocaleString('en-PK')}`;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function to12h(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Consecutive days with the same hours collapse into one row ("Monday – Saturday"). */
export function groupHours(hours: Hours | null | undefined) {
  if (!hours) return [];
  const key = (d: DayKey) => (hours[d]?.length ? hours[d]!.map((r) => `${to12h(r.open)} – ${to12h(r.close)}`).join(', ') : 'Closed');
  const rows: { label: string; value: string; closed: boolean }[] = [];
  let start = 0;
  for (let i = 1; i <= DAYS.length; i++) {
    if (i === DAYS.length || key(DAYS[i]!) !== key(DAYS[start]!)) {
      const v = key(DAYS[start]!);
      rows.push({ label: i - 1 === start ? DAY_NAME[DAYS[start]!] : `${DAY_NAME[DAYS[start]!]} – ${DAY_NAME[DAYS[i - 1]!]}`, value: v, closed: v === 'Closed' });
      start = i;
    }
  }
  return rows;
}

/** Readable account numbers: IBAN in groups of 4, PK mobile wallets as "0300 1234567". */
export function formatAccount(v: string | null | undefined) {
  const s = (v ?? '').replace(/\s/g, '');
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{8,}$/i.test(s)) return s.replace(/(.{4})/g, '$1 ').trim();
  if (/^03\d{9}$/.test(s)) return `${s.slice(0, 4)} ${s.slice(4)}`;
  return v ?? '';
}

export const PAYMENT_LABELS: Record<string, string> = {
  jazzcash: 'JazzCash', easypaisa: 'Easypaisa', sadapay: 'SadaPay', nayapay: 'NayaPay', raast: 'Raast',
  bank_account: 'Bank transfer', upi: 'UPI', paypal: 'PayPal', wise: 'Wise', other: 'Other',
};
export const PAYMENT_TONE: Record<string, string> = {
  jazzcash: '#D93F3F', easypaisa: '#1E8E4E', sadapay: '#0042a3', nayapay: '#0042a3', raast: '#A86A00', bank_account: '#0B6E4F', upi: '#A86A00', paypal: '#0042a3', wise: '#1E8E4E', other: '#6F756E',
};

/** Category → Material icon and schema.org business type (for rich results). */
export const CATEGORY: Record<string, { icon: string; schema: string }> = {
  barber: { icon: 'content_cut', schema: 'HairSalon' },
  salon: { icon: 'spa', schema: 'BeautySalon' },
  grocery: { icon: 'shopping_basket', schema: 'GroceryStore' },
  pharmacy: { icon: 'medication', schema: 'Pharmacy' },
  bakery: { icon: 'bakery_dining', schema: 'Bakery' },
  restaurant: { icon: 'restaurant', schema: 'Restaurant' },
  tailor: { icon: 'styler', schema: 'LocalBusiness' },
  'mobile-repair': { icon: 'phonelink_setup', schema: 'MobilePhoneStore' },
  laundry: { icon: 'local_laundry_service', schema: 'DryCleaningOrLaundry' },
  clinic: { icon: 'medical_services', schema: 'MedicalClinic' },
  electronics: { icon: 'devices', schema: 'ElectronicsStore' },
  fitness: { icon: 'fitness_center', schema: 'ExerciseGym' },
};
export const categoryOf = (slug: string) => CATEGORY[slug] ?? { icon: 'storefront', schema: 'LocalBusiness' };
