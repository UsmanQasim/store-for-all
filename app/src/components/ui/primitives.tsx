import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text as RNText,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextProps as RNTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { TOUCH_TARGET, useAppTheme, type ThemeColors, type TypographyVariant } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// ---------------------------------------------------------------- Text
type TextProps = RNTextProps & { variant?: TypographyVariant; color?: keyof ThemeColors; align?: TextStyle['textAlign'] };

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors, typography } = useAppTheme();
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------- Button
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = 'primary', size = 'md', icon, loading, fullWidth, disabled, style, ...rest }: ButtonProps) {
  const { colors, radius } = useAppTheme();
  const map: Record<ButtonVariant, { bg: string; fg: string; pressed: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary, pressed: colors.primaryPressed },
    accent: { bg: colors.accent, fg: colors.onAccent, pressed: colors.accent },
    secondary: { bg: colors.surface, fg: colors.text, pressed: colors.surfaceAlt, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primary, pressed: colors.primarySoft },
    danger: { bg: colors.dangerSoft, fg: colors.danger, pressed: colors.dangerSoft },
  };
  const c = map[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: size === 'md' ? 52 : 40,
          paddingHorizontal: size === 'md' ? 20 : 14,
          borderRadius: radius.md,
          backgroundColor: pressed ? c.pressed : c.bg,
          borderWidth: c.border ? 1 : 0,
          borderColor: c.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: isDisabled ? 0.55 : 1,
          alignSelf: fullWidth ? 'stretch' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'md' ? 20 : 16} color={c.fg} /> : null}
          <Text variant={size === 'md' ? 'bodyStrong' : 'caption'} style={{ color: c.fg }}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------- IconButton
export function IconButton({
  icon,
  label,
  onPress,
  color,
  background,
  size = 22,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  color?: string;
  background?: string;
  size?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        width: TOUCH_TARGET - 4,
        height: TOUCH_TARGET - 4,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background ?? (pressed ? colors.surfaceAlt : 'transparent'),
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

// ---------------------------------------------------------------- Input
type InputProps = TextInputProps & { label?: string; error?: string | null; hint?: string; leftIcon?: IconName };

export const Input = forwardRef<TextInput, InputProps>(function Input({ label, error, hint, leftIcon, style, ...rest }, ref) {
  const { colors, radius, typography } = useAppTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="caption" color="textMuted">{label}</Text> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: rest.multiline ? 'flex-start' : 'center',
          minHeight: TOUCH_TARGET + 4,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={20} color={colors.textMuted} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          style={[
            typography.body,
            { flex: 1, color: colors.text, paddingVertical: 12, minHeight: rest.multiline ? 96 : undefined, textAlignVertical: rest.multiline ? 'top' : 'center' },
            style,
          ]}
          {...rest}
        />
      </View>
      {error ? (
        <Text variant="caption" color="danger">{error}</Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted">{hint}</Text>
      ) : null}
    </View>
  );
});

// ---------------------------------------------------------------- Card
export function Card({ style, padded = true, ...rest }: ViewProps & { padded?: boolean }) {
  const { colors, radius, shadow } = useAppTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.surface, borderRadius: radius.lg, padding: padded ? 16 : 0, borderWidth: 1, borderColor: colors.border },
        shadow.card,
        style,
      ]}
      {...rest}
    />
  );
}

export function PressableCard({ children, style, ...rest }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, radius, shadow } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
        shadow.card,
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------- Chip
export function Chip({ label, selected, icon, onPress }: { label: string; selected?: boolean; icon?: IconName; onPress?: () => void }) {
  const { colors, radius } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        backgroundColor: selected ? colors.primary : pressed ? colors.surfaceAlt : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
      })}
    >
      {icon ? <Ionicons name={icon} size={16} color={selected ? colors.onPrimary : colors.textMuted} /> : null}
      <Text variant="caption" style={{ color: selected ? colors.onPrimary : colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Badge
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const { colors, radius } = useAppTheme();
  const m: Record<Tone, [string, string]> = {
    neutral: [colors.surfaceAlt, colors.textMuted],
    primary: [colors.primarySoft, colors.primary],
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
    info: [colors.infoSoft, colors.info],
  };
  const [bg, fg] = m[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text variant="label" style={{ color: fg }}>{label}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

export function Row({ style, ...rest }: ViewProps) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]} {...rest} />;
}
