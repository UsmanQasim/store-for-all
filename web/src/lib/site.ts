/** Public site config. Everything here is safe to ship to the browser. */
const pkg = process.env.NEXT_PUBLIC_ANDROID_PACKAGE || 'com.dukaan.app';

export const site = {
  name: 'Dukaan',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://dukaan.app').replace(/\/$/, ''),
  androidPackage: pkg,
  scheme: process.env.NEXT_PUBLIC_APP_SCHEME || 'dukaan',
  playUrl: `https://play.google.com/store/apps/details?id=${pkg}`,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dukaan.app',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};
