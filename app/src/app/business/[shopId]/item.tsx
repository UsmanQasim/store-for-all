import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Button, Icon, Image, Input, Screen, Segmented, SwitchRow, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { pickAndUpload } from '@/lib/upload';
import { useCatalog, useDeleteItem, useSaveItem } from '@/services/catalog';
import { useShop } from '@/services/shops';
import type { ItemKind } from '@/types/models';

export default function ItemEditor() {
  const { shopId, itemId, kind: kindParam } = useLocalSearchParams<{ shopId: string; itemId?: string; kind?: ItemKind }>();
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
    <Screen
      title={existing ? t('business.editItem') : t('business.addItem')}
      subtitle={shop.data?.name}
      footer={<Button title={t('common.save')} icon="check" onPress={submit} loading={save.isPending} fullWidth />}
    >
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
        accessibilityLabel="Item photo"
        className="h-36 w-36 self-center rounded-xl bg-primary-soft overflow-hidden items-center justify-center border-2 border-dashed border-primary/30"
      >
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" contentFit="cover" />
        ) : (
          <View className="items-center gap-1">
            <Icon name="add_a_photo" className="text-primary text-[28px]" />
            <Text className="font-caption text-caption text-primary font-semibold">Add photo</Text>
          </View>
        )}
      </Pressable>
      <View className="bg-surface-card rounded-xl p-space-lg shadow-sm gap-space-md">
      <Input label={t('business.itemName')} value={name} onChangeText={setName} maxLength={100} />
      <Input label={`${t('business.price')} (${shop.data?.currency ?? ''})`} value={price} onChangeText={(v) => setPrice(v.replace(/[^\d.]/g, ''))} keyboardType="decimal-pad" />
      {kind === 'product' ? <Input label={t('business.unit')} value={unit} onChangeText={setUnit} maxLength={20} /> : <Input label={t('business.duration')} value={duration} onChangeText={(v) => setDuration(v.replace(/\D/g, ''))} keyboardType="number-pad" />}
      <Input label={`Description (${t('common.optional')})`} value={description} onChangeText={setDescription} multiline maxLength={500} />
      </View>
      <View className="bg-surface-card rounded-xl shadow-sm overflow-hidden">
        <SwitchRow title={t('business.available')} subtitle="Hidden items don’t show to customers" value={available} onValueChange={setAvailable} />
      </View>
      {existing ? (
        <Button
          title={t('common.delete')}
          variant="danger"
          icon="delete"
          loading={del.isPending}
          onPress={() =>
            Alert.alert(t('common.delete'), existing.name, [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: () => del.mutateAsync(existing.id).then(() => router.back(), (e) => Alert.alert(toAppError(e).message)),
              },
            ])
          }
        />
      ) : null}
    </Screen>
  );
}
