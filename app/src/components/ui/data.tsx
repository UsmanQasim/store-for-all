import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { initials } from '@/lib/format';
import { t } from '@/i18n';
import { useAppTheme } from '@/theme';
import type { BookingStatus, OrderStatus } from '@/types/models';
import { Badge, Text, type IconName, type Tone } from './primitives';

export function Avatar({ uri, name, size = 44, rounded = true }: { uri?: string | null; name?: string | null; size?: number; rounded?: boolean }) {
  const { colors } = useAppTheme();
  const r = rounded ? size / 2 : 12;
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: r, backgroundColor: colors.surfaceAlt }} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />;
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant={size > 50 ? 'h2' : 'bodyStrong'} color="primary">{initials(name)}</Text>
    </View>
  );
}

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: onChange ? 8 : 2 }} accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name: IconName = value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline';
        const icon = <Ionicons name={name} size={size} color={colors.star} />;
        return onChange ? (
          <Pressable key={i} onPress={() => onChange(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i} stars`}>
            {icon}
          </Pressable>
        ) : (
          <View key={i}>{icon}</View>
        );
      })}
    </View>
  );
}

export function RatingInline({ avg, count }: { avg: number; count: number }) {
  const { colors } = useAppTheme();
  if (!count) return <Badge label={t('common.new')} tone="info" />;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name="star" size={14} color={colors.star} />
      <Text variant="caption">{Number(avg).toFixed(1)}</Text>
      <Text variant="caption" color="textMuted">({count})</Text>
    </View>
  );
}

const STATUS_TONE: Record<BookingStatus | OrderStatus, Tone> = {
  pending: 'warning',
  placed: 'warning',
  confirmed: 'primary',
  accepted: 'primary',
  packing: 'info',
  ready: 'success',
  out_for_delivery: 'info',
  completed: 'success',
  cancelled: 'neutral',
  rejected: 'danger',
  no_show: 'danger',
};

export function StatusBadge({ status }: { status: BookingStatus | OrderStatus }) {
  return <Badge label={t(`status.${status}`)} tone={STATUS_TONE[status]} />;
}

export function ListRow({ icon, title, subtitle, right, onPress, danger }: { icon?: IconName; title: string; subtitle?: string; right?: ReactNode; onPress?: () => void; danger?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingVertical: 10, paddingHorizontal: 4, opacity: pressed ? 0.7 : 1 })}
    >
      {icon ? (
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: danger ? colors.dangerSoft : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" color={danger ? 'danger' : 'text'}>{title}</Text>
        {subtitle ? <Text variant="caption" color="textMuted">{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

export function SwitchRow({ title, subtitle, value, onValueChange }: { title: string; subtitle?: string; value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? <Text variant="caption" color="textMuted">{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={title} />
    </View>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const { colors, radius } = useAppTheme();
  const btn = (icon: IconName, next: number, label: string, disabled: boolean) => (
    <Pressable
      onPress={() => onChange(next)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}
    >
      <Ionicons name={icon} size={18} color={colors.onPrimary} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill }}>
      {btn('remove', value - 1, 'Decrease', value <= min)}
      <Text variant="bodyStrong" style={{ color: colors.onPrimary, minWidth: 22, textAlign: 'center' }}>{value}</Text>
      {btn('add', value + 1, 'Increase', value >= max)}
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { colors, radius } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4 }} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ flex: 1, minHeight: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.surface : 'transparent' }}
          >
            <Text variant="caption" color={active ? 'text' : 'textMuted'}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StatTile({ label, value, icon, tone = 'primary' }: { label: string; value: string | number; icon: IconName; tone?: 'primary' | 'accent' }) {
  const { colors, radius } = useAppTheme();
  return (
    <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 8, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: tone === 'primary' ? colors.primarySoft : colors.accentSoft }}>
        <Ionicons name={icon} size={18} color={tone === 'primary' ? colors.primary : colors.warning} />
      </View>
      <Text variant="h2">{value}</Text>
      <Text variant="caption" color="textMuted">{label}</Text>
    </View>
  );
}
