import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { DEFAULT_HOURS, HoursEditor } from '@/components/HoursEditor';
import { Avatar, Button, Card, Chip, Input, SectionHeader, SwitchRow, Text } from '@/components/ui';
import { getLocale, t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { getCurrentCoords, reverseGeocode, type Coords } from '@/lib/location';
import { COUNTRY_DEFAULTS } from '@/lib/payments';
import { pickAndUpload } from '@/lib/upload';
import { useUserLocation } from '@/providers/LocationProvider';
import { useCategories } from '@/services/shops';
import { useAppTheme } from '@/theme';
import type { Shop, ShopInput } from '@/types/models';

type Props = {
  initial?: Shop | null;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (input: ShopInput, coords: Coords | null) => void;
};

/** Shared by "Register shop" and "Edit shop". Everything is on one scrollable form, grouped in cards. */
export function ShopForm({ initial, submitLabel, busy, onSubmit }: Props) {
  const { colors, radius } = useAppTheme();
  const categories = useCategories();
  const userLoc = useUserLocation();
  const defaults = COUNTRY_DEFAULTS[userLoc.countryCode ?? 'PK'] ?? COUNTRY_DEFAULTS.PK!;

  const [f, setF] = useState<ShopInput>(() => ({
    name: initial?.name ?? '',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    category_slug: initial?.category_slug ?? '',
    phone: initial?.phone ?? '',
    whatsapp: initial?.whatsapp ?? '',
    address: initial?.address ?? '',
    area: initial?.area ?? '',
    city: initial?.city ?? '',
    country_code: initial?.country_code ?? userLoc.countryCode ?? 'PK',
    currency: initial?.currency ?? defaults.currency,
    timezone: initial?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? defaults.timezone,
    logo_url: initial?.logo_url ?? null,
    cover_url: initial?.cover_url ?? null,
    opening_hours: initial?.opening_hours ?? DEFAULT_HOURS,
    accepts_bookings: initial?.accepts_bookings ?? false,
    accepts_orders: initial?.accepts_orders ?? false,
    offers_delivery: initial?.offers_delivery ?? false,
    booking_capacity: initial?.booking_capacity ?? 1,
    slot_minutes: initial?.slot_minutes ?? 30,
    booking_days_ahead: initial?.booking_days_ahead ?? 7,
    min_order_amount: initial?.min_order_amount ?? 0,
    is_published: initial?.is_published ?? true,
  }));
  const [coords, setCoords] = useState<Coords | null>(initial?.lat != null && initial?.lng != null ? { lat: initial.lat, lng: initial.lng } : null);
  const [locBusy, setLocBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof ShopInput>(k: K, v: ShopInput[K]) => setF((p) => ({ ...p, [k]: v }));

  const pinLocation = async () => {
    setLocBusy(true);
    const c = await getCurrentCoords(true);
    setLocBusy(false);
    if (!c) return Alert.alert(t('onboarding.locationTitle'), t('onboarding.locationBody'));
    setCoords(c);
    const place = await reverseGeocode(c);
    setF((p) => ({ ...p, area: p.area || place.area || '', city: p.city || place.city || '', country_code: place.countryCode ?? p.country_code }));
  };

  const upload = async (key: 'logo_url' | 'cover_url') => {
    try {
      const url = await pickAndUpload(key === 'logo_url' ? 'shop-logo' : 'shop-cover', { aspect: key === 'logo_url' ? [1, 1] : [16, 9], maxWidth: key === 'logo_url' ? 512 : 1280 });
      if (url) set(key, url);
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.name || f.name.trim().length < 2) e.name = t('errors.required');
    if (!f.category_slug) e.category = t('errors.required');
    setErrors(e);
    if (Object.keys(e).length) return;
    const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v])) as ShopInput;
    onSubmit({ ...clean, name: f.name!.trim(), category_slug: f.category_slug }, coords);
  };

  const cat = categories.data?.find((c) => c.slug === f.category_slug);

  return (
    <View style={{ gap: 16 }}>
      {/* Branding */}
      <Pressable onPress={() => upload('cover_url')} accessibilityRole="button" accessibilityLabel={t('business.cover')} style={{ height: 150, borderRadius: radius.lg, backgroundColor: colors.primarySoft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {f.cover_url ? <Image source={{ uri: f.cover_url }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" /> : <Text color="primary">+ {t('business.cover')}</Text>}
      </Pressable>
      <Pressable onPress={() => upload('logo_url')} accessibilityRole="button" accessibilityLabel={t('business.logo')} style={{ marginTop: -56, marginLeft: 16, alignSelf: 'flex-start', borderRadius: 20, borderWidth: 4, borderColor: colors.background }}>
        <Avatar uri={f.logo_url} name={f.name || '+'} size={80} rounded={false} />
      </Pressable>

      <Card style={{ gap: 14 }}>
        <Input label={t('business.shopName')} value={f.name ?? ''} onChangeText={(v) => set('name', v)} maxLength={80} error={errors.name} />
        <Input label={`${t('business.tagline')} (${t('common.optional')})`} placeholder={t('business.taglinePlaceholder')} value={f.tagline ?? ''} onChangeText={(v) => set('tagline', v)} maxLength={120} />
        <View style={{ gap: 8 }}>
          <Text variant="caption" color={errors.category ? 'danger' : 'textMuted'}>{t('business.category')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(categories.data ?? []).map((c) => (
              <Chip
                key={c.slug}
                label={getLocale() === 'ur' ? c.name_ur : c.name_en}
                icon={c.icon as never}
                selected={f.category_slug === c.slug}
                onPress={() =>
                  setF((p) => ({
                    ...p,
                    category_slug: c.slug,
                    // Sensible defaults from the category, only on first pick.
                    accepts_bookings: initial ? p.accepts_bookings : c.supports_booking,
                    accepts_orders: initial ? p.accepts_orders : c.supports_ordering,
                  }))
                }
              />
            ))}
          </View>
        </View>
        <Input label={`${t('business.description')} (${t('common.optional')})`} value={f.description ?? ''} onChangeText={(v) => set('description', v)} multiline maxLength={2000} />
      </Card>

      <SectionHeader title={t('shop.contact')} />
      <Card style={{ gap: 14 }}>
        <Input label={t('business.phone')} value={f.phone ?? ''} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" maxLength={20} />
        <Input label={t('business.whatsapp')} value={f.whatsapp ?? ''} onChangeText={(v) => set('whatsapp', v)} keyboardType="phone-pad" maxLength={20} />
        <Button title={coords ? t('business.locationSet') : t('business.useMyLocation')} icon={coords ? 'checkmark-circle' : 'locate'} variant={coords ? 'secondary' : 'primary'} loading={locBusy} onPress={pinLocation} />
        <Input label={t('business.address')} value={f.address ?? ''} onChangeText={(v) => set('address', v)} maxLength={240} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Input label={t('business.area')} value={f.area ?? ''} onChangeText={(v) => set('area', v)} maxLength={80} /></View>
          <View style={{ flex: 1 }}><Input label={t('business.city')} value={f.city ?? ''} onChangeText={(v) => set('city', v)} maxLength={80} /></View>
        </View>
      </Card>

      <SectionHeader title={t('business.features')} />
      <Card style={{ gap: 6 }}>
        <SwitchRow title={t('business.acceptsBookings')} value={!!f.accepts_bookings} onValueChange={(v) => set('accepts_bookings', v)} />
        {f.accepts_bookings ? (
          <View style={{ gap: 12, paddingBottom: 8 }}>
            <NumberField label={t('business.capacity')} value={f.booking_capacity ?? 1} min={1} max={50} onChange={(v) => set('booking_capacity', v)} />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {[15, 20, 30, 45, 60].map((m) => <Chip key={m} label={`${m} min`} selected={f.slot_minutes === m} onPress={() => set('slot_minutes', m)} />)}
            </View>
            <NumberField label={t('business.daysAhead')} value={f.booking_days_ahead ?? 7} min={1} max={60} onChange={(v) => set('booking_days_ahead', v)} />
          </View>
        ) : null}
        <SwitchRow title={t('business.acceptsOrders')} value={!!f.accepts_orders} onValueChange={(v) => set('accepts_orders', v)} />
        {f.accepts_orders ? (
          <View style={{ gap: 12, paddingBottom: 8 }}>
            <SwitchRow title={t('business.offersDelivery')} value={!!f.offers_delivery} onValueChange={(v) => set('offers_delivery', v)} />
            <Input label={`${t('business.minOrder')} (${f.currency})`} value={String(f.min_order_amount ?? 0)} onChangeText={(v) => set('min_order_amount', Number(v.replace(/[^\d.]/g, '')) || 0)} keyboardType="decimal-pad" />
          </View>
        ) : null}
        {cat && !cat.supports_booking && f.accepts_bookings ? <Text variant="caption" color="textMuted">Tip: bookings are unusual for {cat.name_en}.</Text> : null}
      </Card>

      <SectionHeader title={t('business.hours')} />
      <Card>
        <HoursEditor value={f.opening_hours ?? {}} onChange={(v) => set('opening_hours', v)} />
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {['PKR', 'INR', 'AED', 'SAR', 'BDT', 'GBP', 'USD'].map((c) => <Chip key={c} label={c} selected={f.currency === c} onPress={() => set('currency', c)} />)}
        </View>
        <SwitchRow title={t('business.published')} value={!!f.is_published} onValueChange={(v) => set('is_published', v)} />
      </Card>

      <Button title={submitLabel} onPress={submit} loading={busy} fullWidth />
    </View>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ flex: 1 }}>{label}</Text>
      <Button title="−" size="sm" variant="secondary" onPress={() => onChange(Math.max(min, value - 1))} accessibilityLabel="Decrease" />
      <Text variant="h3" style={{ minWidth: 28, textAlign: 'center' }}>{value}</Text>
      <Button title="+" size="sm" variant="secondary" onPress={() => onChange(Math.min(max, value + 1))} accessibilityLabel="Increase" />
    </View>
  );
}
