import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { DEFAULT_HOURS, HoursEditor } from '@/components/HoursEditor';
import { Icon, SafeAreaView, Text, TextInput, type IconName } from '@/components/nw';
import { SubHeader } from '@/components/shell';
import { t } from '@/i18n';
import { categoryIcon, categoryName } from '@/lib/categories';
import { toAppError } from '@/lib/errors';
import { groupHours } from '@/lib/format';
import { getCurrentCoords, reverseGeocode, type Coords } from '@/lib/location';
import { COUNTRY_DEFAULTS } from '@/lib/payments';
import { pickAndUpload } from '@/lib/upload';
import { useUserLocation } from '@/providers/LocationProvider';
import { useCategories } from '@/services/shops';
import type { Shop, ShopInput } from '@/types/models';

type Props = {
  initial?: Shop | null;
  busy?: boolean;
  onSubmit: (input: ShopInput, coords: Coords | null) => void;
  /** Extra content under the form (e.g. "Delete shop" in edit mode). */
  children?: ReactNode;
};

const SLOTS = [20, 30, 45, 60];
const DAYS_AHEAD = [3, 7, 14, 30];

/** B02 — Register / edit shop (single scrolling form, sticky publish bar). */
export function ShopForm({ initial, busy, onSubmit, children }: Props) {
  const editing = !!initial;
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
  const [uploading, setUploading] = useState<null | 'logo_url' | 'cover_url'>(null);
  const [editHours, setEditHours] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof ShopInput>(k: K, v: ShopInput[K]) => setF((p) => ({ ...p, [k]: v }));

  const sections = [
    !!(f.name?.trim() && f.category_slug),
    !!(f.phone?.trim() && (coords || f.address?.trim())),
    !!(f.accepts_bookings || f.accepts_orders),
    Object.values(f.opening_hours ?? {}).some((r) => r?.length),
  ];
  const doneCount = sections.filter(Boolean).length;
  const pct = Math.round((doneCount / sections.length) * 100);

  const pinLocation = async () => {
    setLocBusy(true);
    try {
      const c = await getCurrentCoords(true);
      if (!c) return Alert.alert(t('onboarding.locationTitle'), t('onboarding.locationBody'));
      setCoords(c);
      const place = await reverseGeocode(c);
      setF((p) => ({ ...p, area: p.area || place.area || '', city: p.city || place.city || '', country_code: place.countryCode ?? p.country_code }));
    } finally {
      setLocBusy(false);
    }
  };

  const upload = async (key: 'logo_url' | 'cover_url') => {
    setUploading(key);
    try {
      const url = await pickAndUpload(key === 'logo_url' ? 'shop-logo' : 'shop-cover', { aspect: key === 'logo_url' ? [1, 1] : [12, 5], maxWidth: key === 'logo_url' ? 512 : 1200 });
      if (url) set(key, url);
    } catch (e) {
      Alert.alert(toAppError(e).message);
    } finally {
      setUploading(null);
    }
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.name || f.name.trim().length < 2) e.name = t('errors.required');
    if (!f.category_slug) e.category = t('errors.required');
    setErrors(e);
    if (Object.keys(e).length) return Alert.alert(t('errors.required'), [e.name && t('business.shopName'), e.category && t('business.category')].filter(Boolean).join(', '));
    const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v])) as ShopInput;
    onSubmit({ ...clean, name: f.name!.trim(), category_slug: f.category_slug }, coords);
  };

  const hours = groupHours(f.opening_hours);
  const pk = f.country_code === 'PK';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {editing ? <SubHeader title={t('business.editShop')} subtitle={initial!.name} /> : null}
        <ScrollView className="flex-1" contentContainerClassName="pb-8" keyboardShouldPersistTaps="handled">
          {/* Narrative banner */}
          <View className="px-margin pt-4 pb-2">
            <View className="bg-surface-container-low rounded-xl p-space-lg shadow-sm">
              <View className="flex-row items-center justify-between gap-2 mb-space-sm">
                <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft">
                  <Icon name="storefront" fill className="text-primary text-[16px]" />
                  <Text className="text-primary font-label-sm text-label-sm uppercase tracking-wider">{t('common.appName')} Business Mode</Text>
                </View>
                <Text className="font-label-sm text-label-sm text-text-muted">{doneCount} of {sections.length} done</Text>
              </View>
              <Text className="font-headline-lg text-headline-lg text-on-surface">{editing ? t('business.editShop') : 'Register Your Shop'}</Text>
              <Text className="font-body-md text-body-md text-text-muted mt-1">Get local bookings, grocery pre-orders, and a printable counter QR code in minutes.</Text>
              <View className="mt-space-md pt-space-xs">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-caption font-body-lg text-primary font-semibold">Shop Profile & Service Type</Text>
                  <Text className="text-caption font-price-display text-primary">{pct}%</Text>
                </View>
                <View className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </View>
              </View>
            </View>
          </View>

          {/* Visuals */}
          <View className="px-margin mt-space-md">
            <View className="bg-surface-card rounded-xl p-space-md shadow-sm">
              <View className="flex-row items-center justify-between mb-space-sm">
                <View className="flex-1">
                  <Text className="font-headline-sm text-headline-sm text-on-surface">Store Visuals</Text>
                  <Text className="font-caption text-caption text-text-muted">Customers trust shops with clear storefront photos</Text>
                </View>
                <Icon name="photo_camera" className="text-outline text-[20px]" />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('business.cover')}
                onPress={() => upload('cover_url')}
                className="w-full h-[140px] rounded-xl bg-primary-soft items-center justify-center overflow-hidden border-2 border-dashed border-primary-container"
              >
                {f.cover_url ? <Image source={{ uri: f.cover_url }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" /> : null}
                {uploading === 'cover_url' ? (
                  <ActivityIndicator color="#0B6E4F" />
                ) : (
                  <>
                    <View className="flex-row items-center gap-1.5 bg-surface-card/90 px-3 py-1.5 rounded-full shadow-sm">
                      <Icon name="add_a_photo" className="text-primary text-[20px]" />
                      <Text className="text-primary font-body-lg text-body-lg">{f.cover_url ? 'Change Cover Photo' : '+ Add Cover Photo'}</Text>
                    </View>
                    <View className="mt-1 bg-surface-card/85 px-2 py-0.5 rounded-full">
                      <Text className="font-caption text-caption text-text-muted">Recommended 1200 × 500 px</Text>
                    </View>
                  </>
                )}
              </Pressable>
              <View className="-mt-10 ml-space-md flex-row items-end gap-3">
                <Pressable accessibilityRole="button" accessibilityLabel={t('business.logo')} onPress={() => upload('logo_url')} className="w-20 h-20 rounded-xl bg-surface-card shadow-md p-1 border-[3px] border-surface-card">
                  <View className="w-full h-full rounded-lg bg-surface-alt items-center justify-center overflow-hidden">
                    {f.logo_url ? (
                      <Image source={{ uri: f.logo_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : uploading === 'logo_url' ? (
                      <ActivityIndicator color="#0B6E4F" />
                    ) : (
                      <>
                        <Icon name="store" className="text-primary text-[26px]" />
                        <Text className="font-caption text-[11px] font-bold mt-0.5 text-primary">+ Logo</Text>
                      </>
                    )}
                  </View>
                </Pressable>
                <View className="mb-1 flex-1">
                  <Text className="font-body-lg text-body-lg text-on-surface">Shop Emblem / DP</Text>
                  <Text className="font-caption text-caption text-text-muted">Shows up on your shop page & QR standee</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-space-xl px-margin mt-space-lg">
            {/* 1. Basic information */}
            <Section n={1} title="Basic Information" sub="How your neighbours discover and identify your shop">
              <Field label={t('business.shopName')} icon="store" error={errors.name}>
                <TextInput value={f.name ?? ''} onChangeText={(v) => set('name', v)} maxLength={80} placeholder="e.g. Bismillah Kiryana Store" accessibilityLabel={t('business.shopName')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
              </Field>
              <Field label="Tagline / Specialty" icon="verified">
                <TextInput value={f.tagline ?? ''} onChangeText={(v) => set('tagline', v)} maxLength={120} placeholder="e.g. Fresh milk & daily staples delivered" accessibilityLabel="Tagline" className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
              </Field>
              <View>
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className={`font-caption text-caption ${errors.category ? 'text-danger-red' : 'text-text-muted'}`}>Shop Category (Select One)</Text>
                  <Text className="font-label-sm text-label-sm text-primary">Required</Text>
                </View>
                <View className="flex-row flex-wrap gap-2 pt-1">
                  {(categories.data ?? []).map((c) => {
                    const on = f.category_slug === c.slug;
                    return (
                      <Pressable
                        key={c.slug}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        onPress={() =>
                          setF((p) => ({
                            ...p,
                            category_slug: c.slug,
                            accepts_bookings: editing ? p.accepts_bookings : c.supports_booking,
                            accepts_orders: editing ? p.accepts_orders : c.supports_ordering,
                          }))
                        }
                        className={`h-10 px-3.5 rounded-full flex-row items-center gap-1.5 ${on ? 'bg-primary shadow-sm' : 'bg-surface-container-low border border-border-hairline'}`}
                      >
                        <Icon name={on ? 'check' : categoryIcon(c.slug)} className={`${on ? 'text-on-primary' : 'text-text-muted'} text-[18px]`} />
                        <Text className={`font-body-lg text-body-lg ${on ? 'text-on-primary' : 'text-on-surface'}`}>{categoryName(c)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View>
                <Text className="font-caption text-caption text-text-muted mb-1.5">About Your Shop</Text>
                <View className="bg-surface-container-low rounded-xl p-3 border border-border-hairline">
                  <TextInput
                    value={f.description ?? ''}
                    onChangeText={(v) => set('description', v)}
                    multiline
                    maxLength={2000}
                    textAlignVertical="top"
                    placeholder="Tell neighbours about your experience, hygiene standards, and specialties."
                    accessibilityLabel={t('business.description')}
                    className="min-h-[88px] font-body-md text-body-md text-on-surface p-0"
                  />
                </View>
              </View>
            </Section>

            {/* 2. Location & contact */}
            <Section n={2} title="Location & Direct Contact" sub="Direct phone line & GPS coordinates for neighbourhood mapping">
              <Field label="Primary Phone Number" prefix={pk ? '+92' : undefined} trailing="call">
                <TextInput value={f.phone ?? ''} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" maxLength={20} placeholder="0300 1234567" accessibilityLabel={t('business.phone')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
              </Field>
              <Field
                label="WhatsApp for Pre-orders / Inquiries"
                prefix={pk ? '+92' : undefined}
                prefixTone="success"
                trailing="sms"
                trailingTone="success"
                badge={f.whatsapp ? 'Active' : undefined}
              >
                <TextInput value={f.whatsapp ?? ''} onChangeText={(v) => set('whatsapp', v)} keyboardType="phone-pad" maxLength={20} placeholder="0300 1234567" accessibilityLabel={t('business.whatsapp')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
              </Field>
              <Pressable accessibilityRole="button" onPress={pinLocation} disabled={locBusy} className="w-full min-h-[52px] bg-primary-soft rounded-xl flex-row items-center justify-between px-4 gap-2 active:opacity-80">
                <View className="flex-row items-center gap-2 shrink">
                  {locBusy ? <ActivityIndicator color="#0B6E4F" /> : <Icon name="my_location" className="text-[22px] text-primary" />}
                  <Text className="text-primary font-body-lg text-body-lg shrink">{coords ? 'Update pinned location' : t('business.useMyLocation')}</Text>
                </View>
                <View className="px-2 py-0.5 rounded-full bg-surface-card shadow-sm">
                  <Text numberOfLines={1} className="text-on-surface font-label-sm text-label-sm max-w-[140px]">{coords ? `Pinned${f.area ? ` (${f.area})` : ''}` : 'Not pinned yet'}</Text>
                </View>
              </Pressable>
              {coords ? (
                <View className="w-full h-32 rounded-xl overflow-hidden bg-surface-container-high items-center justify-center">
                  <Icon name="map" className="absolute text-primary/15 text-[140px]" />
                  <View className="w-9 h-9 rounded-full bg-primary items-center justify-center shadow-lg">
                    <Icon name="storefront" className="text-on-primary text-[18px]" />
                  </View>
                  <View className="absolute bottom-2 left-2 right-2 flex-row items-center justify-between px-2 py-1 rounded-lg bg-inverse-surface/80">
                    <View className="flex-row items-center gap-1">
                      <Icon name="pin_drop" className="text-[16px] text-secondary-container" />
                      <Text className="text-on-primary font-caption text-caption">
                        {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                      </Text>
                    </View>
                    <Text className="font-caption text-caption text-primary-fixed font-semibold">GPS pinned</Text>
                  </View>
                </View>
              ) : null}
              <Field label={t('business.address')} icon="home_pin">
                <TextInput value={f.address ?? ''} onChangeText={(v) => set('address', v)} maxLength={240} placeholder="Shop #14, Main Commercial Market" accessibilityLabel={t('business.address')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
              </Field>
              <View className="flex-row gap-space-md">
                <View className="flex-1">
                  <Field label="Area / Mohalla">
                    <TextInput value={f.area ?? ''} onChangeText={(v) => set('area', v)} maxLength={80} accessibilityLabel={t('business.area')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
                  </Field>
                </View>
                <View className="flex-1">
                  <Field label={t('business.city')}>
                    <TextInput value={f.city ?? ''} onChangeText={(v) => set('city', v)} maxLength={80} accessibilityLabel={t('business.city')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
                  </Field>
                </View>
              </View>
            </Section>

            {/* 3. Features */}
            <Section n={3} title="What can customers do?" sub="Configure seat bookings vs catalog orders">
              <View className="gap-space-lg">
                <ToggleCard
                  title="Accept Seat Bookings / Appointments"
                  sub="Let local clients pick a chair slot without waiting in line"
                  value={!!f.accepts_bookings}
                  onChange={(v) => set('accepts_bookings', v)}
                >
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1">
                      <Text className="font-body-lg text-body-lg text-on-surface">Chairs / Stylists available at once</Text>
                      <Text className="font-caption text-caption text-text-muted">Maximum concurrent customers</Text>
                    </View>
                    <View className="flex-row items-center bg-primary-soft rounded-full px-1 py-0.5">
                      <Pressable accessibilityRole="button" accessibilityLabel="Decrease" onPress={() => set('booking_capacity', Math.max(1, (f.booking_capacity ?? 1) - 1))} className="w-8 h-8 rounded-full items-center justify-center">
                        <Icon name="remove" className="text-primary text-[18px]" />
                      </Pressable>
                      <Text className="w-8 text-center font-price-display text-primary">{f.booking_capacity}</Text>
                      <Pressable accessibilityRole="button" accessibilityLabel="Increase" onPress={() => set('booking_capacity', Math.min(50, (f.booking_capacity ?? 1) + 1))} className="w-8 h-8 rounded-full items-center justify-center">
                        <Icon name="add" className="text-primary text-[18px]" />
                      </Pressable>
                    </View>
                  </View>
                  <View>
                    <Text className="font-caption text-caption text-text-muted mb-2">Appointment slot length</Text>
                    <View className="flex-row gap-2">
                      {SLOTS.map((m) => (
                        <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: f.slot_minutes === m }} onPress={() => set('slot_minutes', m)} className={`flex-1 h-9 rounded-lg items-center justify-center ${f.slot_minutes === m ? 'bg-primary shadow-sm' : 'bg-surface-container'}`}>
                          <Text className={`font-label-sm text-label-sm ${f.slot_minutes === m ? 'text-on-primary' : 'text-on-surface'}`}>{m} min</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between pt-1 gap-2">
                    <View className="flex-1">
                      <Text className="font-body-lg text-body-lg text-on-surface">Advance booking window</Text>
                      <Text className="font-caption text-caption text-text-muted">How early clients can reserve</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => set('booking_days_ahead', DAYS_AHEAD[(DAYS_AHEAD.indexOf(f.booking_days_ahead ?? 7) + 1) % DAYS_AHEAD.length]!)}
                      className="px-3 py-1.5 rounded-lg bg-surface-alt flex-row items-center gap-1"
                    >
                      <Text className="font-label-sm text-label-sm text-on-surface font-semibold">Up to {f.booking_days_ahead} days ahead</Text>
                      <Icon name="expand_more" className="text-text-muted text-[16px]" />
                    </Pressable>
                  </View>
                </ToggleCard>

                <ToggleCard
                  title="Pre-order Products (for Kiryana/Bakeries)"
                  sub="Allows neighbours to add retail goods and grocery carts for counter pickup"
                  value={!!f.accepts_orders}
                  onChange={(v) => set('accepts_orders', v)}
                >
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1">
                      <Text className="font-body-lg text-body-lg text-on-surface">{t('business.offersDelivery')}</Text>
                      <Text className="font-caption text-caption text-text-muted">Customers can choose home delivery</Text>
                    </View>
                    <Switch value={!!f.offers_delivery} onValueChange={(v) => set('offers_delivery', v)} trackColor={{ true: '#00543b', false: '#bec9c1' }} thumbColor="#FFFFFF" accessibilityLabel={t('business.offersDelivery')} />
                  </View>
                  <Field label={`${t('business.minOrder')} (${f.currency})`}>
                    <TextInput value={String(f.min_order_amount ?? 0)} onChangeText={(v) => set('min_order_amount', Number(v.replace(/[^\d.]/g, '')) || 0)} keyboardType="decimal-pad" accessibilityLabel={t('business.minOrder')} className="flex-1 font-body-lg text-body-lg text-on-surface p-0" />
                  </Field>
                </ToggleCard>
              </View>
            </Section>

            {/* 4. Hours */}
            <Section
              n={4}
              title="Operating Hours"
              sub="Weekly timetable & counter availability"
              action={
                <Pressable accessibilityRole="button" onPress={() => setEditHours((v) => !v)} className="flex-row items-center gap-0.5 min-h-[40px]">
                  <Text className="font-body-lg text-primary text-body-lg">{editHours ? t('common.done') : t('common.edit')}</Text>
                  <Icon name={editHours ? 'check' : 'edit_calendar'} className="text-primary text-[18px]" />
                </Pressable>
              }
            >
              {editHours ? (
                <HoursEditor value={f.opening_hours ?? {}} onChange={(v) => set('opening_hours', v)} />
              ) : (
                <View className="gap-2.5">
                  {hours.map((h) => (
                    <Pressable key={h.label} onPress={() => setEditHours(true)} className={`flex-row items-center justify-between p-3 rounded-lg gap-2 ${h.closed ? 'bg-surface-alt' : 'bg-surface-container-low'}`}>
                      <View className="flex-row items-center gap-2.5 shrink">
                        <View className={`w-2.5 h-2.5 rounded-full ${h.closed ? 'bg-outline' : 'bg-success-green'}`} />
                        <Text className={`font-body-lg text-body-lg shrink ${h.closed ? 'text-text-muted' : 'text-on-surface'}`}>{h.label}</Text>
                      </View>
                      {h.closed ? (
                        <View className="flex-row items-center gap-2">
                          <View className="px-2 py-0.5 rounded-full bg-error-container">
                            <Text className="font-label-sm text-label-sm text-on-error-container">Closed / Off</Text>
                          </View>
                          <Text className="font-caption text-caption text-primary">Change</Text>
                        </View>
                      ) : (
                        <Text className="font-price-display text-[14px] text-on-surface">{h.value}</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </Section>

            {/* 5. Visibility */}
            <Section n={5} title="Go Live Visibility" sub="Instantly visible to residents nearby" accent>
              <View className="flex-row items-center justify-between p-3.5 rounded-xl bg-surface-container-low gap-3">
                <View className="flex-1">
                  <Text className="font-body-lg text-body-lg text-on-surface font-semibold">Make shop visible to neighbourhood now</Text>
                  <Text className="font-caption text-caption text-text-muted">Enables customer visits, bookings & orders</Text>
                </View>
                <Switch value={!!f.is_published} onValueChange={(v) => set('is_published', v)} trackColor={{ true: '#00543b', false: '#bec9c1' }} thumbColor="#FFFFFF" accessibilityLabel={t('business.published')} />
              </View>
              <View className="p-3.5 rounded-xl bg-primary-soft flex-row items-start gap-3">
                <View className="w-9 h-9 rounded-full bg-surface-card items-center justify-center shadow-sm mt-0.5">
                  <Icon name="verified_user" fill className="text-success-green text-[22px]" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-lg text-body-lg text-primary font-bold">Zero Commission Guarantee</Text>
                  <Text className="font-body-md text-body-md text-on-surface-variant mt-0.5">{t('common.appName')} never cuts your revenue. Customers pay you 100% directly via wallet, Raast QR, or cash at counter.</Text>
                </View>
              </View>
            </Section>

            {children}
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View className="p-margin bg-surface-card/95 gap-2" style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: !!busy }}
            disabled={busy}
            onPress={submit}
            className="w-full h-[52px] rounded-xl bg-primary flex-row items-center justify-center gap-2 shadow-md active:bg-primary-pressed"
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text className="text-on-primary font-body-lg text-body-lg">{editing ? t('common.save') : 'Publish & Make Shop Live 🚀'}</Text>}
          </Pressable>
          {!editing ? (
            <View className="flex-row items-center justify-center gap-2">
              <Icon name="lock" className="text-[16px] text-success-green" />
              <Text className="text-text-muted font-caption text-caption">Instant counter QR standee generated upon publish</Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ n, title, sub, children, action, accent }: { n: number; title: string; sub: string; children: ReactNode; action?: ReactNode; accent?: boolean }) {
  return (
    <View className="bg-surface-card rounded-xl p-space-lg shadow-sm">
      <View className="flex-row items-center justify-between mb-space-md pb-space-xs gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className={`w-8 h-8 rounded-lg items-center justify-center ${accent ? 'bg-secondary-fixed' : 'bg-primary-soft'}`}>
            <Text className={`font-bold text-[14px] ${accent ? 'text-on-secondary-fixed' : 'text-primary'}`}>{n}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-headline-sm text-headline-sm text-on-surface">{title}</Text>
            <Text className="font-caption text-caption text-text-muted">{sub}</Text>
          </View>
        </View>
        {action}
      </View>
      <View className="gap-space-md">{children}</View>
    </View>
  );
}

function Field({
  label,
  icon,
  prefix,
  prefixTone,
  trailing,
  trailingTone,
  badge,
  error,
  children,
}: {
  label: string;
  icon?: IconName;
  prefix?: string;
  prefixTone?: 'success';
  trailing?: IconName;
  trailingTone?: 'success';
  badge?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className={`font-caption text-caption ${error ? 'text-danger-red' : 'text-text-muted'}`}>{label}</Text>
        {badge ? (
          <View className="flex-row items-center gap-0.5">
            <Icon name="chat" className="text-success-green text-[14px]" />
            <Text className="font-label-sm text-label-sm text-success-green">{badge}</Text>
          </View>
        ) : null}
      </View>
      <View className={`h-[52px] flex-row items-center bg-surface-container-low rounded-xl px-3 gap-2 ${error ? 'border-2 border-danger-red' : 'border border-border-hairline'}`}>
        {icon ? <Icon name={icon} className="text-outline text-[20px]" /> : null}
        {prefix ? <Text className={`font-label-sm text-label-sm font-bold ${prefixTone === 'success' ? 'text-success-green' : 'text-primary'}`}>{prefix}</Text> : null}
        {children}
        {trailing ? <Icon name={trailing} className={`${trailingTone === 'success' ? 'text-success-green' : 'text-outline'} text-[20px]`} /> : null}
      </View>
    </View>
  );
}

function ToggleCard({ title, sub, value, onChange, children }: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <View className="rounded-xl bg-surface-container-low p-space-md">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="font-body-lg text-body-lg text-on-surface shrink">{title}</Text>
            <View className={`px-2 py-0.5 rounded-full ${value ? 'bg-success-soft' : 'bg-surface-container-highest'}`}>
              <Text className={`font-label-sm text-label-sm uppercase ${value ? 'text-success-green' : 'text-text-muted'}`}>{value ? 'Active' : 'Disabled'}</Text>
            </View>
          </View>
          <Text className="font-caption text-caption text-text-muted mt-0.5">{sub}</Text>
        </View>
        <Switch value={value} onValueChange={onChange} trackColor={{ true: '#00543b', false: '#bec9c1' }} thumbColor="#FFFFFF" accessibilityLabel={title} />
      </View>
      {value ? <View className="mt-space-md gap-space-md bg-surface-card rounded-lg p-space-md shadow-sm">{children}</View> : null}
    </View>
  );
}
