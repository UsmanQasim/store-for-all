import { t } from '@/i18n';

/** Maps RPC/DB error codes (see migration `raise exception '<code>'`) to user copy. */
const KNOWN: Record<string, string> = {
  auth_required: 'errors.authRequired',
  forbidden: 'errors.forbidden',
  slot_unavailable: 'errors.slotUnavailable',
  bookings_disabled: 'errors.bookingsDisabled',
  service_unavailable: 'errors.serviceUnavailable',
  too_many_active_bookings: 'errors.tooManyBookings',
  orders_disabled: 'errors.ordersDisabled',
  delivery_unavailable: 'errors.deliveryUnavailable',
  item_unavailable: 'errors.itemUnavailable',
  below_minimum_order: 'errors.belowMinimum',
  too_many_open_orders: 'errors.tooManyOrders',
  cannot_cancel: 'errors.cannotCancel',
  cannot_review_own_shop: 'errors.ownShopReview',
  shop_limit_reached: 'errors.shopLimit',
  catalog_limit_reached: 'errors.catalogLimit',
  post_rate_limited: 'errors.postLimit',
  invalid_transition: 'errors.invalidTransition',
  payment_limit_reached: 'errors.paymentLimit',
};

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  const raw =
    typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : String(err);
  const pgCode = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : undefined;
  const key = Object.keys(KNOWN).find((k) => raw.startsWith(k));
  if (key) return new AppError(t(KNOWN[key]), key);
  if (pgCode === '23505') return new AppError(t('errors.duplicate'), 'duplicate');
  if (/network|fetch/i.test(raw)) return new AppError(t('errors.network'), 'network');
  return new AppError(raw || t('errors.generic'));
}

/** Throws a friendly AppError when a Supabase response carries an error. */
export function unwrap<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw toAppError(res.error);
  return res.data as T;
}
