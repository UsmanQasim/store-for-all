import type { Session, User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toAppError } from '@/lib/errors';
import { unregisterPush } from '@/lib/notifications';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { deleteAllMyMedia } from '@/lib/upload';
import { profileApi } from '@/services/social';
import type { Profile } from '@/types/models';

type AuthState = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => void;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const profileQuery = useQuery({
    queryKey: qk.profile,
    queryFn: () => profileApi.get(user!.id),
    enabled: !!user,
  });

  const sendCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    if (error) throw toAppError(error);
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
    if (error) throw toAppError(error);
  }, []);

  const signOut = useCallback(async () => {
    await unregisterPush();
    await supabase.auth.signOut();
    qc.clear();
  }, [qc]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await unregisterPush();
    await deleteAllMyMedia(user.id).catch(() => undefined);
    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw toAppError(error);
    await supabase.auth.signOut({ scope: 'local' });
    qc.clear();
  }, [user, qc]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      session,
      user,
      profile: profileQuery.data ?? null,
      refreshProfile: () => qc.invalidateQueries({ queryKey: qk.profile }),
      sendCode,
      verifyCode,
      signOut,
      deleteAccount,
    }),
    [ready, session, user, profileQuery.data, qc, sendCode, verifyCode, signOut, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
