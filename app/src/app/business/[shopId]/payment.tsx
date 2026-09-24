import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Chip, Input, Screen, SwitchRow, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { PAYMENT_LABELS, paymentTypesFor } from '@/lib/payments';
import { pickAndUpload } from '@/lib/upload';
import { useDeletePayment, usePaymentMethods, useSavePayment } from '@/services/catalog';
import { useShop } from '@/services/shops';
import type { PaymentMethodType } from '@/types/models';

export default function PaymentEditor() {
  const { shopId, paymentId } = useLocalSearchParams<{ shopId: string; paymentId?: string }>();
  const shop = useShop(shopId);
  const list = usePaymentMethods(shopId);
  const existing = list.data?.find((m) => m.id === paymentId);
  const save = useSavePayment(shopId);
  const del = useDeletePayment(shopId);
  const types = paymentTypesFor(shop.data?.country_code ?? 'PK');

  const [type, setType] = useState<PaymentMethodType>(types[0]!);
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [iban, setIban] = useState('');
  const [bank, setBank] = useState('');
  const [note, setNote] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [primary, setPrimary] = useState(false);

  useEffect(() => {
    if (!existing) {
      setPrimary(!list.data?.length);
      return;
    }
    setType(existing.type);
    setTitle(existing.account_title);
    setNumber(existing.account_number ?? '');
    setIban(existing.iban ?? '');
    setBank(existing.bank_name ?? '');
    setNote(existing.note ?? '');
    setQr(existing.qr_image_url);
    setPrimary(existing.is_primary);
  }, [existing, list.data?.length]);

  const isBank = type === 'bank_account' || type === 'raast';
  const numberLabel = type === 'upi' ? 'UPI ID' : type === 'paypal' || type === 'wise' ? 'Email / handle' : isBank ? 'Account number' : 'Mobile wallet number';

  const submit = async () => {
    if (!title.trim() || (!number.trim() && !iban.trim())) return Alert.alert(t('errors.required'));
    try {
      await save.mutateAsync({
        id: existing?.id,
        shop_id: shopId,
        type,
        account_title: title.trim(),
        account_number: number.trim() || null,
        iban: iban.replace(/\s/g, '').toUpperCase() || null,
        bank_name: bank.trim() || null,
        qr_image_url: qr,
        note: note.trim() || null,
        is_primary: primary,
        sort: existing?.sort ?? list.data?.length ?? 0,
      });
      router.back();
    } catch (e) {
      Alert.alert(toAppError(e).message);
    }
  };

  return (
    <Screen footer={<Button title={t('common.save')} onPress={submit} loading={save.isPending} fullWidth />}>
      <Stack.Screen options={{ title: t('business.addPayment') }} />
      <Text variant="caption" color="textMuted">{t('business.paymentType')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {types.map((ty) => <Chip key={ty} label={PAYMENT_LABELS[ty]} selected={type === ty} onPress={() => setType(ty)} />)}
      </View>
      <Input label={t('business.accountTitle')} value={title} onChangeText={setTitle} maxLength={80} autoCapitalize="words" />
      <Input label={numberLabel} value={number} onChangeText={setNumber} maxLength={64} keyboardType={type === 'upi' || type === 'paypal' || type === 'wise' ? 'email-address' : 'number-pad'} autoCapitalize="none" />
      {isBank ? (
        <>
          <Input label={t('business.bankName')} value={bank} onChangeText={setBank} maxLength={80} />
          <Input label={t('business.iban')} value={iban} onChangeText={setIban} maxLength={34} autoCapitalize="characters" />
        </>
      ) : null}
      <Input label={`Note (${t('common.optional')})`} value={note} onChangeText={setNote} maxLength={200} placeholder="e.g. Send screenshot on WhatsApp" />
      <Button
        title={qr ? '✓ QR uploaded — replace' : t('business.paymentQr')}
        variant="secondary"
        icon="qr-code-outline"
        onPress={async () => {
          try {
            const url = await pickAndUpload('payment-qr', { aspect: [1, 1], maxWidth: 900 });
            if (url) setQr(url);
          } catch (e) {
            Alert.alert(toAppError(e).message);
          }
        }}
      />
      {qr ? <Image source={{ uri: qr }} style={{ width: 160, height: 160, alignSelf: 'center', borderRadius: 12 }} contentFit="contain" /> : null}
      <SwitchRow title={t('business.primary')} value={primary} onValueChange={setPrimary} />
      {existing ? (
        <Button
          title={t('common.delete')}
          variant="danger"
          onPress={async () => {
            await del.mutateAsync(existing.id);
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
