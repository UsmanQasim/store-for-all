/**
 * Design-system components from designs/neighbourhood_commerce/DESIGN.md
 * (Stitch "Neighbourhood Commerce"). Built on NativeWind classes = the Stitch tokens.
 */
import { forwardRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View, type PressableProps, type ScrollViewProps, type TextInput as RNTextInput, type TextInputProps, type ViewProps } from 'react-native';
import { initials } from '@/lib/format';
import { t } from '@/i18n';
import type { BookingStatus, OrderStatus } from '@/types/models';
import { Icon, Image, SafeAreaView, Text, TextInput, type IconName } from '../nw';
import { SubHeader } from '../shell';

export { Icon, Image, Text, TextInput, type IconName };

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------------------------------------------------------------- Button
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'soft';
const BTN: Record<ButtonVariant, [string, string, string]> = {
  // container, text, icon
  primary: ['bg-primary-container active:bg-primary-pressed', 'text-on-primary', 'text-on-primary'],
  accent: ['bg-secondary-container active:opacity-90', 'text-on-surface', 'text-on-surface'],
  secondary: ['bg-surface-card border border-border-hairline active:bg-surface-alt', 'text-on-surface', 'text-on-surface'],
  ghost: ['bg-transparent active:bg-primary-soft', 'text-primary-container', 'text-primary-container'],
  danger: ['bg-danger-soft active:opacity-90', 'text-danger-red', 'text-danger-red'],
  soft: ['bg-primary-soft active:opacity-90', 'text-primary', 'text-primary'],
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: IconName;
  iconFill?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function Button({ title, variant = 'primary', size = 'md', icon, iconFill, loading, fullWidth, disabled, className, ...rest }: ButtonProps) {
  const [box, txt, ic] = BTN[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      className={cx(
        'flex-row items-center justify-center gap-2 rounded-xl',
        size === 'md' ? 'h-[52px] px-5' : 'h-10 px-3.5',
        box,
        fullWidth && 'w-full',
        off && 'opacity-50',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#0B6E4F'} />
      ) : (
        <>
          {icon ? <Icon name={icon} fill={iconFill} className={cx(ic, size === 'md' ? 'text-[20px]' : 'text-[18px]')} /> : null}
          <Text className={cx(txt, size === 'md' ? 'font-headline-sm text-headline-sm' : 'font-label-sm text-label-sm')}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, className, iconClassName, fill }: { icon: IconName; label: string; onPress?: () => void; className?: string; iconClassName?: string; fill?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} className={cx('w-12 h-12 rounded-full items-center justify-center active:bg-surface-container-high', className)}>
      <Icon name={icon} fill={fill} className={iconClassName ?? 'text-on-surface text-[24px]'} />
    </Pressable>
  );
}

// ---------------------------------------------------------------- Input
type InputProps = TextInputProps & { label?: string; error?: string | null; hint?: string; leftIcon?: IconName; right?: ReactNode; className?: string };

export const Input = forwardRef<RNTextInput, InputProps>(function Input({ label, error, hint, leftIcon, right, className, multiline, onFocus, onBlur, ...rest }, ref) {
  const [focus, setFocus] = useState(false);
  return (
    <View className={cx('gap-1.5', className)}>
      {label ? <Text className="font-caption text-caption text-text-muted">{label}</Text> : null}
      <View
        className={cx(
          'flex-row bg-surface-card rounded-xl px-4 gap-3',
          multiline ? 'items-start py-3 min-h-[96px]' : 'items-center h-[52px]',
          error ? 'border-2 border-danger-red' : focus ? 'border-2 border-primary-container' : 'border border-border-hairline',
        )}
      >
        {leftIcon ? <Icon name={leftIcon} className="text-text-muted text-[20px]" /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => (setFocus(true), onFocus?.(e))}
          onBlur={(e) => (setFocus(false), onBlur?.(e))}
          className="flex-1 font-body-md text-body-md text-on-surface p-0"
          {...rest}
          style={[Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null, rest.style]}
        />
        {right}
      </View>
      {error ? <Text className="font-caption text-caption text-danger-red">{error}</Text> : hint ? <Text className="font-caption text-caption text-text-muted">{hint}</Text> : null}
    </View>
  );
});

// ---------------------------------------------------------------- Surfaces
export function Card({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cx('bg-surface-card rounded-2xl p-space-lg shadow-sm', className)} {...rest} />;
}

export function PressableCard({ className, children, ...rest }: PressableProps & { className?: string; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" className={cx('bg-surface-card rounded-2xl shadow-sm overflow-hidden active:opacity-90', className)} {...rest}>
      {children}
    </Pressable>
  );
}

export function Divider({ className }: { className?: string }) {
  return <View className={cx('h-px bg-border-hairline', className)} />;
}

// ---------------------------------------------------------------- Chips & badges
export function Chip({ label, selected, icon, onPress, className }: { label: string; selected?: boolean; icon?: IconName; onPress?: () => void; className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={cx('h-10 px-3.5 rounded-full flex-row items-center gap-1.5', selected ? 'bg-primary-container' : 'bg-surface-card border border-border-hairline active:bg-surface-alt', className)}
    >
      {selected && !icon ? <Icon name="check" className="text-on-primary text-[16px]" /> : null}
      {icon ? <Icon name={icon} fill={selected} className={cx(selected ? 'text-on-primary' : 'text-text-muted', 'text-[18px]')} /> : null}
      <Text className={cx('font-label-sm text-label-sm', selected ? 'text-on-primary' : 'text-on-surface')}>{label}</Text>
    </Pressable>
  );
}

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
const TONE: Record<Tone, [string, string]> = {
  neutral: ['bg-surface-alt', 'text-text-muted'],
  primary: ['bg-primary-soft', 'text-primary'],
  success: ['bg-success-soft', 'text-success-green'],
  warning: ['bg-warning-soft', 'text-warning-amber'],
  danger: ['bg-danger-soft', 'text-danger-red'],
  info: ['bg-info-soft', 'text-info-blue'],
};

export function Badge({ label, tone = 'neutral', icon, upper = true, dot }: { label: string; tone?: Tone; icon?: IconName; upper?: boolean; dot?: boolean }) {
  const [bg, fg] = TONE[tone];
  return (
    <View className={cx('self-start flex-row items-center gap-1 px-2.5 py-1 rounded-full', bg)}>
      {dot ? <View className={cx('w-1.5 h-1.5 rounded-full', fg.replace('text-', 'bg-'))} /> : null}
      {icon ? <Icon name={icon} fill className={cx(fg, 'text-[14px]')} /> : null}
      <Text className={cx('font-label-sm text-label-sm', upper && 'uppercase tracking-wider', fg)}>{label}</Text>
    </View>
  );
}

const STATUS_TONE: Record<BookingStatus | OrderStatus, Tone> = {
  pending: 'warning',
  placed: 'warning',
  confirmed: 'success',
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

// ---------------------------------------------------------------- Media & rating
export function Avatar({ uri, name, size = 40, rounded = true, className }: { uri?: string | null; name?: string | null; size?: number; rounded?: boolean; className?: string }) {
  const r = rounded ? size / 2 : Math.round(size * 0.25);
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: r }} className={cx('bg-surface-container', className)} contentFit="cover" transition={150} />;
  return (
    <View style={{ width: size, height: size, borderRadius: r }} className={cx('bg-primary-soft items-center justify-center', className)}>
      <Text className="text-primary font-bold" style={{ fontSize: Math.max(12, size * 0.36) }}>{initials(name)}</Text>
    </View>
  );
}

export function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <View className={cx('flex-row', onChange ? 'gap-2' : 'gap-0.5')} accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const icon = <Icon name="star" fill={value >= i - 0.25} size={size} color={value >= i - 0.25 ? '#fda60f' : '#bec9c1'} />;
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
  if (!count) return <Badge label={t('common.new')} tone="info" />;
  return (
    <View className="flex-row items-center gap-1">
      <Icon name="star" fill className="text-secondary-container text-[16px]" />
      <Text className="font-price-display text-price-display text-on-surface">{Number(avg).toFixed(1)}</Text>
      <Text className="font-caption text-caption text-text-muted">({count})</Text>
    </View>
  );
}

// ---------------------------------------------------------------- Rows & controls
export function ListRow({ icon, title, subtitle, right, onPress, danger, iconFill }: { icon?: IconName; title: string; subtitle?: string; right?: ReactNode; onPress?: () => void; danger?: boolean; iconFill?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} className="flex-row items-center gap-3.5 min-h-[56px] py-2.5 active:opacity-70">
      {icon ? (
        <View className={cx('w-10 h-10 rounded-xl items-center justify-center', danger ? 'bg-danger-soft' : 'bg-primary-soft')}>
          <Icon name={icon} fill={iconFill} className={cx(danger ? 'text-danger-red' : 'text-primary', 'text-[22px]')} />
        </View>
      ) : null}
      <View className="flex-1 min-w-0">
        <Text className={cx('font-body-lg text-body-lg', danger ? 'text-danger-red' : 'text-on-surface')}>{title}</Text>
        {subtitle ? <Text numberOfLines={2} className="font-caption text-caption text-text-muted">{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron_right" className="text-text-muted text-[22px]" /> : null)}
    </Pressable>
  );
}

export function SwitchRow({ title, subtitle, value, onValueChange }: { title: string; subtitle?: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center gap-3 min-h-[56px]">
      <View className="flex-1">
        <Text className="font-body-lg text-body-lg text-on-surface">{title}</Text>
        {subtitle ? <Text className="font-caption text-caption text-text-muted">{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#0B6E4F', false: '#E6E1D9' }} thumbColor="#FFFFFF" accessibilityLabel={title} />
    </View>
  );
}

/** Pill stepper per DESIGN.md §6: primary-soft fill, emerald icons. */
export function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const btn = (icon: IconName, next: number, label: string, off: boolean) => (
    <Pressable onPress={() => onChange(next)} disabled={off} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} className={cx('w-8 h-8 items-center justify-center', off && 'opacity-40')}>
      <Icon name={icon} className="text-primary text-[18px]" />
    </Pressable>
  );
  return (
    <View className="flex-row items-center bg-primary-soft rounded-full px-1 py-0.5">
      {btn('remove', value - 1, 'Decrease', value <= min)}
      <Text className="w-6 text-center font-body-lg text-body-lg text-primary">{value}</Text>
      {btn('add', value + 1, 'Increase', value >= max)}
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View className="flex-row bg-surface-alt rounded-xl p-1 h-12" accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            className={cx('flex-1 rounded-lg flex-row items-center justify-center gap-1.5', on && 'bg-surface-card shadow-sm')}
          >
            <Text className={cx('font-body-lg text-body-lg', on ? 'text-on-surface' : 'text-text-muted')}>{o.label}</Text>
            {o.count != null ? (
              <View className={cx('px-1.5 rounded-full', on ? 'bg-primary-container' : 'bg-surface-container-high')}>
                <Text className={cx('text-[11px] font-bold', on ? 'text-on-primary' : 'text-text-muted')}>{o.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({ title, action, onAction, icon, iconClassName, subtitle }: { title: string; action?: string; onAction?: () => void; icon?: IconName; iconClassName?: string; subtitle?: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          {icon ? <Icon name={icon} fill className={iconClassName ?? 'text-warning-amber text-[20px]'} /> : null}
          <Text accessibilityRole="header" className="font-headline-sm text-headline-sm text-on-surface">{title}</Text>
        </View>
        {subtitle ? <Text className="font-caption text-caption text-text-muted">{subtitle}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" className="min-h-[48px] justify-center pl-3 active:opacity-70">
          <Text className="font-caption text-caption text-primary font-semibold">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- States
export function EmptyState({ icon = 'storefront', title, body, action, onAction }: { icon?: IconName; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <View className="items-center py-10 px-6 gap-2.5">
      <View className="w-[72px] h-[72px] rounded-full bg-primary-soft items-center justify-center">
        <Icon name={icon} className="text-primary text-[32px]" />
      </View>
      <Text className="font-headline-sm text-headline-sm text-on-surface text-center">{title}</Text>
      {body ? <Text className="font-body-md text-body-md text-text-muted text-center">{body}</Text> : null}
      {action && onAction ? <Button title={action} onPress={onAction} className="mt-2" /> : null}
    </View>
  );
}

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center p-10 bg-surface">
      <ActivityIndicator color="#0B6E4F" size="large" />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return <EmptyState icon="cloud_off" title={message ?? t('errors.generic')} action={onRetry ? t('common.retry') : undefined} onAction={onRetry} />;
}

export function StatTile({ label, value, icon, tone = 'primary', hint }: { label: string; value: string | number; icon: IconName; tone?: 'primary' | 'accent' | 'info'; hint?: string }) {
  const c = { primary: ['bg-primary-soft', 'text-primary'], accent: ['bg-warning-soft', 'text-warning-amber'], info: ['bg-info-soft', 'text-info-blue'] }[tone];
  return (
    <View className="flex-1 bg-surface-card rounded-xl p-space-md gap-2 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className={cx('w-9 h-9 rounded-lg items-center justify-center', c[0])}>
          <Icon name={icon} fill className={cx(c[1], 'text-[20px]')} />
        </View>
        {hint ? <Text className="font-label-sm text-label-sm text-text-muted">{hint}</Text> : null}
      </View>
      <Text className="font-headline-lg text-headline-lg text-on-surface">{value}</Text>
      <Text className="font-caption text-caption text-text-muted">{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------- Plain screen (for flows without a Stitch mock)
export function Screen({
  title,
  subtitle,
  children,
  footer,
  scroll = true,
  refreshControl,
  right,
  onBack,
  contentClassName,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
  right?: ReactNode;
  onBack?: () => void;
  contentClassName?: string;
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {title != null ? <SubHeader title={title} subtitle={subtitle} right={right} onBack={onBack} /> : null}
        {scroll ? (
          <ScrollView className="flex-1" contentContainerClassName={contentClassName ?? 'p-margin gap-space-lg pb-8'} keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
            {children}
          </ScrollView>
        ) : (
          <View className={cx('flex-1', contentClassName ?? 'p-margin')}>{children}</View>
        )}
        {footer ? (
          <View className="px-margin py-3 bg-surface-card/95" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 6 }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
