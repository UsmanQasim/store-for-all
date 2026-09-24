import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { t } from '@/i18n';
import { useAppTheme } from '@/theme';
import { Button, Text, type IconName } from './primitives';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
};

/** Base screen: safe area, background, optional scroll + sticky footer (CTA bar). */
export function Screen({ children, scroll = true, padded = true, edges = ['bottom'], footer, contentStyle, refreshControl }: ScreenProps) {
  const { colors } = useAppTheme();
  const pad = padded ? { padding: 16, gap: 16 } : null;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[pad, { paddingBottom: 32 }, contentStyle]}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
        )}
        {footer ? (
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>{footer}</View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="h3" accessibilityRole="header">{title}</Text>
      {action && onAction ? <Button title={action} variant="ghost" size="sm" onPress={onAction} /> : null}
    </View>
  );
}

export function EmptyState({ icon = 'sparkles-outline', title, body, action, onAction }: { icon?: IconName; title: string; body?: string; action?: string; onAction?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 10 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text variant="h3" align="center">{title}</Text>
      {body ? <Text color="textMuted" align="center">{body}</Text> : null}
      {action && onAction ? <Button title={action} onPress={onAction} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

export function LoadingState() {
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState icon="cloud-offline-outline" title={message ?? t('errors.generic')} action={onRetry ? t('common.retry') : undefined} onAction={onRetry} />
  );
}

/** Wraps a query result: loading → error → content. */
export function QueryView<T>({ query, children, empty }: { query: { data: T | undefined; isLoading: boolean; error: unknown; refetch: () => unknown }; children: (data: T) => ReactNode; empty?: ReactNode }) {
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />;
  if (query.data == null || (Array.isArray(query.data) && query.data.length === 0)) return <>{empty ?? null}</>;
  return <>{children(query.data)}</>;
}
