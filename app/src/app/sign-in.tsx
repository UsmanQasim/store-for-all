import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { config, legalUrls } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { toAppError } from '@/lib/errors';
import { open } from '@/lib/links';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignIn() {
  const { colors } = useAppTheme();
  const { sendCode } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  // Google Play reviewers can't receive our OTP emails; one pre-created review account signs in with a password.
  const isReviewAccount = !!config.reviewEmail && email.trim().toLowerCase() === config.reviewEmail;

  const submit = async () => {
    if (!EMAIL_RE.test(email.trim())) return setError(t('auth.invalidEmail'));
    setError(null);
    setBusy(true);
    try {
      if (isReviewAccount) {
        const { error: e } = await supabase.auth.signInWithPassword({ email: config.reviewEmail, password });
        if (e) throw e;
        router.dismiss(1);
        return;
      }
      await sendCode(email);
      router.push({ pathname: '/verify', params: { email: email.trim().toLowerCase() } });
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Button title={t('auth.sendCode')} onPress={submit} loading={busy} fullWidth />
          <Text variant="caption" color="textMuted" align="center">
            {t('auth.agree')}{' '}
            <Text variant="caption" color="primary" onPress={() => open.url(legalUrls.terms)}>Terms</Text> ·{' '}
            <Text variant="caption" color="primary" onPress={() => open.url(legalUrls.privacy)}>Privacy</Text>
          </Text>
        </View>
      }
    >
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="storefront" size={32} color={colors.onPrimary} />
      </View>
      <Text variant="h1">{t('auth.title')}</Text>
      <Text color="textMuted">{t('auth.subtitle')}</Text>
      <Input
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        autoFocus
        returnKeyType="send"
        onSubmitEditing={submit}
        leftIcon="mail-outline"
        error={error}
      />
      {isReviewAccount ? <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" /> : null}
    </Screen>
  );
}
