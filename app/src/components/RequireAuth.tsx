import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { t } from '@/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { EmptyState, Screen } from './ui';

/** Guests can browse everything; actions that need an account render this gate. */
export function RequireAuth({ children, body }: { children: ReactNode; body?: string }) {
  const { user } = useAuth();
  if (user) return <>{children}</>;
  return (
    <Screen title="" scroll={false} contentClassName="flex-1 justify-center p-margin">
      <EmptyState icon="account_circle" title={t('common.signInToContinue')} body={body ?? t('profile.guestBody')} action={t('common.signIn')} onAction={() => router.push('/sign-in')} />
    </Screen>
  );
}

/** For buttons: returns true if signed in, otherwise opens sign-in. */
export function useEnsureAuth() {
  const { user } = useAuth();
  return () => {
    if (user) return true;
    router.push('/sign-in');
    return false;
  };
}
