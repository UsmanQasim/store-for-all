/**
 * NativeWind-aware primitives used by every screen. Screens are ported from the
 * Stitch HTML (Tailwind classes kept verbatim), so these three components make
 * `className` behave like it does in the browser:
 *  - Text: maps font-weight → the matching Plus Jakarta Sans file (Android can't synthesize weights).
 *  - Icon: Material Symbols (same set as Stitch) as SVG; `text-*` color/size classes size & tint it.
 *  - Image: expo-image with className support.
 */
import { Image as ExpoImage, type ImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';
import { forwardRef } from 'react';
import { Platform, StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ICONS, type IconName } from './icon-paths';

export type { IconName };

const FAMILY: Record<string, string> = {
  '100': 'PlusJakartaSans_400Regular',
  '200': 'PlusJakartaSans_400Regular',
  '300': 'PlusJakartaSans_400Regular',
  '400': 'PlusJakartaSans_400Regular',
  normal: 'PlusJakartaSans_400Regular',
  '500': 'PlusJakartaSans_500Medium',
  '600': 'PlusJakartaSans_600SemiBold',
  '700': 'PlusJakartaSans_700Bold',
  bold: 'PlusJakartaSans_700Bold',
  '800': 'PlusJakartaSans_800ExtraBold',
  '900': 'PlusJakartaSans_800ExtraBold',
};

/** Resolve font family from weight so `font-semibold` etc. render the right file on every platform. */
export function fontStyle(style: TextProps['style']) {
  // Web: classes become real CSS (Plus Jakarta Sans @font-face per weight is registered in _layout).
  if (Platform.OS === 'web') return style;
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = String(flat.fontWeight ?? '400');
  return [{ color: '#1d1b18' }, flat, { fontFamily: FAMILY[weight] ?? FAMILY['400'], fontWeight: undefined }];
}

function TextBase({ style, ...rest }: TextProps) {
  return <RNText maxFontSizeMultiplier={1.3} {...rest} style={fontStyle(style)} />;
}
export const Text = cssInterop(TextBase, { className: 'style' });

const InputBase = forwardRef<RNTextInput, TextInputProps>(function InputBase({ style, ...rest }, ref) {
  return <RNTextInput ref={ref} placeholderTextColor="#6B645C" maxFontSizeMultiplier={1.3} {...rest} style={fontStyle(style)} />;
});
export const TextInput = cssInterop(InputBase, { className: 'style' });

type IconProps = { name: IconName; size?: number; color?: string; fill?: boolean; accessibilityLabel?: string; className?: string };
function IconBase({ name, size = 24, color = '#1d1b18', fill, accessibilityLabel, className }: IconProps) {
  const paths = ICONS[name] as readonly string[];
  if (Platform.OS === 'web') {
    // On web NativeWind keeps className as CSS: size via font-size (1em), tint via currentColor.
    return (
      <RNText className={/text-\[\d/.test(className ?? '') ? className : `text-[24px] ${className ?? ''}`} style={{ lineHeight: 0, display: 'flex' } as never} accessibilityLabel={accessibilityLabel}>
        <Svg width="1em" height="1em" viewBox="0 -960 960 960">
          <Path d={(fill && paths[1]) || paths[0]} fill="currentColor" />
        </Svg>
      </RNText>
    );
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    >
      <Path d={(fill && paths[1]) || paths[0]} fill={color} />
    </Svg>
  );
}
export const Icon = Platform.OS === 'web' ? IconBase : cssInterop(IconBase, {
  className: { target: false, nativeStyleToProp: { color: 'color', fontSize: 'size' } },
});

export const Image = cssInterop(ExpoImage, { className: 'style' }) as unknown as (
  p: ImageProps & { className?: string },
) => React.ReactElement;

export const SafeAreaView = cssInterop(RNSafeAreaView, { className: 'style' });
