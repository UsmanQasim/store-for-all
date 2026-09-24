import 'expo-sqlite/localStorage/install';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { config } from './config';

/**
 * One client for the whole app. Sessions persist in expo-sqlite's
 * localStorage polyfill (recommended by Supabase for Expo).
 */
export const supabase = createClient(config.supabaseUrl || 'http://localhost', config.supabaseAnonKey || 'anon', {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Only refresh tokens while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
