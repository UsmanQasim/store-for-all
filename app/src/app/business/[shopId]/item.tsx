import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { Button, Input, Screen, Segmented, SwitchRow, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { pickAndUpload } from '@/lib/upload';
import { useCatalog, useDeleteItem, useSaveItem } from '@/services/catalog';
import { useShop } from '@/services/shops';
import { useAppTheme } from '@/theme';
import type { ItemKind } from '@/types/models';

export default function ItemEditor() {
  const { shopId, itemId, kind: kindParam } = useLocalSearchParams<{ shopId: string; itemId?: string; kind?: ItemKind }>();
  const { colors, radius } = useAppTheme();
  const shop = useShop(shopId);
  const items = useCatalog(shopId);
  const existing = items.data?.find((i) => i.id === itemId);
  const save = useSaveItem(shopId);
  const del = useDeleteItem(shopId);

  const [kind, setKind] = useState<ItemKind>(kindParam ?? 'service');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [duration, setDuration] = useState('30');
  const [image, setImage] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!existing) return;
    setKind(existing.kind);
    setName(existing.name);
    setDescription(existing.description ?? '');
    setPrice(String(existing.price));
    setUnit(existing.unit ?? '');
    setDuration(String(existing.duration_minutes ?? 30));
    setImage(existing.image_url);
    setAvailable(existing.is_available);
  }, [existing]);

  const submit = async () => {
    const p = Number(price);
    if (!name.trim() || Number.isNaN(p) || p < 0) return Alert.alert(t('errors.required'));
    try {
      await save.mutateAsync({
        id: existing?.id,
        shop_id: shopId,
        kind,
        name: name.trim(),
        description: description.trim() || null,
        price: p,
        unit: kind === 'product' ? unit.trim() || null : null,
        duration_minutes: kind === 'service' ? Math.min(480, Math.max(5, Number(duration) || 30)) : null,
        image_url: image,
        is_available: available,
        sort: existing?.sort ?? 0,
      });
      router.back();
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  return (
    <Screen footer={<Button title={t('common.save')} onPress={submit} loading={save.isPending} fullWidth />}>
      <Stack.Screen options={{ title: existing ? t('business.editItem') : t('business.addItem') }} />
      {!existing ? <Segmented<ItemKind> value={kind} onChange={setKind} options={[{ value: 'service', label: t('business.service') }, { value: 'product', label: t('business.product') }]} /> : null}
      <Pressable
        onPress={async () => {
          try {
            const url = await pickAndUpload('items', { aspect: [1, 1], maxWidth: 800 });
            if (url) setImage(url);
          } catch (e) {
            Alert.alert(toAppError(e).message);
          }
        }}
        accessibilityRole="button"
        style={{ height: 140, width: 140, alignSelf: 'center', borderRadius: radius.lg, backgroundColor: colors.primarySoft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
      >
        {image ? <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <Text color="primary">+ Photo</Text>}
      </Pressable>
      <Input label={t('business.itemName')} value={name} onChangeText={setName} maxLength={100} />
      <Input label={`${t('business.price')} (${shop.data?.currency ?? ''})`} value={price} onChangeText={(v) => setPrice(v.replace(/[^\d.]/g, ''))} keyboardType="decimal-pad" />
      {kind === 'product' ? <Input label={t('business.unit')} value={unit} onChangeText={setUnit} maxLength={20} /> : <Input label={t('business.duration')} value={duration} onChangeText={(v) => setDuration(v.replace(/\D/g, ''))} keyboardType="number-pad" />}
      <Input label={`${t('business.description')} (${t('common.optional')})`} value={description} onChangeText={setDescription} multiline maxLength={500} />
      <SwitchRow title={t('business.available')} value={available} onValueChange={setAvailable} />
      {existing ? (
        <Button
          title={t('common.delete')}
          variant="danger"
          loading={del.isPending}
          onPress={async () => {
            await del.mutateAsync(existing.id);
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
