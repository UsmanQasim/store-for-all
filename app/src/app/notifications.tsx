import { useQueryClient } from '@tanstack/react-query';
import { Pressable, RefreshControl, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { EmptyState, Icon, LoadingState, Screen, Text, type IconName } from '@/components/ui';
import { t } from '@/i18n';
import { timeAgo } from '@/lib/format';
import { routeFromNotificationData } from '@/lib/notifications';
import { qk } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { notificationsApi, useNotifications } from '@/services/social';

const iconFor = (type: string): IconName =>
  type.startsWith('order') ? 'shopping_bag' : type.startsWith('booking') ? 'event' : type.startsWith('review') ? 'star' : 'campaign';

export default function Notifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useNotifications(!!user);
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.notifications });
  const list = q.data ?? [];
  const unread = list.some((n) => !n.read_at);

  return (
    <RequireAuth>
      <Screen
        title={t('activity.notifications')}
        right={
          unread ? (
            <Pressable onPress={() => notificationsApi.markAllRead().then(invalidate)} accessibilityRole="button" hitSlop={8} className="px-2 py-1">
              <Text className="font-caption text-caption text-primary font-bold">{t('activity.markAllRead')}</Text>
            </Pressable>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor="#00543b" />}
        contentClassName="p-margin gap-space-sm pb-8"
      >
        {q.isLoading ? (
          <LoadingState />
        ) : list.length === 0 ? (
          <EmptyState icon="notifications_off" title={t('activity.noNotifications')} />
        ) : (
          list.map((n) => (
            <Pressable
              key={n.id}
              accessibilityRole="button"
              onPress={() => {
                if (!n.read_at) notificationsApi.markRead(n.id).then(invalidate);
                routeFromNotificationData(n.data);
              }}
              className={`flex-row gap-space-md p-space-md rounded-xl shadow-sm active:opacity-90 ${n.read_at ? 'bg-surface-card' : 'bg-primary-soft'}`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center ${n.read_at ? 'bg-surface-container' : 'bg-surface-card'}`}>
                <Icon name={iconFor(n.type)} className="text-primary text-[20px]" />
              </View>
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-start gap-2">
                  <Text className="flex-1 font-body-lg text-body-lg text-on-surface font-semibold">{n.title}</Text>
                  {!n.read_at ? <View className="w-2 h-2 rounded-full bg-secondary-container mt-2" /> : null}
                </View>
                {n.body ? <Text className="font-body-md text-body-md text-on-surface-variant">{n.body}</Text> : null}
                <Text className="font-caption text-caption text-text-muted">{timeAgo(n.created_at)}</Text>
              </View>
            </Pressable>
          ))
        )}
      </Screen>
    </RequireAuth>
  );
}
