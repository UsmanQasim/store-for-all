// Public, browser-safe config for the static site. The anon key is designed to be public;
// Row Level Security in Postgres decides what it can read.
window.DUKAAN = {
  brand: 'Dukaan',
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-ANON-OR-PUBLISHABLE-KEY',
  androidPackage: 'com.dukaan.app',
  scheme: 'dukaan',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dukaan.app',
  supportEmail: 'support@dukaan.app',
};
