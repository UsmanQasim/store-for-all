import type { IconName } from '@/components/nw';
import { getLocale } from '@/i18n';
import type { Category } from '@/types/models';

/** Material Symbols + short labels used by the Stitch category rail. */
const META: Record<string, { icon: IconName; short: string }> = {
  barber: { icon: 'content_cut', short: 'Barber' },
  salon: { icon: 'spa', short: 'Beauty' },
  grocery: { icon: 'shopping_basket', short: 'Grocery' },
  pharmacy: { icon: 'medication', short: 'Pharmacy' },
  bakery: { icon: 'bakery_dining', short: 'Bakery' },
  restaurant: { icon: 'restaurant', short: 'Restaurant' },
  tailor: { icon: 'styler', short: 'Tailor' },
  'mobile-repair': { icon: 'phonelink_setup', short: 'Repair' },
  laundry: { icon: 'local_laundry_service', short: 'Laundry' },
  clinic: { icon: 'medical_services', short: 'Clinic' },
  electronics: { icon: 'devices', short: 'Electronics' },
  fitness: { icon: 'fitness_center', short: 'Gym' },
  other: { icon: 'storefront', short: 'Other' },
};

export const categoryIcon = (slug: string): IconName => META[slug]?.icon ?? 'storefront';
export const categoryShort = (c: Pick<Category, 'slug' | 'name_en' | 'name_ur'>) => (getLocale() === 'ur' ? c.name_ur : META[c.slug]?.short ?? c.name_en);
export const categoryName = (c: Pick<Category, 'name_en' | 'name_ur'>) => (getLocale() === 'ur' ? c.name_ur : c.name_en);
