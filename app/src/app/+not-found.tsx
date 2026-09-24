import { router } from 'expo-router';
import { EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen title="" scroll={false} contentClassName="flex-1 justify-center p-margin">
      <EmptyState icon="explore_off" title="This page doesn’t exist" action="Go home" onAction={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
