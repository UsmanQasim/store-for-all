import brand from '../../brand.json';

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Surfaces misconfiguration loudly in dev; never ship without these.
    console.warn(`[config] Missing ${name}. Copy .env.example to .env.`);
    return '';
  }
  return value;
}

export const config = {
  brand,
  supabaseUrl: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  webUrl: (process.env.EXPO_PUBLIC_WEB_URL || `https://${brand.webDomain}`).replace(/\/$/, ''),
  /** Optional: Play Console reviewer account (password sign-in). Leave unset to disable. */
  reviewEmail: (process.env.EXPO_PUBLIC_REVIEW_EMAIL ?? '').trim().toLowerCase(),
  playStoreUrl: `https://play.google.com/store/apps/details?id=${brand.androidPackage}`,
} as const;

export const legalUrls = {
  privacy: `${config.webUrl}/privacy`,
  terms: `${config.webUrl}/terms`,
  deleteAccount: `${config.webUrl}/delete-account`,
  guidelines: `${config.webUrl}/community-guidelines`,
} as const;
