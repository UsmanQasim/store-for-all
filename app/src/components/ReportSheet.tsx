import { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { toAppError } from '@/lib/errors';
import { t } from '@/i18n';
import { moderationApi } from '@/services/social';
import type { ReportReason } from '@/types/models';
import { SafeAreaView } from './nw';
import { Button, Input, Text } from './ui';

const REASONS: ReportReason[] = ['spam', 'offensive', 'harassment', 'fake', 'scam', 'other'];

/** Google Play UGC policy: users must be able to report objectionable content in-app. */
export function ReportSheet({
  visible,
  onClose,
  targetType,
  targetId,
}: {
  visible: boolean;
  onClose: () => void;
  targetType: 'review' | 'shop' | 'post';
  targetId: string;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      await moderationApi.report({ targetType, targetId, reason, details });
      Alert.alert(t('reviews.reported'));
      setReason(null);
      setDetails('');
      onClose();
    } catch (e) {
      Alert.alert(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} accessibilityLabel={t('common.close')} />
      <SafeAreaView edges={['bottom']} className="bg-surface rounded-t-2xl">
        <View className="p-5 gap-2">
          <View className="self-center w-10 h-1 rounded-full bg-outline-variant mb-2" />
          <Text className="font-headline-md text-headline-md text-on-surface mb-1">{t('reviews.report')}</Text>
          {REASONS.map((r) => {
            const on = reason === r;
            return (
              <Pressable
                key={r}
                onPress={() => setReason(r)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                className={`flex-row items-center justify-between min-h-[48px] px-space-md rounded-xl ${on ? 'bg-primary-soft' : 'bg-surface-card'}`}
              >
                <Text className="font-body-lg text-body-lg text-on-surface">{t(`reviews.reasons.${r}`)}</Text>
                <View className={`w-5 h-5 rounded-full border-2 border-primary items-center justify-center`}>
                  {on ? <View className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
                </View>
              </Pressable>
            );
          })}
          {reason === 'other' ? <Input value={details} onChangeText={setDetails} placeholder="Tell us more" multiline maxLength={500} /> : null}
          <Button title={t('reviews.report')} icon="flag" onPress={submit} disabled={!reason} loading={busy} variant="danger" className="mt-2" />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
