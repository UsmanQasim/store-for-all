import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { RequireAuth } from '@/components/RequireAuth';
import { Button, EmptyState, Text } from '@/components/ui';
import { t } from '@/i18n';
import { timeAgo } from '@/lib/format';
import { routeFromNotificationData } from '@/lib/notifications';
import { qk } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { notificationsApi, useNotifications } from '@/services/social';
import { useAppTheme } from '@/theme';

export default function Notifications() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useNotifications(!!user);
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.notifications });

  return (
    <RequireAuth>
      <Stack.Screen
        options={{
          title: t('activity.notifications'),
          headerRight: () => <Button title={t('activity.markAllRead')} variant="ghost" size="sm" onPress={() => notificationsApi.markAllRead().then(invalidate)} />,
        }}
      />
      <FlatList
        style={{ backgroundColor: colors.background }}
        data={q.data ?? []}
        keyExtractor={(n) => n.id}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={colors.primary} />}
        ListEmptyComponent={q.isLoading ? null : <EmptyState icon="notifications-off-outline" title={t('activity.noNotifications')} />}
        renderItem={({ item: n }) => (
          <Pressable
            onPress={() => {
              if (!n.read_at) notificationsApi.markRead(n.id).then(invalidate);
              routeFromNotificationData(n.data);
            }}
            style={({ pressed }) => ({ flexDirection: 'row', gap: 12, padding: 16, backgroundColor: n.read_at ? colors.background : colors.primarySoft, opacity: pressed ? 0.8 : 1, borderBottomWidth: 1, borderBottomColor: colors.border })}
          >
            <Ionicons
              name={n.type.startsWith('order') ? 'bag-handle-outline' : n.type.startsWith('booking') ? 'calendar-outline' : n.type.startsWith('review') ? 'star-outline' : 'megaphone-outline'}
              size={22}
              color={colors.primary}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">{n.title}</Text>
              {n.body ? <Text variant="caption" color="textMuted">{n.body}</Text> : null}
              <Text variant="label" color="textMuted">{timeAgo(n.created_at)}</Text>
            </View>
          </Pressable>
        )}
      />
    </RequireAuth>
  );
}
