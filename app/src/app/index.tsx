import { Redirect } from 'expo-router';
import { KEYS, kv } from '@/lib/storage';

export default function Index() {
  return <Redirect href={kv.get(KEYS.onboarded) ? '/(tabs)' : '/onboarding'} />;
}
