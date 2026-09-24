import { router, Stack } from 'expo-router';
import { EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: '' }} />
      <EmptyState icon="compass-outline" title="This page doesn’t exist" action="Go home" onAction={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
