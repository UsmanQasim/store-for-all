import { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toAppError } from '@/lib/errors';
import { t } from '@/i18n';
import { moderationApi } from '@/services/social';
import { useAppTheme } from '@/theme';
import type { ReportReason } from '@/types/models';
import { Button, Input, ListRow, Text } from './ui';

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
  const { colors, radius } = useAppTheme();
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
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel={t('common.close')} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }}>
        <View style={{ padding: 20, gap: 8 }}>
          <Text variant="h2">{t('reviews.report')}</Text>
          {REASONS.map((r) => (
            <ListRow
              key={r}
              title={t(`reviews.reasons.${r}`)}
              onPress={() => setReason(r)}
              right={<View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, backgroundColor: reason === r ? colors.primary : 'transparent' }} />}
            />
          ))}
          {reason === 'other' ? <Input value={details} onChangeText={setDetails} placeholder="Tell us more" multiline maxLength={500} /> : null}
          <Button title={t('reviews.report')} onPress={submit} disabled={!reason} loading={busy} variant="danger" />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
