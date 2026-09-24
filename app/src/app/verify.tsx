import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { toAppError } from '@/lib/errors';
import { registerForPush } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyCode, sendCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(45);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = async (value = code) => {
    if (!/^\d{6}$/.test(value)) return setError(t('auth.invalidCode'));
    setError(null);
    setBusy(true);
    try {
      await verifyCode(email!, value);
      registerForPush().catch(() => undefined);
      const { data } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user!.id).single();
      if (!profile?.full_name) router.replace('/complete-profile');
      else router.dismiss(2);
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<Button title={t('auth.verify')} onPress={() => submit()} loading={busy} fullWidth />}>
      <Text variant="h1">{t('auth.verifyTitle')}</Text>
      <Text color="textMuted">{t('auth.verifySubtitle', { email: email ?? '' })}</Text>
      <Input
        label={t('auth.code')}
        value={code}
        onChangeText={(v) => {
          const digits = v.replace(/\D/g, '').slice(0, 6);
          setCode(digits);
          if (digits.length === 6) submit(digits);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={6}
        style={{ fontSize: 24, letterSpacing: 8 }}
        error={error}
      />
      <Button
        title={cooldown > 0 ? t('auth.resendIn', { s: cooldown }) : t('auth.resend')}
        variant="ghost"
        disabled={cooldown > 0}
        onPress={async () => {
          try {
            await sendCode(email!);
            setCooldown(45);
          } catch (e) {
            setError(toAppError(e).message);
          }
        }}
      />
    </Screen>
  );
}
