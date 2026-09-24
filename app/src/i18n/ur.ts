import type { Dictionary } from './en';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Urdu. Missing keys fall back to English — translate progressively. */
const ur: DeepPartial<Dictionary> = {
  common: {
    appName: 'دکان',
    continue: 'جاری رکھیں',
    cancel: 'منسوخ',
    save: 'محفوظ کریں',
    delete: 'حذف کریں',
    edit: 'ترمیم',
    add: 'شامل کریں',
    done: 'ہو گیا',
    retry: 'دوبارہ کوشش کریں',
    seeAll: 'سب دیکھیں',
    loading: 'لوڈ ہو رہا ہے…',
    copy: 'کاپی',
    copied: 'کاپی ہو گیا',
    share: 'شیئر',
    call: 'کال',
    directions: 'راستہ',
    openNow: 'ابھی کھلا ہے',
    closed: 'بند',
    signIn: 'سائن اِن',
    today: 'آج',
    tomorrow: 'کل',
  },
  tabs: { home: 'ہوم', explore: 'تلاش', scan: 'اسکین', activity: 'سرگرمی', profile: 'پروفائل' },
  onboarding: {
    slide1Title: 'آپ کے آس پاس کی ہر دکان، ایک ایپ میں',
    slide1Body: 'حجام، کریانہ، بیکری اور بہت کچھ اپنے علاقے میں تلاش کریں۔',
    slide2Title: 'سیٹ بُک کریں۔ پہلے سے آرڈر کریں۔ انتظار ختم۔',
    slide2Body: 'اپنی کٹنگ کا وقت محفوظ کریں یا راشن کی لسٹ بھیجیں — دکاندار پیک کر دے گا۔',
    slide3Title: 'ادائیگی کے لیے دکان کا QR اسکین کریں',
    slide3Body: 'دکان کی والٹ یا بینک تفصیلات فوراً دیکھیں اور ایک ٹیپ میں کاپی کریں۔',
    getStarted: 'شروع کریں',
    skip: 'چھوڑیں',
    allowLocation: 'لوکیشن کی اجازت دیں',
    notNow: 'ابھی نہیں',
  },
  home: {
    greeting: 'السلام علیکم{name}',
    nearYou: 'آپ کے قریب',
    searchPlaceholder: 'دکانیں، سروسز، علاقے تلاش کریں',
    categories: 'زمرے',
    favorites: 'آپ کی دکانیں',
    popular: 'قریب کی مشہور دکانیں',
    registerShop: 'اپنی دکان رجسٹر کریں',
  },
  shop: {
    services: 'سروسز',
    products: 'پراڈکٹس',
    reviews: 'ریویوز',
    pay: 'ادائیگی',
    book: 'سیٹ بُک کریں',
    order: 'پہلے سے آرڈر',
    follow: 'پسندیدہ',
    hours: 'اوقات',
  },
  profile: {
    title: 'پروفائل',
    language: 'زبان',
    signOut: 'سائن آؤٹ',
    deleteAccount: 'اکاؤنٹ حذف کریں',
    myBusiness: 'میرا کاروبار',
    registerShop: 'اپنی دکان رجسٹر کریں',
  },
};

export default ur;
