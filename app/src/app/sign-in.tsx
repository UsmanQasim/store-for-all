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
import { BrandLogo } from '@/components/shell';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignIn() {
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
      title=""
      footer={
        <View className="gap-2.5">
          <Button title={t('auth.sendCode')} icon="arrow_forward" onPress={submit} loading={busy} fullWidth />
          <Text className="font-caption text-caption text-text-muted text-center">
            {t('auth.agree')}{' '}
            <Text className="font-caption text-caption text-primary font-semibold" onPress={() => open.url(legalUrls.terms)}>Terms</Text> ·{' '}
            <Text className="font-caption text-caption text-primary font-semibold" onPress={() => open.url(legalUrls.privacy)}>Privacy</Text>
          </Text>
        </View>
      }
    >
      <View className="gap-space-sm pt-space-md">
        <BrandLogo size={56} />
        <Text className="font-headline-lg text-headline-lg text-on-surface">{t('auth.title')}</Text>
        <Text className="font-body-md text-body-md text-text-muted">{t('auth.subtitle')}</Text>
      </View>
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
        leftIcon="mail"
        error={error}
      />
      {isReviewAccount ? <Input label="Password" leftIcon="lock" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" /> : null}
    </Screen>
  );
}
